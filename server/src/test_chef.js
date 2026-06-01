const CC_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.codechef.com/',
};

async function test(username) {
  try {
    const res = await fetch(`https://www.codechef.com/users/${username}`, { headers: CC_HEADERS });
    if (!res.ok) return;
    const html = await res.text();
    let rating = 0;
    const ratingM = html.match(/class="rating-number"\s*>\s*(\d+)/i);
    if (ratingM) {
      rating = parseInt(ratingM[1], 10);
    }
    let highest = 0;
    const highM = html.match(/\(Highest Rating\s+(\d+)\)/i);
    if (highM) {
      highest = parseInt(highM[1], 10);
    }
    console.log(`[${username}] Rating:`, rating, 'Highest:', highest);
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  await test('lokesh2006-r');
}

run();
