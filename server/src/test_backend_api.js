const fetch = require('node-fetch');

async function run() {
  try {
    const res = await fetch('http://localhost:5000/api/coding/profile?leetcode=Lokesh-123_&codeforces=Lokesh-123_&codechef=Lokesh-123_');
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
