import { handler as picksHandler } from "./picks.mjs";

const SPORTS=[
  "NBA","NFL","NHL","NCAAF","NCAAB",
  "Soccer","Tennis","UFC","MLB","WNBA"
];

const MARKETS=["h2h","spreads","totals"];

export async function handler(){
  const token=process.env.ODDS_REFRESH_TOKEN;

  if(!token){
    console.error("Missing ODDS_REFRESH_TOKEN");
    return {statusCode:503,body:"Refresh token missing"};
  }

  // Rotate one combination per run to limit execution time.
  const slot=Math.floor(Date.now()/900000);
  const index=slot%(SPORTS.length*MARKETS.length);

  const sport=SPORTS[Math.floor(index/MARKETS.length)];
  const market=MARKETS[index%MARKETS.length];

  try{
    const response=await picksHandler({
      httpMethod:"GET",
      headers:{authorization:"Bearer "+token},
      queryStringParameters:{
        sports:sport,
        markets:market,
        refresh:"1",
        noAI:"1"
      }
    });

    const data=JSON.parse(response.body||"{}");

    const result={
      sport,
      market,
      status:response.statusCode,
      picks:data.picks?.length||0,
      errors:data.errors||[],
      message:data.message||null
    };

    console.log("Scheduled refresh:",JSON.stringify(result));

    return {
      statusCode:response.statusCode,
      body:JSON.stringify(result)
    };
  }catch(error){
    console.error("Scheduled refresh failed:",error);
    return {statusCode:500,body:"Refresh failed"};
  }
}
