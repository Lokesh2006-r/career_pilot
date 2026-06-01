const fetch = require('node-fetch');

const handles = [
  'kit27_cse25',
  'kit27.cse25',
  'kit27',
  'cse25',
  'kit25'
];

async function checkCodeforces(handle) {
  try {
    const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const infoJson = await infoRes.json();
    if (infoJson.status === 'OK') {
      const u = infoJson.result[0];
      console.log(`[Codeforces] Handle: ${handle} -> rating: ${u.rating}, maxRating: ${u.maxRating}, rank: ${u.rank}`);
    } else {
      console.log(`[Codeforces] Handle: ${handle} -> NOT FOUND`);
    }
  } catch (err) {
    console.log(`[Codeforces] Handle: ${handle} -> ERROR: ${err.message}`);
  }
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
    if (!res.ok) {
      console.log(`[CodeChef] Handle: ${username} -> HTTP ${res.status}`);
      return;
    }
    const html = await res.text();
    let rating = 0;
    const ratingM = html.match(/class="rating-number"\s*>\s*(\d+)/i);
    if (ratingM) rating = parseInt(ratingM[1], 10);
    let highRating = 0;
    const highM = html.match(/\(Highest Rating\s+(\d+)\)/i);
    if (highM) highRating = parseInt(highM[1], 10);
    console.log(`[CodeChef] Handle: ${username} -> rating: ${rating}, highest: ${highRating}`);
  } catch (err) {
    console.log(`[CodeChef] Handle: ${username} -> ERROR: ${err.message}`);
  }
}

async function run() {
  for (const h of handles) {
    await checkCodeforces(h);
    await checkCodeChef(h);
    console.log("-------------------");
  }
}

run();
