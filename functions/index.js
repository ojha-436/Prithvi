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

    const { kind, footprint, lifestyle } = request.data || {};
    if (!footprint || typeof footprint.total !== "number") {
      throw new HttpsError("invalid-argument", "A valid footprint is required.");
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const b = footprint.breakdown || {};

    try {
      if (kind === "recommend") {
        const prompt = `You are a climate advisor for an Indian user. Annual footprint ${footprint.total} kg CO2e.
Breakdown kg/yr: home ${b.home}, travel ${b.travel}, food ${b.food}, goods ${b.goods}.
Lifestyle: ${JSON.stringify(lifestyle)}.
Return ONLY a JSON array of 5 India-specific actions ranked by impact:
[{"category":"home|travel|food|goods","title":"<short>","detail":"<one sentence>","estimatedSavingKg":<number>,"effort":"easy|medium|ambitious"}]`;
        const res = await model.generateContent(prompt);
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
      const res = await model.generateContent(prompt);
      return { text: res.response.text().trim() };
    } catch (err) {
      console.error("Gemini call failed", err);
      throw new HttpsError("internal", "Advisor temporarily unavailable.");
    }
  }
);
