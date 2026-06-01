const fetch = require('node-fetch');

const handles = [
  'Lokesh-123_',
  'Lokesh-123',
  'Lokesh_123',
  'Lokesh123',
  'lokesh',
  'lokesh2006',
  'lokesh_r',
  'Lokesh_R',
  'lokesh-r',
  'lokesh2006-r'
];

async function checkLeetCode(handle) {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({ query, variables: { username: handle } })
    });
    const json = await res.json();
    const user = json?.data?.matchedUser;
    if (user) {
      const solved = user.submitStatsGlobal?.acSubmissionNum?.find(x => x.difficulty === 'All')?.count || 0;
      console.log(`[LeetCode] Handle: ${handle} -> EXISTS, solved: ${solved}`);
    } else {
      console.log(`[LeetCode] Handle: ${handle} -> NOT FOUND`);
    }
  } catch (err) {
    console.log(`[LeetCode] Handle: ${handle} -> ERROR: ${err.message}`);
  }
}

async function checkCodeforces(handle) {
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const json = await res.json();
    if (json.status === 'OK') {
      const u = json.result[0];
      console.log(`[Codeforces] Handle: ${handle} -> EXISTS, rating: ${u.rating}, maxRating: ${u.maxRating}, rank: ${u.rank}`);
    } else {
      console.log(`[Codeforces] Handle: ${handle} -> NOT FOUND`);
    }
  } catch (err) {
    console.log(`[Codeforces] Handle: ${handle} -> ERROR: ${err.message}`);
  }
}

async function checkCodeChef(handle) {
  const CC_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.codechef.com/'
  };
  try {
    const res = await fetch(`https://www.codechef.com/users/${handle}`, { headers: CC_HEADERS });
    if (!res.ok) {
      console.log(`[CodeChef] Handle: ${handle} -> HTTP ${res.status}`);
      return;
    }
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
    const exists = html.includes('rating-number') || html.includes('Highest Rating');
    console.log(`[CodeChef] Handle: ${handle} -> EXISTS: ${exists}, rating: ${rating}, highest: ${highest}`);
  } catch (err) {
    console.log(`[CodeChef] Handle: ${handle} -> ERROR: ${err.message}`);
  }
}

async function run() {
  console.log("Checking handles...");
  for (const h of handles) {
    await checkLeetCode(h);
    await checkCodeforces(h);
    await checkCodeChef(h);
    console.log("-------------------");
  }
}

run();
