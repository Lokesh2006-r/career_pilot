import { Request, Response as ExpressResponse } from 'express';

// ─── LeetCode (public GraphQL, no key needed) ───────────────────────────────────

const LEETCODE_GQL = 'https://leetcode.com/graphql';

const LC_PROFILE_QUERY = `
  query getUserProfile($username: String!, $year: Int) {
    matchedUser(username: $username) {
      username
      profile {
        realName
        userAvatar
        ranking
        reputation
        starRating
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      userCalendar(year: $year) {
        streak
        totalActiveDays
        submissionCalendar
      }
    }
  }
`;

const LC_CONTEST_QUERY = `
  query userContestRanking($username: String!) {
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      topPercentage
    }
    userContestRankingHistory(username: $username) {
      attended
      rating
      ranking
      contest {
        title
        startTime
      }
    }
  }
`;

const LC_RECENT_QUERY = `
  query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      id
      title
      titleSlug
      timestamp
    }
  }
`;

async function fetchLeetCode(username: string, yearParam?: string | number) {
  const headers = {
    'Content-Type': 'application/json',
    'Referer': 'https://leetcode.com',
    'User-Agent': 'Mozilla/5.0',
  };

  const targetYear = yearParam && yearParam !== 'current' ? Number(yearParam) : undefined;

  // Profile + stats
  const profileRes = await fetch(LEETCODE_GQL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: LC_PROFILE_QUERY, variables: { username, year: targetYear } }),
  });
  const profileJson = await profileRes.json() as any;
  const user = profileJson?.data?.matchedUser;
  if (!user) throw new Error(`LeetCode user "${username}" not found`);

  const acStats: { difficulty: string; count: number }[] =
    user.submitStatsGlobal?.acSubmissionNum || [];
  const easy   = acStats.find((s: any) => s.difficulty === 'Easy')?.count   || 0;
  const medium = acStats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
  const hard   = acStats.find((s: any) => s.difficulty === 'Hard')?.count   || 0;
  const total  = easy + medium + hard;

  // Contest
  const contestRes = await fetch(LEETCODE_GQL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: LC_CONTEST_QUERY, variables: { username } }),
  });
  const contestJson = await contestRes.json() as any;
  const ranking = contestJson?.data?.userContestRanking;
  const history: any[] = (contestJson?.data?.userContestRankingHistory || [])
    .filter((h: any) => h.attended)
    .slice(-8)
    .map((h: any) => ({
      name:   h.contest?.title || 'Contest',
      date:   h.contest?.startTime
        ? new Date(h.contest.startTime * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '',
      rank:   h.ranking,
      rating: Math.round(h.rating),
      delta:  0, // will compute below
    }));

  // compute deltas
  for (let i = 1; i < history.length; i++) {
    history[i].delta = history[i].rating - history[i - 1].rating;
  }

  // Recent accepted
  const recentRes = await fetch(LEETCODE_GQL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: LC_RECENT_QUERY, variables: { username, limit: 10 } }),
  });
  const recentJson = await recentRes.json() as any;
  const recentAc: any[] = (recentJson?.data?.recentAcSubmissionList || []).map((s: any) => ({
    problem:    s.title,
    platform:   'LeetCode',
    difficulty: 'Medium',   // GraphQL doesn't return difficulty in this endpoint easily
    status:     'Accepted',
    time:       timeAgo(s.timestamp * 1000),
    url:        `https://leetcode.com/problems/${s.titleSlug}/`,
  }));

  const dailySubmissions: Record<string, number> = {};
  const calendar = JSON.parse(user.userCalendar?.submissionCalendar || '{}');
  for (const [ts, cnt] of Object.entries(calendar)) {
    const d = new Date(Number(ts) * 1000);
    const key = d.toISOString().split('T')[0];
    dailySubmissions[key] = (dailySubmissions[key] || 0) + (cnt as number);
  }

  return {
    username,
    avatar:     user.profile?.userAvatar || '',
    realName:   user.profile?.realName || username,
    solved:     total,
    easy,
    medium,
    hard,
    rating:     Math.round(ranking?.rating || 0),
    globalRank: ranking?.globalRanking || 0,
    topPct:     ranking?.topPercentage || 0,
    streak:     user.userCalendar?.streak || 0,
    totalActiveDays: user.userCalendar?.totalActiveDays || 0,
    submissionCalendar: calendar,
    dailySubmissions,
    contestHistory: history,
    recentSubmissions: recentAc,
  };
}

