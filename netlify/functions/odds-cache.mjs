import { getStore } from "@netlify/blobs";
const store = () => getStore("swipepicks-odds-cache");
export async function readOdds(key) {
  try { return await store().get(key, { type: "json", consistency: "strong" }); }
  catch (error) { console.warn("Odds cache unavailable:", error.message); return null; }
}
export async function saveOdds(key, data) {
  try { await store().setJSON(key, { savedAt: Date.now(), data }); }
  catch (error) { console.warn("Odds cache write unavailable:", error.message); }
}
