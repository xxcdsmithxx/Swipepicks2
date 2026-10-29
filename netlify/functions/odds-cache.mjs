import { getStore } from "@netlify/blobs";

const STORE_NAME = "swipepicks-odds-cache";

function store() {
  const siteID = process.env.SWIPE_BLOBS_SITE_ID;
  const token = process.env.SWIPE_BLOBS_TOKEN;

  if (siteID && token) {
    return getStore({ name: STORE_NAME, siteID, token });
  }

  return getStore(STORE_NAME);
}

export async function readOdds(key) {
  try {
    return await store().get(key, {
      type: "json",
      consistency: "strong"
    });
  } catch (error) {
    console.error("Odds cache read failed:", error);
    throw new Error("ODDS_CACHE_READ_FAILED");
  }
}

export async function saveOdds(key, data) {
  try {
    await store().setJSON(key, {
      savedAt: Date.now(),
      data
    });

    const verified = await store().get(key, {
      type: "json",
      consistency: "strong"
    });

    if (!verified?.savedAt || !verified?.data) {
      throw new Error("Cache verification failed");
    }

    console.log("Odds cache verified:", key);
    return true;
  } catch (error) {
    console.error("Odds cache write failed:", error);
    throw new Error("ODDS_CACHE_WRITE_FAILED");
  }
}
