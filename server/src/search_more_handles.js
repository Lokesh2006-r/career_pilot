const fetch = require('node-fetch');

const cfHandles = [
  'LokeshR',
  'lokeshr',
  'Lokesh2006',
  'lokesh2006',
  'Lokesh_2006',
  'lokesh_2006',
  'Lokesh-2006',
  'lokesh-2006',
  'lokesh2006r',
  'lokesh_2006_r',
  'lokesh_r_2006',
  'lokesh_123',
  'Lokesh_123',
  'lokesh_123_',
  'Lokesh_123_',
  'lokesh123_',
  'Lokesh123_',
  'lokesh_r_',
  'Lokesh_R_',
  'LokeshR2006',
  'lokeshr2006'
];

async function checkCodeforces(handle) {
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const json = await res.json();
    if (json.status === 'OK') {
      const u = json.result[0];
      console.log(`[Codeforces] ${handle} -> rating: ${u.rating}, maxRating: ${u.maxRating}, rank: ${u.rank}`);
    }
  } catch (err) {}
}

async function checkCodeChef(username) {
  const CC_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.codechef.com/'
  };
  try {
    const res = await fetch(`https://www.codechef.com/users/${username}`, { headers: CC_HEADERS });
    if (!res.ok) return;
    const html = await res.text();
    let rating = 0;
    const ratingM = html.match(/class="rating-number"\s*>\s*(\d+)/i);
    if (ratingM) rating = parseInt(ratingM[1], 10);
    let highest = 0;
    const highM = html.match(/\(Highest Rating\s+(\d+)\)/i);
    if (highM) highest = parseInt(highM[1], 10);
    const exists = html.includes('rating-number') || html.includes('Highest Rating');
    if (exists) {
      console.log(`[CodeChef] ${username} -> rating: ${rating}, highest: ${highest}`);
    }
  } catch (err) {}
}

async function run() {
  console.log("Checking more handles on Codeforces...");
  for (const h of cfHandles) {
    await checkCodeforces(h);
  }
  console.log("Checking more handles on CodeChef...");
  for (const h of cfHandles) {
    await checkCodeChef(h);
  }
  console.log("Done checking.");
}

run();
