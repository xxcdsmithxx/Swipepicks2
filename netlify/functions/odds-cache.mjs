import { getStore } from "@netlify/blobs";

const STORE_NAME = "swipepicks-odds-cache";

function store() {
  return getStore(STORE_NAME);
}

export async function readOdds(key) {
  try {
    const value = await store().get(key, {
      type: "json",
      consistency: "strong"
    });

    if (!value) {
      console.log("Odds cache miss:", key);
      return null;
    }

    console.log("Odds cache hit:", key);
    return value;
  } catch (error) {
    console.error("Odds cache read failed:", error);
    throw new Error("ODDS_CACHE_READ_FAILED");
  }
}

export async function saveOdds(key, data) {
  try {
    const payload = {
      savedAt: Date.now(),
      data
    };

    await store().setJSON(key, payload);

    const verified = await store().get(key, {
      type: "json",
      consistency: "strong"
    });

    if (!verified || !verified.savedAt || !verified.data) {
      throw new Error("Cache verification returned empty data");
    }

    console.log("Odds cache saved and verified:", key);
    return true;
  } catch (error) {
    console.error("Odds cache write failed:", error);
    throw new Error("ODDS_CACHE_WRITE_FAILED");
  }
}
