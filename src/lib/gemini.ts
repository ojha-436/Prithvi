import { GoogleGenerativeAI } from "@google/generative-ai";
import { httpsCallable } from "firebase/functions";
import type { FootprintResult, LifestyleInput, Recommendation } from "@/types";
import { generateRecommendations } from "./recommendations";
import { CATEGORY_META } from "./emissions";
import { formatCO2 } from "./utils";
import { functions } from "./firebase";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const modelName = (import.meta.env.VITE_GEMINI_MODEL as string) || "gemini-1.5-flash";

/**
 * Preferred path: a server-side callable Function holds the key (no secret in
 * the client). Enabled with VITE_GEMINI_VIA_FUNCTIONS=true.
 */
const viaFunctions = import.meta.env.VITE_GEMINI_VIA_FUNCTIONS === "true" && Boolean(functions);

/** Direct client SDK path — only for local dev, exposes the key in the bundle. */
const client = !viaFunctions && apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const isGeminiConfigured = viaFunctions || Boolean(apiKey);

/** Bill scanning needs the secure server function (image → Gemini Vision). */
export const isBillScanAvailable = Boolean(functions);

export interface BillScan {
  monthlyKwh: number | null;
  raw: { kwh: number | null; periodMonths: number | null };
}

/** Convert a raw bill reading into average monthly kWh. Pure + unit-tested. */
export function billToMonthlyKwh(kwh: number | null, periodMonths: number | null): number | null {
  if (!kwh || kwh <= 0) return null;
  const months = periodMonths && periodMonths > 0 ? periodMonths : 1;
  return Math.round(kwh / months);
}

async function fileToInlineData(file: File): Promise<{ data: string; mimeType: string }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("Could not read file"));
    r.readAsDataURL(file);
  });
  return { data: dataUrl.split(",")[1] ?? "", mimeType: file.type || "image/jpeg" };
}

/** Send a utility-bill image to the secure function; returns extracted usage. */
export async function extractBillData(file: File): Promise<BillScan> {
  if (!functions) throw new Error("Bill scanning is only available in the deployed app.");
  const image = await fileToInlineData(file);
  const fn = httpsCallable(functions, "geminiAdvise");
  const res = await fn({ kind: "bill", image });
  const raw = res.data as { kwh: number | null; periodMonths: number | null };
  return { monthlyKwh: billToMonthlyKwh(raw.kwh, raw.periodMonths), raw };
}

async function callAdvise(
  kind: "insight" | "recommend",
  footprint: FootprintResult,
  lifestyle?: LifestyleInput,
) {
  const fn = httpsCallable(functions!, "geminiAdvise");
  const res = await fn({ kind, footprint, lifestyle });
  return res.data as { text?: string; recommendations?: Recommendation[] };
}

export async function getRecommendations(
  input: LifestyleInput,
  footprint: FootprintResult,
): Promise<Recommendation[]> {
  const baseline = generateRecommendations(input, footprint);

  if (viaFunctions) {
    try {
      const data = await callAdvise("recommend", footprint, input);
      const cleaned = (data.recommendations ?? []).filter(
        (r) => CATEGORY_META[r.category] && r.title,
      );
      return cleaned.length ? cleaned : baseline;
    } catch (err) {
      console.warn("Gemini function failed, using engine fallback:", err);
      return baseline;
    }
  }

  if (!client) return baseline;
  try {
    const model = client.getGenerativeModel({ model: modelName });
    const prompt = `You are a climate advisor for an Indian user of the Prithvi app.
Their annual carbon footprint is ${formatCO2(footprint.total)} CO2e.
Breakdown (kg/yr): home ${footprint.breakdown.home}, travel ${footprint.breakdown.travel}, food ${footprint.breakdown.food}, goods ${footprint.breakdown.goods}.
Lifestyle: ${JSON.stringify(input)}.
Our engine already suggested: ${baseline.map((r) => r.title).join("; ")}.
Return 5 concrete, India-specific actions ranked by impact. Respond with ONLY a JSON array of objects:
[{"category":"home|travel|food|goods","title":"<short>","detail":"<one sentence, India-relevant>","estimatedSavingKg":<number>,"effort":"easy|medium|ambitious"}]`;
    const result = await model.generateContent(prompt);
    const text = result.response
      .text()
      .replace(/```json|```/g, "")
      .trim();
    const parsed = JSON.parse(text) as Array<Omit<Recommendation, "id" | "source">>;
    const cleaned = parsed
      .filter((r) => CATEGORY_META[r.category] && r.title)
      .map((r, i) => ({ ...r, id: `gemini-${i}`, source: "gemini" as const }));
    return cleaned.length ? cleaned : baseline;
  } catch (err) {
    console.warn("Gemini recommendations failed, using engine fallback:", err);
    return baseline;
  }
}

export async function getInsight(footprint: FootprintResult): Promise<string> {
  const vsIndia = Math.round((footprint.total / footprint.perCapitaIndia) * 100);
  const fallback =
    vsIndia > 100
      ? `Your footprint is about ${vsIndia}% of the average Indian's. The largest lever right now is your ${biggestCategory(footprint)} — small changes there move the needle fastest.`
      : `You're already below India's average per-capita footprint — strong work. Your next gains will come from your ${biggestCategory(footprint)}.`;

  if (viaFunctions) {
    try {
      const data = await callAdvise("insight", footprint);
      return data.text || fallback;
    } catch {
      return fallback;
    }
  }

  if (!client) return fallback;
  try {
    const model = client.getGenerativeModel({ model: modelName });
    const prompt = `In 2 warm, motivating sentences (no markdown), summarise this Indian user's yearly carbon footprint of ${formatCO2(
      footprint.total,
    )}. Breakdown kg/yr: home ${footprint.breakdown.home}, travel ${footprint.breakdown.travel}, food ${footprint.breakdown.food}, goods ${footprint.breakdown.goods}. India average is ${footprint.perCapitaIndia} kg.`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim() || fallback;
  } catch {
    return fallback;
  }
}

function biggestCategory(f: FootprintResult): string {
  const entries = Object.entries(f.breakdown) as [keyof typeof f.breakdown, number][];
  const top = entries.sort((a, b) => b[1] - a[1])[0][0];
  return CATEGORY_META[top].label.toLowerCase();
}
