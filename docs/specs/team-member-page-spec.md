# Team Member Page — Custom (metaobject-driven) Spec

> Stage: BA. Status: **READY-FOR-PLAN**. Owner (BA): Daniel (Daniel@makroagency.com). Ticket: n/a.

## Goal & scope
- **Goal:** Content requirement — publish an "our team" section of the site: one profile page per team member and a listing page that shows and links to all of them.
- **In scope:**
  - Metaobject definition `Team Member` (fields: name, designation, description, gallery).
  - Metaobject-system profile page per entry (custom metaobject template).
  - Dedicated listing page template (`page.team.json` or a `templates/page.team.liquid` route) showing all members in a grid, each card linking to its profile page.
- **Out of scope:** Social/contact links on the profile (not requested — can be added later as a metaobject field). Reusable/theme-editor section version of the listing (dedicated template only, per decision). Lightbox/zoom on the gallery. Multi-image carousel.
- **Definition of done:** Store admin can, without dev help, add/edit/remove/reorder team members from Settings → Custom data → Team Member, and see them reflected on the listing page (in the chosen manual order) and on each member's own profile page, including correct fallback behavior for missing images and zero entries.

## Design references
- **Figma frames:** No design — propose during build, following existing theme visual conventions (typography scale, spacing, card style already used elsewhere in the theme).
- **Tokens / variables:** Reuse existing theme design tokens (colors, type scale, spacing) — no new tokens introduced.
- **Responsive breakpoints:** Theme standard (mobile / tablet / desktop) — grid reflows per breakpoint (see Sections table).

## Sections & blocks

| Section | Purpose | Blocks / components | States (default · hover · loading · empty · error) |
|---------|---------|---------------------|----------------------------------------------------|
| Team listing grid (dedicated page template) | Show all published team members, linking each to their profile page | Card component: image (gallery[0]), name, designation. Grid: 4-col desktop / 2-col tablet / 1-col mobile | Default: full grid. Hover: card hover affordance (theme-standard). Loading: n/a (server-rendered Liquid). Empty (card has no gallery image): image area hidden, text-only card. Empty (zero team members exist): entire listing page/section hidden — no heading, no empty-state message. |
| Team member profile (metaobject-system template) | Show one member's full detail | Name (heading), designation (subheading), description (rich text), gallery (static image grid) | Default: all fields render. Empty (no gallery images): gallery block hidden entirely. Empty (no description): omit description block. Error: n/a (metaobject-system page 404s naturally if entry unpublished). |

## Data model (intent)
> Intent only — the Tech Lead reconciles against existing definitions.

| Field | Desired storage (setting · metafield · metaobject · tag) | Type | Owner | Who enters the data |
|-------|----------------------------------------------------------|------|-------|---------------------|
| Name | metaobject field (`team_member.name`) | Single line text, translatable | Store admin | Store admin / marketing staff via Settings → Custom data → Team Member |
| Designation | metaobject field (`team_member.designation`) | Single line text, translatable | Store admin | Store admin / marketing staff |
| Description | metaobject field (`team_member.description`) | Rich text, translatable | Store admin | Store admin / marketing staff |
| Gallery | metaobject field (`team_member.gallery`) | List of files (image validation), no fixed max | Store admin | Store admin / marketing staff |
| Card thumbnail | derived — no separate field | n/a (uses `gallery[0]`) | n/a | n/a |
| Listing order | metaobject entry order (Shopify admin drag order) | n/a | Store admin | Store admin drags entries in Settings → Custom data → Team Member |

## Content & edge cases
- **Long text:** description (rich text) has no enforced length cap in the metaobject — profile page layout must not break on long bios (wrap, no fixed-height clipping).
- **Missing image (no gallery entries):** card thumbnail area and profile gallery block are both hidden entirely (no placeholder image) — text-only rendering.
- **0 / 1 / many gallery images:** grid must render correctly for 1 image (no orphaned grid gaps) and for many (wraps responsively, no fixed cap).
- **0 team members published:** listing page/section renders nothing — no heading, no empty-state copy.
- **1 team member published:** listing grid renders a single card correctly (no broken grid layout for a 1-item grid).
- **Many team members:** grid must paginate or scroll gracefully — no explicit pagination requested; assume all entries render in one grid (revisit if member count becomes large).
- **i18n:** name, designation, and description fields must be marked translatable in the metaobject definition so Shopify's translate & adapt can localize them per storefront language.

## Behavior & interactions
- Click a team member card on the listing page → navigates to that member's individual metaobject-system profile page.
- Profile page gallery → static grid, no click interaction (no lightbox/zoom).
- No other interactive behavior (no filtering, search, or sorting UI on the listing page — order is admin-controlled via metaobject entry order).

## Non-functional
- **Perf budget:** Theme-standard — lazy-loaded images below the fold, responsive `srcset`/`sizes` on all card and gallery images, no layout-shift (explicit width/height or aspect-ratio boxes).
- **a11y:** WCAG 2.1 AA — meaningful `alt` text per image (derived from member name where no explicit alt is captured), visible focus states on card links, sufficient color contrast for name/designation text.
- **Device/browser matrix:** Theme-standard — latest Chrome/Safari/Firefox desktop + mobile Safari/Chrome.

## Acceptance criteria (testable)
- [ ] A published `Team Member` metaobject entry with all 4 fields filled renders correctly on its own metaobject-system profile page (name, designation, description, gallery all visible).
- [ ] The listing page renders one card per published `Team Member` entry, in the order set by metaobject entry ordering in the admin.
- [ ] Each listing card's thumbnail equals that member's `gallery[0]`; clicking the card navigates to that member's profile page.
- [ ] A `Team Member` entry with zero gallery images shows no image element on either the card or the profile page (verified: no broken-image icon, no placeholder rendered).
- [ ] When zero `Team Member` entries exist, the listing page template renders no grid, no heading, and no empty-state message (empty body/section).
- [ ] A `Team Member` entry with a single gallery image renders a single-cell grid on the profile page with no layout artifacts (no dangling empty grid cells).
- [ ] Name, designation, and description fields are translatable and appear correctly when a secondary storefront language is selected (Shopify translate & adapt).
- [ ] All images on both templates have non-empty `alt` attributes and use responsive `srcset`.

## Open questions
