# Pagex Privacy Policy (EN)

Last updated: `2026-04-16`

## Overview

Pagex is a Chrome extension that extracts structured page data into JSON, captures full-page screenshots, and exports cookies — all locally on your device.

The current product behavior in this repository is:

- all processing runs entirely in the browser
- results are stored in extension session storage for status and summary purposes
- output is downloaded as a file only after the user explicitly clicks a button
- the extension does not send any data to a remote server

## Information we process

When you use Pagex, the extension may process:

- the URL and title of the selected page
- visible page content
- expandable or hidden page content that can be safely collected
- DOM structure, frame metadata, filtered attributes, and limited style summaries
- extension session state such as parse status, summary data, and the last generated payload
- viewport screenshots captured via the Chrome tabs API
- cookies, localStorage, and sessionStorage for the selected tab (only when you click "Get cookies.txt")

## Information we do not intentionally collect

Pagex is designed to avoid broad collection of unnecessary sensitive data.

The current implementation:

- filters many attributes by default
- redacts sensitive attribute names
- removes query strings and hashes from exported `href` and `src` values
- does not upload extracted content, screenshots, or cookies to a remote backend
- does not run background processes or schedule periodic data collection

## Permissions

Pagex uses the following Chrome permissions:

- `activeTab`
- `cookies`
- `scripting`
- `storage`
- `tabs`
- `webNavigation`
- optional host permissions, requested only when the user interacts with a selected site origin

These permissions are used to:

- identify the selected tab
- inject the page collector
- capture visible tab screenshots for full-page stitching
- read cookies for the selected tab on user request
- inspect frame coverage
- store session state for the popup
- request site access only when needed

## Data storage

Pagex stores parse state and result metadata in extension session storage.

This storage is local to the extension environment and is used to:

- restore parse status when the popup is reopened
- show parse summaries such as size, frame count, and warnings
- keep the latest payload available for user-triggered download

## Downloaded files

Pagex saves files to your default download folder only when you explicitly click a download or export button:

- **JSON extraction**: `pagex-{hostname}-{timestamp}.json`
- **Full-page screenshot**: `pagex-screenshot-{hostname}-{timestamp}.png`
- **Cookie export**: `cookies-{hostname}.txt` (includes localStorage and sessionStorage)

## Data sharing

Pagex does not share any data with remote services. All processing happens locally.

If a future version adds remote processing, analytics, or cloud sync, this privacy policy and the Chrome Web Store privacy fields must be updated before release.

## Your choices

You can:

- choose which tab to parse, screenshot, or export cookies from
- deny optional site access
- stop a running extraction at any time
- close the popup without downloading output
- uninstall the extension at any time

## Contact

- Developer / organization: `host452b`
- Support page: `https://github.com/host452b/pagex/issues`
- Website: `https://github.com/host452b/pagex`
