# Agent Desk (Champion_Challenger)

Static site for Netlify (`overwatchcc.netlify.app`): free agent tools, Power BI reports, and the `/portal/` workspace.

## What changed (2026-10-04 upgrade pass)
- **Portal is ad-free**: all ad units, the AdSense loader, the invented "house ads" and the 10-second removal timer are gone from `/portal/`.
- **AdSense loader only on `index.html`** (verification). Add it elsewhere only after the site is approved and each page has real content.
- **Real content pages**: `how-it-works.html` is now a full guide (anchors exist, screenshots have dimensions); `about.html` is distinct.
- **Placeholders fixed**: `[Your name]`, `yourdomain.com`, the `neflify.app` canonicals, the empty `mailto:` link.
- **Legal pages** rebuilt inside the site layout, renamed to Agent Desk, and the cookie/privacy text now matches what the site does.
- **Portal accessibility and layout**: labels, `main`, `h1`, frame title, `aria-current`, visible focus, contrast fixes, phone drawer under 900 px, report-frame loading/slow/retry states, guarded storage.
- **Guardrail**: `node scripts/preflight.mjs` (also runs in GitHub Actions) fails on placeholders, bad canonicals, ad code in the portal, duplicate pages, dead anchors and images without dimensions.

## Before you request AdSense review
1. Confirm the three Power BI embeds are cleared for public release (they use Publish to web links).
2. In AdSense, check Policy center for example URLs and turn Auto ads off for this site.
3. Add a consent management platform for EEA, UK and Swiss visitors.
4. Retake the tool screenshots in `img/` (they show the old portal look).
