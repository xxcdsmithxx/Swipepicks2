import { getStore } from "@netlify/blobs";

const store = () => getStore("swipepicks2-credit-usage");

export async function readCreditUsage() {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const month = day.slice(0, 7);
  const record = await store().get("usage", { type: "json", consistency: "strong" });
  return {
    day,
    month,
    dailyUsed: record?.day === day ? record.dailyUsed ?? 0 : 0,
    monthlyUsed: record?.month === month ? record.monthlyUsed ?? 0 : 0
  };
}

export async function recordCreditUsage(credits) {
  const amount = Math.max(0, Math.ceil(Number(credits) || 0));
  const storage = store();

  for (let attempt = 0; attempt < 8; attempt++) {
    const current = await storage.getWithMetadata("usage", {
      type: "json",
      consistency: "strong"
    });
    const day = new Date().toISOString().slice(0, 10);
    const month = day.slice(0, 7);
    const previous = current?.data || {};
    const updated = {
      day,
      month,
      dailyUsed: (previous.day === day ? previous.dailyUsed || 0 : 0) + amount,
      monthlyUsed: (previous.month === month ? previous.monthlyUsed || 0 : 0) + amount
    };

    try {
      const result = await storage.setJSON(
        "usage",
        updated,
        current ? { onlyIfMatch: current.etag } : { onlyIfNew: true }
      );
      if (result?.modified === false) continue;
      return updated;
    } catch (error) {
      if (attempt === 7) throw error;
    }
  }
  throw new Error("Credit counter update failed after retries");
}

export async function checkCreditLimits(estimatedCredits = 1) {
  const usage = await readCreditUsage();
  const estimated = Math.max(1, Math.ceil(Number(estimatedCredits) || 1));

  return {
    allowed:
      usage.dailyUsed + estimated <= 10 &&
      usage.monthlyUsed + estimated <= 400,
    dailyRemaining: Math.max(0, 10 - usage.dailyUsed),
    monthlyRemaining: Math.max(0, 400 - usage.monthlyUsed),
    ...usage
  };
}

