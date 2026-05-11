# Makro Core Theme – README

**Connected Store:** `Makro Core Store`
URL: http://makro-core-store.myshopify.com/

Makro Core Theme is the canonical Shopify theme baseline for Makro Agency projects. It centralizes reusable sections, templates, snippets, and shared configuration so teams can build faster with consistent quality.

## Scope & Principles

* Single source of truth for common UX patterns, B2B primitives, and storefront plumbing
* Strict conventions → predictable structure, safer refactors, easy upgrades
* Backwards compatible where possible; changes are versioned and documented
* Theme Check and CI enforce style, accessibility, and performance gates

## Repository Layout

```
root/
├─ assets/                 # Compiled CSS/JS, fonts, icons, vendor bundles
├─ config/                 # settings_schema.json, settings_data.json (do not version env-specific data)
├─ layout/                 # theme.liquid, gift_card.liquid
├─ locales/                # en.default.json, fr.json, etc.
├─ sections/               # Reusable sections (product-grid.liquid, hero.liquid, ...)
├─ snippets/               # Small composables (price.liquid, badge.liquid, ...)
├─ templates/              # *.json templates for pages, products, collections, customers
├─ templates/customers/    # Customer auth templates
├─ blocks/                 # Optional: metafield-driven block registry (see below)
├─ src/                    # Source TS/JS/CSS before build (if using tooling)
├─ .github/                # Workflows, PR templates, issue templates
└─ tools/                  # Scripts (schema validate, sprite build, i18n checks)
```

## Naming Conventions

* Kebab-case for Liquid files: `product-card.liquid`, `cart-drawer.liquid`
* Section schema `name` is Title Case, `tag` optional but consistent
* Snippets prefixed by domain when helpful: `price.money.liquid`, `price.compare.liquid`
* JSON templates use `page.json`, `product.json`, `collection.json` and route-specific siblings: `product.b2b.json`
* Assets hashed in build output; source files named semantically: `theme.css`, `theme.ts`

## Development Workflow

1. Install Shopify CLI and log in

```bash
npm i
shopify theme dev
```

2. Lint, test, and type-check

```bash
npm run theme-check
npm run lint
npm run test
```

3. Preview with a development theme ID or local dev server

```bash
shopify theme dev --store makro-core-theme
```

4. Deploy via CI after checks pass

```bash
shopify theme push --unpublished --store makro-core-theme
```

## Global Variables (Design Tokens & Settings)

Makro Core Theme defines all global variables via **theme settings** and **tokenized CSS variables**. Settings live in `config/settings_schema.json` and are exposed to Liquid through `settings.*`, mirrored to CSS custom properties.

### Example Schema (`config/settings_schema.json`)

```json
[
  {
    "name": "Makro — Global",
    "settings": [
      {"type": "color", "id": "color_primary", "label": "Primary color", "default": "#0F172A"},
      {"type": "color", "id": "color_accent", "label": "Accent color", "default":
```
