# Pagex Chrome Web Store Listing (EN)

## Store identity

- Title: `Pagex`
- Suggested category: `Productivity`
- Suggested language: `English (primary)`

## Short summary

Extract page structure, hidden content, and style-aware text into clean JSON for AI workflows.

## Full description

Pagex is a Chrome extension for turning the current page into structured, AI-ready JSON.

It helps you collect visible content, hidden content, expandable sections, frame results, and lightweight style context without copying raw HTML by hand. The extension is built for people who need to move web content into AI, automation, or internal analysis workflows with a cleaner and more controlled payload.

### What Pagex does

- Parse the selected tab directly from the popup
- Expand common disclosure patterns such as `details`, `aria-expanded="false"`, and fragment-based collapse controls
- Trigger some lazy-loaded content by scrolling before extraction
- Collect DOM and shadow DOM nodes into structured JSON
- Merge accessible frame results and label skipped or failed frames clearly
- Filter sensitive attributes and remove query strings and hashes from exported `href` and `src` values
- Copy the final payload in one click

### Why it is useful

- Cleaner input for AI than copying raw page source
- Better support for hidden and expandable content
- Safer default export with compact structure and filtered attributes
- Local-first workflow for page extraction and clipboard handoff

### Output highlights

The exported payload can include:

- Page title and URL
- Frame metadata
- Element tags and filtered attributes
- Visibility and bounding box data
- Direct text and compact text fields
- Style summaries
- Warnings for skipped frames, truncation, or budget limits

## Permission explanation

- `activeTab`: lets Pagex work with the selected page
- `scripting`: injects the collector into the selected tab
- `storage`: stores parse status and result metadata in the extension session
- `tabs`: reads the selected tab information in the popup
- `webNavigation`: checks frame coverage for the current tab
- optional host access: requested only when you parse a selected site origin

## Suggested screenshots

Use these store screenshots:

1. `store-assets/screenshots/pagex-screenshot-01-target-tab-1280x800.png`
2. `store-assets/screenshots/pagex-screenshot-02-parsing-1280x800.png`
3. `store-assets/screenshots/pagex-screenshot-03-parse-complete-1280x800.png`
4. `store-assets/screenshots/pagex-screenshot-04-copy-json-1280x800.png`

## Suggested promo assets

- Small promo: `store-assets/promo/pagex-small-promo-440x280.png`
- Marquee: `store-assets/promo/pagex-marquee-1400x560.png`

## Support information

- Support page: `https://github.com/host452b/pagex/issues`
- Website: `https://github.com/host452b/pagex`
- Privacy policy URL: `https://github.com/host452b/pagex/blob/main/docs/store-listing/privacy-policy-en.md`
