# Recipe backlog queue

Source: family recipe-links channel dump (Sep 2026). Numbers are pre-assigned —
pages must use their assigned number in kicker + data-fragments/NNN.json.
Status: pending → done / blocked.

## Done
- 001 midnight-chili-oil-noodles
- 002 creamy-cajun-chicken-pasta
- 003 yukgaejang
- 004 japanese-cotton-cheesecake (Mai Cookbook YT)

## Batch A — fetchable web pages (agent A)
- 005 hot-dry-noodles — done (extracted from thewoksoflife.com)
- 006 sheet-pan-breakfast-pizza — done (extracted; cheese amounts set to 1 cup each, bacon pinned to 9 slices)
- 007 chocolate-chip-macadamia-shortbread — done (extracted; serves = 24 cookies)
- 008 rice-pudding — done (extracted; vanilla-extract fallback added)
- 009 german-potato-salad — done (WRITTEN FROM KNOWLEDGE — source page held a different, non-German recipe)

## Batch B — recipe text provided in channel dump (agent B)
- 010 stovetop-naan — done
- 011 gochujang-braised-beef — done (metric → US; 3⅓ cups stock)
- 012 silky-mac-and-cheese — done (Zach Choi credited)
- 013 protein-ice-cream — done (Ninja Creami required, stated in intro)
- 014 taco-loaded-potato-bowls — done (COMPLETED FROM PARTIAL CAPTION — amounts/toppings filled in, flagged in intro)
- 015 garlic-honey-chicken-blt — done (COMPLETED FROM PARTIAL CAPTION — all quantities invented, flagged in intro)

## Batch C — title-only copycats / classics, written from knowledge (agent C)
- 016 skillet-cornbread — done
- 017 gummy-bears — done (serves = ~100 bears; 24–48h air-dry after 45 min work)
- 018 buttermilk-biscuits — done (KFC-style, butter + letter folds)
- 019 campfire-mayo — done
- 020 glazed-donuts — done (yeast-raised, fried; effort ●●●)
- 021 ice-cream-bread — done
- 022 korean-bbq-beef — done (bulgogi-style; ground-beef variant in step 03)

## Batch D–H — YouTube extraction (serial, browser required)
### D (Sip and Feast + deli) — COMPLETE
- 023 deli-macaroni-salad — done (description + sipandfeast.com written recipe)
- 024 deli-potato-salad — done (site's ¾ tsp white pepper used over video's 1 tsp)
- 025 stovetop-mac-and-cheese — done (sodium citrate essential, no substitute)
- 026 pasta-alla-genovese — done
- 027 easy-pan-pizza — done (= New England bar pizza; serves 2 = two 10" pizzas)
### E — COMPLETE
- 028 mongolian-beef — done (creator's linked written recipe)
- 029 oklahoma-onion-burger — done (transcript-mined; NYT page paywalled — Kenji's techniques verbatim)
- 030 pepperoni-garlic-knots — done (Kenji's original on seriouseats.com)
- 031 general-tsos-chicken — done (full recipe in video description)
- 032 birria-tacos — done (creator's 16-step method; chile/spice AMOUNTS STANDARDIZED FROM KNOWLEDGE)
- 033 quesabirria-tacos — done (assembly-only page using 032's birria; WRITTEN FROM KNOWLEDGE, short had no text)
### F — COMPLETE
- 034 nashville-hot-chicken-trompo — done (trompo build from creator's site; hot rub/butter STANDARDIZED FROM KNOWLEDGE)
- 035 korean-milk-block-cake — done (full recipe from pinned comment; metric → US)
- 036 no-knead-focaccia — done (from Daen's Kitchen written recipe FutureCanoe made)
- 037 chili-garlic-noodles — done (amounts from description; method standard hot-oil technique)
- 038 moroccan-harira — done (WRITTEN FROM KNOWLEDGE — short had no text; classic harira)
- 039 beef-stroganoff — done (Pepper Belly Pete's own recipe via web capture; serves estimated 6)
### G — COMPLETE (all fully extracted, no knowledge fallbacks)
- 040 pierogi — done (Susan's Cooking School written recipe via description link)
- 041 doner-style-kebab — done (Allrecipes' own written page; yogurt/lemon "divided" split explicitly)
- 042 peanut-butter-bread — done (full narration transcript; 1932 in kicker; pinch of salt → ½ tsp)
- 043 strawberry-pretzel-salad — done (full transcript; big-box Jell-O → 6 oz, Cool Whip tub → 8 oz)
- 044 creamy-jalapeno-sauce — done (complete recipe in short's description)
- 045 blueberry-cheesecake-rolls — done (complete recipe in description, already US units)
### H (dessert shorts) — COMPLETE
- 046 christmas-brownies — done (reconstructed frame-by-frame from footage; cookie-dough-inside brownies)
- 047 air-fryer-smores-dip — done (WRITTEN FROM KNOWLEDGE — video has gone private)
- 048 marshmallow-popcorn — done (method from frames; AMOUNTS STANDARDIZED)
- 049 orange-chicken — done (full transcript; air-fryer version presented, deep-fry noted as original)

## Blocked (inaccessible sources — need user)
- high-protein-butter-chicken — Facebook reel, login-walled, no recipe text in dump
- budget-sausage-pasta — karissastevens_ IG reels ×2, captions contain no recipe

## Rules for agents
- Read CLAUDE.md and copy the structure of recipes/creamy-cajun-chicken-pasta.html exactly.
- US units (cups/tbsp/tsp, lb/oz), scalable `.qty` spans, subheads for grouped lists.
- Do NOT edit js/recipes.js. Write data-fragments/NNN.json instead:
  {"num":N,"slug":"...","title":"...","tags":[...],"time":"...","serves":N,"effort":1|2|3,"note":"extraction status"}
- Credit sources: link in intro + isBasedOn in JSON-LD.
- If a source can't be extracted, write a solid standard version from knowledge and say so in the fragment note.
- Reuse existing tags first: weeknight, spicy, 15-minute, 30-minute, vegetarian, pasta,
  korean, soup, beef, dessert, baking, japanese. Add sparingly: side, chicken, bread,
  sauce, grill, tex-mex, italian, etc.
