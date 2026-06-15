/**
 * Prithvi — server-side Gemini proxy.
 *
 * Why this exists: calling Gemini from the browser would expose the API key in
 * the client bundle. This callable Function keeps the key in a managed secret
 * (Secret Manager), requires an authenticated caller, and optionally enforces
 * Firebase App Check — so the key is never shipped to users.
 *
 * Deploy:  firebase functions:secrets:set GEMINI_API_KEY
 *          firebase deploy --only functions
 * (Requires the Blaze plan. The web app works without this via its built-in
 *  deterministic recommendation engine.)
 */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

const CATEGORIES = ["home", "travel", "food", "goods"];

// Gemini's free tier occasionally returns 503/429. Retry transient failures with
// a short backoff so users don't see a spurious error.
async function genWithRetry(model, content, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await model.generateContent(content);
    } catch (e) {
      lastErr = e;
      const status = e && (e.status || (e.cause && e.cause.status));
      if (status !== 503 && status !== 429) throw e;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw lastErr;
}

exports.geminiAdvise = onCall(
  {
    secrets: [GEMINI_API_KEY],
    region: "asia-south1",
    // App Check is configured (reCAPTCHA Enterprise) — reject unattested callers.
    enforceAppCheck: true,
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }

    const data = request.data || {};
    const { kind, footprint, lifestyle } = data;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    try {
      // Bill scanning (Gemini Vision): read electricity usage from a photo.
      if (kind === "bill") {
        const img = data.image;
        if (!img || !img.data || !img.mimeType) {
          throw new HttpsError("invalid-argument", "An image is required.");
        }
        if (img.data.length > 8_000_000) {
          throw new HttpsError("invalid-argument", "Image too large.");
        }
        const prompt = `This is a photo of an electricity or utility bill, likely from India. Extract:
- "kwh": total electricity consumed in units/kWh for the billing period (number)
- "periodMonths": how many months the bill covers (number, usually 1 or 2)
Respond with ONLY JSON: {"kwh": <number|null>, "periodMonths": <number|null>}. Use null if a value isn't visible.`;
        const res = await genWithRetry(model, [
          { inlineData: { data: img.data, mimeType: img.mimeType } },
          { text: prompt },
        ]);
        const text = res.response.text().replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(text);
        const kwh = typeof parsed.kwh === "number" && parsed.kwh > 0 ? parsed.kwh : null;
        const periodMonths =
          typeof parsed.periodMonths === "number" && parsed.periodMonths > 0 ? parsed.periodMonths : null;
        return { kwh, periodMonths };
      }

      if (!footprint || typeof footprint.total !== "number") {
        throw new HttpsError("invalid-argument", "A valid footprint is required.");
      }
      const b = footprint.breakdown || {};

      if (kind === "recommend") {
        const prompt = `You are a climate advisor for an Indian user. Annual footprint ${footprint.total} kg CO2e.
Breakdown kg/yr: home ${b.home}, travel ${b.travel}, food ${b.food}, goods ${b.goods}.
Lifestyle: ${JSON.stringify(lifestyle)}.
Return ONLY a JSON array of 5 India-specific actions ranked by impact:
[{"category":"home|travel|food|goods","title":"<short>","detail":"<one sentence>","estimatedSavingKg":<number>,"effort":"easy|medium|ambitious"}]`;
        const res = await genWithRetry(model, prompt);
        const text = res.response.text().replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(text);
        const recommendations = (Array.isArray(parsed) ? parsed : [])
          .filter((r) => CATEGORIES.includes(r.category) && typeof r.title === "string")
          .slice(0, 6)
          .map((r, i) => ({ ...r, id: `gemini-${i}`, source: "gemini" }));
        return { recommendations };
      }

      // default: narrative insight
      const prompt = `In 2 warm, motivating sentences (no markdown), summarise this Indian user's yearly carbon footprint of ${footprint.total} kg CO2e. Breakdown kg/yr: home ${b.home}, travel ${b.travel}, food ${b.food}, goods ${b.goods}. India average is ${footprint.perCapitaIndia || 2000} kg.`;
      const res = await genWithRetry(model, prompt);
      return { text: res.response.text().trim() };
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      console.error("Gemini call failed", err);
      throw new HttpsError("internal", "Advisor temporarily unavailable.");
    }
  }
);
