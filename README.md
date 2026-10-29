# Swipe Picks All-Sports — staging build

This is a NEW release package, not an in-place migration of the existing Swipe Picks application. Do not deploy over your live site until you have exported/backed up existing saved selections. This version uses a new localStorage namespace (`swipe_picks_all_sports_v1`) and does not import prior selections automatically.

## Features
- NBA, NFL, MLB, NHL, NCAAF, NCAAB, WNBA, soccer, tennis, UFC/MMA where provider lists active leagues
- DraftKings odds through The Odds API (moneyline, spreads, totals when supported)
- Sunset theme and cropped selected X/check/crown logo
- Swipe left pass, right parlay, up straight, down explanation; matching tap buttons
- Bet Sheet with remove actions, wager entry and approximate combined parlay return
- Optional local bankroll/unit calculator, reports, manual outcome marking, CSV export
- No fabricated true probabilities or positive EV claims

## Setup
1. Keep your existing site untouched until ready. Create a NEW Netlify staging site or deploy with `netlify deploy --dir=public --functions=netlify/functions` (without `--prod`) from this folder.
2. Set `ODDS_API_KEY` as a secret environment variable for the site; no API key is embedded in the browser.
3. Netlify functions use Node 18+ with native `fetch`.
4. Test `/api/picks?sports=NBA,NFL&markets=all` on the staging deployment, then test Analyze, swipes, Bet Sheet, CSV and PWA icon.
5. Back up existing data before any production replacement. Service worker cache is versioned.

## Known limits
- Player props are not yet implemented: they require separate event-level requests and provider market/plan coverage.
- Requests are capped at 12 active league keys per click to reduce quota consumption; `leaguesSkipped` lists omissions. Some soccer competitions may be skipped when all sports are selected.
- Tennis league discovery uses provider active `tennis_` keys; coverage varies.
- Picks are sorted by event start time, **not** by validated expected value. No independent win probability model is connected.
- Only DraftKings bookmaker data is returned. Empty responses are expected for off-season events, unavailable markets or coverage gaps.
- TheOddsAPI key quotas and function execution time may constrain broad requests. Some providers bill per sport and market combination.
- Bet Sheet parlay return is a mathematical approximation, not a confirmed bookable combination.
- No automated outcome grading, cross-device sync, notifications or wagering.

Update: multi-select collapsible sports dropdown; swipe-only pick actions; rating/recommendation placeholders until validated model data is supplied.
\nTinder deck update: dark theme, animated swipe cards, multiple sports, gesture-only pass/parlay/straight/details. Backend uses ODDS env var. No fabricated model scores.\n
Analyze overlay: opens fullscreen swipe card deck after successful fetch; close X and Escape; Resume swipe cards. No cards on main analyze page.

Final overlay: hide reviewed/remaining/progress bar; downward gesture toggles explanation without moving card.\n
Explanation button: swipe down disabled; button toggles explanation in place. Other swipe gestures unchanged.

Header update: app icon only on left; local outcome Hits/Misses on right; removed break-even and true probability from pick cards. Explanation remains a popup. No live odds/probability claims added.

AI beta: Netlify OPEN_AI API key; uses OpenAI Responses API web_search_preview to research up to 8 picks per request. Ratings are evidence confidence only, not true probability or validated EV. Fails closed to N/A on research errors. This may incur OpenAI web search/API charges and timeouts; verify live sports sources independently.

AI JSON fix: Responses API strict structured JSON output, reduced batch to four picks. Fails closed on missing evidence. Research-confidence scores are not win probabilities or established EV.
