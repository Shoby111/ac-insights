# Actualized Insights - Organized

A clean, searchable archive of all blog posts from [actualized.org/insights](https://www.actualized.org/insights).

## Setup

```bash
npm install
```

## Usage

### 1. Scrape all posts
```bash
npm run scrape
```
This fetches all 228+ pages and saves them to `posts.json`. Takes a few minutes (with polite delays between requests).

### 2. View the organized posts
```bash
npx serve .
```
Then open http://localhost:3000 in your browser.

## Features

- **Grouped by date** — posts organized chronologically
- **Collapsible** — click a title to expand/collapse the full text
- **Search** — filter posts by keyword instantly
- **Sort** — toggle between newest/oldest first
- **Direct links** — click ↗ to visit the original post
- **Dark theme** — easy on the eyes