// ─── Codeforces (public REST, no key needed) ────────────────────────────────────

async function fetchCodeforces(handle: string) {
  const base = 'https://codeforces.com/api';

  const [infoRes, ratingRes, statusRes] = await Promise.all([
    fetch(`${base}/user.info?handles=${handle}`),
    fetch(`${base}/user.rating?handle=${handle}`),
    fetch(`${base}/user.status?handle=${handle}`),
  ]);

  const info   = await infoRes.json()   as any;
  const rating = await ratingRes.json() as any;
  const status = await statusRes.json() as any;

  if (info.status !== 'OK') throw new Error(`Codeforces user "${handle}" not found`);

  const user = info.result[0];
  const ratingHistory: any[] = (rating.result || []).slice(-8).map((r: any) => ({
    name:   r.contestName,
    date:   new Date(r.ratingUpdateTimeSeconds * 1000)
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rank:   r.rank,
    rating: r.newRating,
    delta:  r.newRating - r.oldRating,
  }));

  // Count unique solved problems and daily submissions
  const solved = new Set<string>();
  const recentSubs: any[] = [];
  const dailySubmissions: Record<string, number> = {};
  for (const s of (status.result || [])) {
    const key = `${s.problem?.contestId}-${s.problem?.index}`;
    if (s.verdict === 'OK') solved.add(key);
    if (s.creationTimeSeconds) {
      const d = new Date(s.creationTimeSeconds * 1000);
      const dateStr = d.toISOString().split('T')[0];
      dailySubmissions[dateStr] = (dailySubmissions[dateStr] || 0) + 1;
    }
    if (recentSubs.length < 8) {
      recentSubs.push({
        problem:    s.problem?.name || 'Unknown',
        platform:   'Codeforces',
        difficulty: cfRatingToDifficulty(s.problem?.rating),
        status:     s.verdict === 'OK' ? 'Accepted' : s.verdict === 'WRONG_ANSWER' ? 'WA' : s.verdict === 'TIME_LIMIT_EXCEEDED' ? 'TLE' : s.verdict || 'Unknown',
        time:       timeAgo(s.creationTimeSeconds * 1000),
        url:        `https://codeforces.com/contest/${s.contestId}/problem/${s.problem?.index}`,
      });
    }
  }

  return {
    handle,
    rating:      user.rating || 0,
    maxRating:   user.maxRating || 0,
    rank:        user.rank || 'unrated',
    maxRank:     user.maxRank || 'unrated',
    avatar:      user.avatar || '',
    solved:      solved.size,
    country:     user.country || '',
    ratingHistory,
    recentSubmissions: recentSubs,
    dailySubmissions,
  };
}

// ─── CodeChef — multi-strategy fetch ───────────────────────────────────────────
// Strategy 1: codechef-stats.onrender.com (2025 community API)
// Strategy 2: Parse CodeChef's /recent/user JSON endpoint for solved count
// Strategy 3: Parse rating from codechef.com/users/{username} HTML via regex

const CC_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.codechef.com/',
};

