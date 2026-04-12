# Pagex Privacy Policy (EN)

Last updated: `2026-04-11`

## Overview

Pagex is a Chrome extension that extracts structured page data from a user-selected tab into JSON for local workflow use.

The current product behavior in this repository is:

- page parsing runs in the browser
- results are stored in extension session storage for status and summary purposes
- output is copied to the clipboard only after the user explicitly clicks `COPY.JSON`
- the extension does not send page content to a remote server by default

## Information we process

When you use Pagex, the extension may process:

- the URL and title of the selected page
- visible page content
- expandable or hidden page content that can be safely collected
- DOM structure, frame metadata, filtered attributes, and limited style summaries
- extension session state such as parse status, summary data, and the last generated payload

## Information we do not intentionally collect

Pagex is designed to avoid broad collection of unnecessary sensitive data.

The current implementation:

- filters many attributes by default
- redacts sensitive attribute names
- removes query strings and hashes from exported `href` and `src` values
- does not upload extracted content to a remote backend by default

## Permissions

Pagex uses the following Chrome permissions:

- `activeTab`
- `scripting`
- `storage`
- `tabs`
- `webNavigation`
- optional host permissions, requested only when the user chooses to parse a site origin

These permissions are used to:

- identify the selected tab
- inject the page collector
- inspect frame coverage
- store session state for the popup
- request site access only when needed for parsing

## Data storage

Pagex stores parse state and result metadata in extension session storage.

This storage is local to the extension environment and is used to:

- restore parse status when the popup is reopened
- show parse summaries such as size, frame count, and warnings
- keep the latest payload available for user-triggered copy actions

## Clipboard

Pagex writes data to the clipboard only after the user explicitly clicks the copy action in the popup.

## Data sharing

Pagex does not share extracted page data with remote services by default.

If a future version adds remote processing, analytics, or cloud sync, this privacy policy and the Chrome Web Store privacy fields must be updated before release.

## Your choices

You can:

- choose which tab to parse
- deny optional site access
- close the popup without copying output
- uninstall the extension at any time

## Contact

- Developer / organization: `host452b`
- Support page: `https://github.com/host452b/pagex/issues`
- Website: `https://github.com/host452b/pagex`
