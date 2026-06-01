const fetch = require('node-fetch');

const CC_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.codechef.com/'
};

async function run() {
  try {
    const res = await fetch('https://www.codechef.com/users/lokesh_r', { headers: CC_HEADERS });
    const html = await res.text();
    
    // Find where solved problems or numbers are listed
    console.log("HTML length:", html.length);
    
    // Let's print occurrences of "Solved" or numbers near it
    const regex = /([^\n]{0,80}solved[^\n]{0,80})/gi;
    const matches = html.match(regex);
    if (matches) {
      console.log("Found matches containing 'solved':");
      matches.slice(0, 15).forEach((m, i) => console.log(`${i}: ${m.trim()}`));
    } else {
      console.log("No matches for 'solved'");
    }
  } catch (err) {
    console.error(err);
  }
}

run();
