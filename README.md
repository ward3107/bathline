# BATHLINE — Market-calibrated conversion-first landing page

Changes in this build:
- Pricing recalibrated against current Israeli market references (Sep 2026)
- Competitive ranges are intentionally tighter and generally below common market ranges
- Quantity controls added for:
  - water/drain points
  - relocated water/drain points
  - electrical/lighting points
  - concealed mixers
- Floor remains up to 20 m²
- Walls remain up to 80 m²
- Typical complete-renovation estimate is designed to land in a credible, competitive band rather than looking suspiciously cheap
- Hebrew / Arabic / English / Russian preserved
- Conversion-first flow and WhatsApp estimate handoff preserved
- Up to 36 credit-card installments preserved

Pricing scope:
Labor + basic installation consumables. Finish products are excluded unless agreed otherwise.

## Development

Static site with no build step — open `index.html` directly, or serve the repository root with any static file server.

Run the test suite (engine math + price baseline, and boot-time language/theme precedence):

```
npm test
```

The tests live in `tests/` and cover the estimate engine, price-baseline parity, four-language content-key parity, and stored-preference fallbacks. Files not needed at runtime (tests, QA artifacts, notes) are excluded from the Vercel deploy via `.vercelignore`.

Phone / WhatsApp: 053-426-0632
