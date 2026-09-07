# Larry Fit v0.7

Personal fitness tracker for GitHub Pages + Google Sheets + Google Apps Script.

## v0.7 changes
- Renamed the app from Hockey Fit to **Larry Fit**.
- Strength exercises are logged **set by set**: reps + weight for every set.
- Plank is logged as seconds for every set.
- `Exercises` keeps the old min/max columns for compatibility and adds `sets_json` with the detailed set data.
- The last set-by-set result is shown when an exercise opens.
- Transparent strength progression: if all target reps were completed at the same weight, Larry suggests a small increase next time; near misses hold the weight; larger misses suggest a small reduction/technique focus.
- Larry Coach dashboard: 7-day weight trend, latest Zone-2 heart-rate guidance and latest strength progression cue.
- Zone-2 target HR is adjustable in Settings (initial default 125–140 bpm until enough personal data exists).
- Exercise video links/searches are tailored to the actual equipment: dumbbells + adjustable bench, Smith/Multipower, cable/Dual Adjustable Pulley and Roman-chair bench.
- Warm-up still logs time, level and displayed kcal.
- Strength A/B finish still logs average HR, max HR and RPE.

- Training type is now preselected automatically from the weekly plan when opening Training or changing the training date.
- Monday Kraft A, Tuesday Zone 2, Wednesday Kraft B, Friday Unihockey, Sunday HIIT.
- Thursday shows Ruhetag; Saturday shows Ruhetag / locker, while keeping manual training selection available.

## Update
1. Replace `index.html`, `app.js`, and `styles.css` on GitHub Pages.
2. Replace Apps Script `Code.gs` with `backend/Code.gs`.
3. Run `setup()` once. It adds `sets_json` to the existing `Exercises` sheet without deleting old data.
4. Apps Script: Deploy > Manage deployments > Edit > New version > Deploy.
5. Hard refresh the web app if the browser still shows an older version.

Existing data remains compatible. Old exercise rows without `sets_json` continue to display their min/max values.
