import { handler as picksHandler } from "./picks.mjs";

const DEFAULT_SPORTS = [
  "NBA","NFL","NHL","MLB",
  "NCAAF","NCAAB","WNBA","Soccer","Tennis","UFC"
];

export async function handler() {
  const token = process.env.ODDS_REFRESH_TOKEN;

  if (!token) {
    console.error("Scheduled refresh: ODDS_REFRESH_TOKEN missing");
    return { statusCode: 503, body: "Refresh not configured" };
  }

  const configured = process.env.SWIPE_REFRESH_SPORTS;
  const sports = configured
    ? configured.split(",").map(s=>s.trim()).filter(Boolean)
    : DEFAULT_SPORTS;

  const results = [];

  for (const sport of sports) {
    try {
      const response = await picksHandler({
        httpMethod: "GET",
        headers: { authorization: "Bearer " + token },
        queryStringParameters: {
          sports: sport,
          markets: "h2h",
          refresh: "1"
        }
      });

      const data = JSON.parse(response.body || "{}");

      results.push({
        sport,
        status: response.statusCode,
        games: data.gamesFound || 0,
        picks: data.picks?.length || 0,
        errors: data.errors || [],
        message: data.message || null
      });

    } catch (error) {
      results.push({sport,error:error.message});
    }
  }

  console.log("Scheduled odds refresh:",JSON.stringify(results));

  return {
    statusCode: 200,
    body: JSON.stringify({results})
  };
}
