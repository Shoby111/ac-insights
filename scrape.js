const cheerio = require('cheerio');
const fs = require('fs');

const BASE = 'https://www.actualized.org';
const INSIGHTS_URL = `${BASE}/insights`;

async function fetchPage(pageNum) {
  const url = pageNum === 1 ? INSIGHTS_URL : `${INSIGHTS_URL}?p=${pageNum}`;
  console.log(`Fetching page ${pageNum}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

function parsePage(html) {
  const $ = cheerio.load(html);
  const posts = [];

  $('.insights_container').each((i, el) => {
    const titleEl = $(el).find('.insights_title a');
    const title = titleEl.text().trim();
    const href = titleEl.attr('href');
    const link = href ? `${BASE}${href}` : '';
    const date = $(el).find('.insights_date strong').text().trim();
    const rawBody = $(el).find('.insights_body').html()?.trim() || '';
    const body = rawBody.replace(/src="\//g, `src="${BASE}/`);
    const bodyText = $(el).find('.insights_body').text()?.trim() || '';

    if (title || bodyText) {
      posts.push({ title, link, date, body: body, bodyText });
    }
  });

  return posts;
}

function getMaxPage(html) {
  const $ = cheerio.load(html);
  let max = 1;
  $('a[href*="insights?p="]').each((i, el) => {
    const href = $(el).attr('href');
    const match = href.match(/p=(\d+)/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > max) max = num;
    }
  });
  return max;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('Starting scrape of actualized.org/insights...\n');

  // Get first page to find total pages
  const firstHtml = await fetchPage(1);
  const maxPage = getMaxPage(firstHtml);
  console.log(`Found ${maxPage} pages total.\n`);

  const allPosts = [];

  // Parse first page
  allPosts.push(...parsePage(firstHtml));

  // Fetch remaining pages
  for (let p = 2; p <= maxPage; p++) {
    await sleep(500); // be nice to the server
    try {
      const html = await fetchPage(p);
      const posts = parsePage(html);
      allPosts.push(...posts);
      if (p % 20 === 0) {
        console.log(`  Progress: ${allPosts.length} posts scraped so far...`);
      }
    } catch (err) {
      console.error(`  Error on page ${p}: ${err.message}`);
    }
  }

  console.log(`\nDone! Total posts: ${allPosts.length}`);

  // Save
  fs.writeFileSync('posts.json', JSON.stringify(allPosts, null, 2), 'utf8');
  console.log('Saved to posts.json');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