async function fetchCodeChef(username: string) {
  // ── Strategy 1: Try known working community APIs ────────────────────────────
  const communityApis = [
    `https://codechef-user-data.vercel.app/api/codechef?user=${username}`,
    `https://codechef2.vercel.app/handle/${username}`,
    `https://codeprofile.vercel.app/api/codechef/${username}`,
  ];

  for (const url of communityApis) {
    try {
      const res = await fetchWithTimeout(url, 6000, { 'User-Agent': 'Mozilla/5.0' });
      if (!res.ok) continue;
      const data = await res.json() as any;
      const rating = data.currentRating ?? data.rating ?? data.current_rating ?? 0;
      if (rating > 0) {
        return {
          username,
          rating,
          highRating:  data.highestRating ?? data.highest_rating ?? data.max_rating ?? 0,
          stars:       data.stars ?? ratingToStars(rating),
          solved:      data.totalProblemsSolved ?? data.solved ?? data.problems_solved ?? 0,
          globalRank:  data.globalRank ?? data.global_rank ?? 'N/A',
          countryRank: data.countryRank ?? data.country_rank ?? 'N/A',
          dailySubmissions: {},
        };
      }
    } catch { /* try next */ }
  }

  // ── Strategy 2: CodeChef's own /recent/user endpoint (always works, no auth) ─
  // This gives us submission history + max_page (proxy for activity)
  try {
    const recentRes = await fetchWithTimeout(
      `https://www.codechef.com/recent/user?page=0&user_handle=${username}`,
      8000,
      { ...CC_HEADERS, 'X-Requested-With': 'XMLHttpRequest' }
    );

    if (recentRes.ok) {
      const recentData = await recentRes.json() as any;
      const htmlContent: string = recentData.content || '';
      const maxPage: number = parseInt(recentData.max_page || '0', 10);

      // Parse recent submissions from HTML
      const rowMatches = htmlContent.matchAll(/<tr\s*>([\s\S]*?)<\/tr>/g);
      const recentSubs: any[] = [];
      const dailySubmissions: Record<string, number> = {};

      for (const row of rowMatches) {
        const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)];
        if (cells.length >= 3) {
          const dateTd = cells[0][0];
          const dateMatch = dateTd.match(/title='([^']+)'/);
          const dateTimeStr = dateMatch ? dateMatch[1] : '';

          const problemTd = cells[1][1];
          const problemMatch = problemTd.match(/href='\/([^/]+)\/problems\/([^']+)'/);
          const contest = problemMatch ? problemMatch[1] : '';
          const problem = problemMatch ? problemMatch[2] : '';

          const resultTd = cells[2][0];
          const spanMatch = resultTd.match(/<span\s+title='([^']+)'/i) || resultTd.match(/title='([^']+)'/i);
          const verdict = spanMatch ? spanMatch[1].toLowerCase() : '';

          if (dateTimeStr && problem) {
            let dateKey = '';
            const dateParts = dateTimeStr.match(/(\d{2})\/(\d{2})\/(\d{2})/);
            if (dateParts) {
              const day = dateParts[1];
              const month = dateParts[2];
              const year = '20' + dateParts[3];
              dateKey = `${year}-${month}-${day}`;
              dailySubmissions[dateKey] = (dailySubmissions[dateKey] || 0) + 1;
            }

            if (recentSubs.length < 8) {
              recentSubs.push({
                problem,
                platform: 'CodeChef',
                difficulty: 'Medium',
                status: verdict.includes('correct') || verdict.includes('accepted') ? 'Accepted'
                      : verdict.includes('wrong')   ? 'WA'
                      : verdict.includes('time')    ? 'TLE'
                      : verdict.includes('runtime') ? 'RE'
                      : 'Unknown',
                time: dateKey ? timeAgo(new Date(dateKey).getTime()) : 'recently',
                url: `https://www.codechef.com/${contest}/problems/${problem}`,
              });
            }
          }
        }
      }

      // Strategy 3: Try to get the rating from the profile page HTML
      let rating = 0, highRating = 0, stars = '1★', globalRank = 'N/A', countryRank = 'N/A';
      let solvedCount = 0;
      try {
        const profileRes = await fetchWithTimeout(
          `https://www.codechef.com/users/${username}`,
          8000,
          { ...CC_HEADERS, 'Accept': 'text/html,application/xhtml+xml' }
        );
        if (profileRes.ok) {
          const html = await profileRes.text();

          // 1. Try parsing Drupal.settings first (most accurate and handles nested structures)
          let parsedFromSettings = false;
          const settingsMatch = html.match(/jQuery\.extend\(Drupal\.settings,\s*(\{.+?\})\);/s);
          if (settingsMatch) {
            try {
              const settings = JSON.parse(settingsMatch[1]);
              if (settings.date_versus_rating?.all?.length > 0) {
                const history = settings.date_versus_rating.all;
                const lastEntry = history[history.length - 1];
                if (lastEntry?.rating) {
                  rating = parseInt(lastEntry.rating, 10) || 0;
                  const ratings = history.map((e: any) => parseInt(e.rating, 10) || 0);
                  highRating = Math.max(...ratings, 0);
                  parsedFromSettings = true;
                }
              }
            } catch {}
          }

          // 2. Fallbacks for rating & highRating if Drupal.settings failed
          if (!parsedFromSettings || rating === 0) {
            const ratingM = html.match(/class="rating-number"\s*>\s*(\d+)/i);
            if (ratingM) {
              rating = parseInt(ratingM[1], 10);
            } else {
              const patterns = [
                /"currentRating"\s*:\s*(\d+)/,
                /class="rating-number"[^>]*>(\d+)/,
                /<span[^>]*class="[^"]*rating[^"]*"[^>]*>(\d+)</,
                /userinfo[^{]*{[^}]*"rating"\s*:\s*(\d+)/,
                /Current Rating[^<]*<[^>]*>(\d+)/,
                /"current_rating"\s*:\s*(\d+)/,
              ];
              for (const p of patterns) {
                const m = html.match(p);
                if (m?.[1]) { rating = parseInt(m[1], 10); break; }
              }
            }

            const highM = html.match(/\(Highest Rating\s+(\d+)\)/i) || html.match(/"highestRating"\s*:\s*(\d+)|Highest Rating[^<]*<[^>]*>(\d+)/);
            if (highM) {
              highRating = parseInt(highM[1] || highM[2], 10);
            }
          }

          // 3. Stars parsing
          const starsMatch = html.match(/(\d+)&#9733;/);
          if (starsMatch) {
            stars = starsMatch[1] + '★';
          } else {
            const starBlock = html.match(/class="rating-star"\s*>([\s\S]*?)<\/div>/);
            if (starBlock) {
              const count = (starBlock[1].match(/&#9733;/g) || []).length;
              if (count > 0) stars = count + '★';
            } else {
              stars = ratingToStars(rating);
            }
          }

          // 4. Global & Country Ranks
          const globalM = html.match(/href="\/ratings\/all"[^>]*>\s*<strong>\s*([\s\S]*?)\s*<\/strong>/i) || html.match(/Global Rank[^<]*<[^>]*>(\d+)/);
          if (globalM) {
            globalRank = globalM[1].trim();
          }

          const countryM = html.match(/href="\/ratings\/all\?filterBy=Country[^"]*"[^>]*>\s*<strong>\s*([\s\S]*?)\s*<\/strong>/i);
          if (countryM) {
            countryRank = countryM[1].trim();
          }

          // 5. Solved Count
          const solvedM = html.match(/Total Problems Solved:\s*(\d+)/i);
          if (solvedM) {
            solvedCount = parseInt(solvedM[1], 10);
          }
        }
      } catch { /* ignore, continue with partial data */ }

      // Estimate solved from max_page (each page = 20 submissions, unique may be ~70-80% of total)
      const estimatedSolved = maxPage > 0 ? Math.floor(maxPage * 20 * 0.6) : 0;

      return {
        username,
        rating,
        highRating,
        stars,
        solved:      solvedCount > 0 ? solvedCount : estimatedSolved,
        globalRank,
        countryRank,
        recentSubmissions: recentSubs,
        dailySubmissions,
        note: rating === 0 ? 'Rating extracted partially — CodeChef does not provide a public API' : undefined,
      };
    }
  } catch { /* fall through to final fallback */ }

  // ── Final fallback ───────────────────────────────────────────────────────────
  return {
    username,
    rating:     0,
    highRating: 0,
    stars:      '—',
    solved:     0,
    globalRank: 'N/A',
    countryRank:'N/A',
    dailySubmissions: {},
    error:      'CodeChef does not provide a public API. Please visit codechef.com directly to view your profile.',
  };
}

// Helper: fetch with timeout
async function fetchWithTimeout(url: string, ms: number, headers?: Record<string, string>): Promise<globalThis.Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { headers, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Helper: convert rating to star string
function ratingToStars(rating: number): string {
  if (rating >= 2500) return '7★';
  if (rating >= 2200) return '6★';
  if (rating >= 2000) return '5★';
  if (rating >= 1800) return '4★';
  if (rating >= 1600) return '3★';
  if (rating >= 1400) return '2★';
  return '1★';
}

// ─── Build heatmap from LeetCode submission calendar ──────────────────────────

function buildHeatmap(submissionCalendar: Record<string, number>, yearParam?: string | number) {
  // submissionCalendar: { "unixTimestamp": count, ... } or { "YYYY-MM-DD": count, ... }
  let startDate: Date;
  let endDate: Date;
  const now = new Date();

  if (yearParam && yearParam !== 'current') {
    const targetYear = Number(yearParam);
    startDate = new Date(targetYear, 0, 1); // Jan 1st of target year
    endDate = new Date(targetYear, 11, 31); // Dec 31st of target year
    
    // If target year is the current year, clamp the end date to today
    if (targetYear === now.getFullYear()) {
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
  } else {
    // Default to the past 12 months
    const yearAgo = Date.now() - 52 * 7 * 24 * 3600 * 1000;
    startDate = new Date(yearAgo);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  // Map YYYY-MM-DD → count
  const dayMap = new Map<string, number>();
  for (const [key, cnt] of Object.entries(submissionCalendar)) {
    if (key.includes('-')) {
      dayMap.set(key, (dayMap.get(key) || 0) + (cnt as number));
    } else {
      const d = new Date(Number(key) * 1000);
      const dateStr = d.toISOString().split('T')[0];
      dayMap.set(dateStr, (dayMap.get(dateStr) || 0) + (cnt as number));
    }
  }

  // Build columns starting from the Monday of the week containing startDate
  const heatmap: { val: number; count: number; date: string }[][] = [];
  const runningDate = new Date(startDate);
  const day0 = runningDate.getDay(); // 0=Sun
  const mondayOffset = day0 === 0 ? -6 : 1 - day0;
  runningDate.setDate(runningDate.getDate() + mondayOffset);

  const limitTime = endDate.getTime();
  
  while (runningDate.getTime() <= limitTime) {
    const col: { val: number; count: number; date: string }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(runningDate);
      date.setDate(runningDate.getDate() + d);
      
      const dateStr = date.toISOString().split('T')[0];
      
      if (date.getTime() < startDate.getTime() || date.getTime() > limitTime || date.getTime() > now.getTime()) {
        col.push({ val: -1, count: 0, date: dateStr });
        continue;
      }
      
      const cnt = dayMap.get(dateStr) || 0;
      const val = Math.min(4, cnt === 0 ? 0 : cnt <= 2 ? 1 : cnt <= 5 ? 2 : cnt <= 9 ? 3 : 4);
      col.push({ val, count: cnt, date: dateStr });
    }
    heatmap.push(col);
    runningDate.setDate(runningDate.getDate() + 7);
  }
  return heatmap;
}

function calculateOverallStats(dailySubmissions: Record<string, number>, yearParam?: string | number) {
  let startDate: Date;
  let endDate: Date;
  const now = new Date();

  if (yearParam && yearParam !== 'current') {
    const targetYear = Number(yearParam);
    startDate = new Date(targetYear, 0, 1);
    endDate = new Date(targetYear, 11, 31);
    if (targetYear === now.getFullYear()) {
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
  } else {
    const yearAgo = Date.now() - 52 * 7 * 24 * 3600 * 1000;
    startDate = new Date(yearAgo);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  // Get all active dates in the range, sorted chronologically
  const activeDates = Object.keys(dailySubmissions)
    .filter(dateStr => {
      const d = new Date(dateStr);
      return d.getTime() >= startDate.getTime() && d.getTime() <= endDate.getTime();
    })
    .sort();

  const totalActiveDays = activeDates.length;

  let maxStreak = 0;
  let currentStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of activeDates) {
    const parts = dateStr.split('-');
    const currentDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));

    if (prevDate === null) {
      currentStreak = 1;
    } else {
      const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak += 1;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, currentStreak);
    prevDate = currentDate;
  }

  return {
    totalActiveDays,
    maxStreak,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(ms: number): string {
  const secs = Math.floor((Date.now() - ms) / 1000);
  if (secs < 3600)  return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function cfRatingToDifficulty(rating?: number): string {
  if (!rating) return 'Unknown';
  if (rating <= 1200) return 'Easy';
  if (rating <= 2000) return 'Medium';
  return 'Hard';
}

interface CacheEntry {
  timestamp: number;
  data: any;
}
const profileCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

// ─── Express handler ───────────────────────────────────────────────────────────

export async function getCodingProfile(req: Request, res: ExpressResponse) {
  const { leetcode, codeforces, codechef, year } = req.query as Record<string, string>;
  const yearParam = year || 'current';

  if (!leetcode && !codeforces && !codechef) {
    return res.status(400).json({ error: 'Provide at least one handle (leetcode, codeforces, or codechef)' });
  }

  // Create a unique cache key based on the parameters
  const cacheKey = `${leetcode || ''}_${codeforces || ''}_${codechef || ''}_${yearParam}`;
  
  const cached = profileCache.get(cacheKey);
  const now = Date.now();
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    console.log(`[Coding Controller] ⚡ Cache hit for key: ${cacheKey}`);
    return res.json(cached.data);
  }

  console.log(`[Coding Controller] 🌐 Cache miss. Scraping fresh profiles for key: ${cacheKey}`);

  const result: Record<string, any> = {};
  const errors: Record<string, string> = {};

  const promises: Promise<void>[] = [];

  if (leetcode?.trim()) {
    promises.push(
      fetchLeetCode(leetcode.trim(), yearParam)
        .then((data) => { result.leetcode = data; })
        .catch((e) => { errors.leetcode = e.message; })
    );
  }

  if (codeforces?.trim()) {
    promises.push(
      fetchCodeforces(codeforces.trim())
        .then((data) => { result.codeforces = data; })
        .catch((e) => { errors.codeforces = e.message; })
    );
  }

  if (codechef?.trim()) {
    promises.push(
      fetchCodeChef(codechef.trim())
        .then((data) => { result.codechef = data; })
        .catch((e) => { errors.codechef = e.message; })
    );
  }

  await Promise.allSettled(promises);

  // Merge dailySubmissions from all platforms
  const overallDailySubmissions: Record<string, number> = {};

  const mergeCalendar = (daily: Record<string, number> | undefined) => {
    if (!daily) return;
    for (const [date, cnt] of Object.entries(daily)) {
      overallDailySubmissions[date] = (overallDailySubmissions[date] || 0) + cnt;
    }
  };

  if (result.leetcode) mergeCalendar(result.leetcode.dailySubmissions);
  if (result.codeforces) mergeCalendar(result.codeforces.dailySubmissions);
  if (result.codechef) mergeCalendar(result.codechef.dailySubmissions);

  // Build overall heatmap
  result.heatmap = buildHeatmap(overallDailySubmissions, yearParam);

  // Calculate overall stats
  const overallStats = calculateOverallStats(overallDailySubmissions, yearParam);
  result.overallActiveDays = overallStats.totalActiveDays;
  result.overallMaxStreak = overallStats.maxStreak;

  // Merge recent submissions from all platforms, sorted by most recent
  const allSubs: any[] = [
    ...(result.leetcode?.recentSubmissions     || []),
    ...(result.codeforces?.recentSubmissions   || []),
    ...(result.codechef?.recentSubmissions     || []),
  ];

  const responseData = {
    success: true,
    data: result,
    recentSubmissions: allSubs.slice(0, 12),
    errors,
  };

  profileCache.set(cacheKey, {
    timestamp: now,
    data: responseData
  });

  return res.json(responseData);
}
