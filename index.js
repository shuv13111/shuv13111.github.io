const { graphql: graphqlBase } = require("@octokit/graphql");
const fetch = require("node-fetch");
const fs = require("fs");

// Prefer env overrides for flexibility; fall back to default username.
const USERNAME = process.env.GH_USERNAME || "shuv13111";
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error(
    "Missing GH_TOKEN/GITHUB_TOKEN. Please set it in repo secrets before running."
  );
  process.exit(1);
}

// Create graphql client with node-fetch for Node 16 compatibility
const graphql = graphqlBase.defaults({
  headers: {
    authorization: `bearer ${TOKEN}`,
  },
  request: {
    fetch: fetch,
  },
});

async function fetchContributions() {
  const { user } = await graphql(
    `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  weekday
                }
              }
            }
          }
        }
      }
    `,
    {
      username: USERNAME,
    }
  );

  const calendar = user.contributionsCollection.contributionCalendar;
  const allDays = calendar.weeks.flatMap(week => week.contributionDays);

  // --- Calculate Analytics based on full year ---
  const totalContributions = calendar.totalContributions;

  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  const lastMonthContributions = allDays
      .filter(day => new Date(day.date) >= oneMonthAgo)
      .reduce((sum, day) => sum + day.contributionCount, 0);

  const lastQuarterContributions = allDays
      .filter(day => new Date(day.date) >= threeMonthsAgo)
      .reduce((sum, day) => sum + day.contributionCount, 0);

  // --- Calculate Streaks based on full year ---
  let longestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 0;

  // --- Longest Streak Calculation (Original correct logic) ---
  for (const day of allDays) {
      if (day.contributionCount > 0) {
          tempStreak++;
      } else {
          if (tempStreak > longestStreak) {
              longestStreak = tempStreak;
          }
          tempStreak = 0;
      }
  }
  if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
  }

  // --- Current Streak Calculation (New robust logic) ---
  // First, calculate the trailing streak of contributions from the end of the data.
  for (let i = allDays.length - 1; i >= 0; i--) {
      if (allDays[i].contributionCount > 0) {
          currentStreak++;
      } else {
          break; // Stop at the first day with no contributions
      }
  }

  // Then, validate if this streak is actually "current".
  const todayStr = today.toISOString().slice(0, 10);
  const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  let lastContributionDate = null;
  for (let i = allDays.length - 1; i >= 0; i--) {
      if (allDays[i].contributionCount > 0) {
          lastContributionDate = allDays[i].date;
          break;
      }
  }

  // A streak is only "current" if the last contribution was today or yesterday.
  if (lastContributionDate !== todayStr && lastContributionDate !== yesterdayStr) {
      currentStreak = 1;
  }

  // --- Add Month Markers ---
  let lastMonth = -1;
  calendar.weeks.forEach(week => {
      week.contributionDays.forEach(day => {
          const month = new Date(day.date).getMonth();
          if (lastMonth !== -1 && month !== lastMonth) {
              day.isFirstDayOfMonth = true;
          }
          lastMonth = month;
      });
  });

  const outputData = {
      totalContributions,
      lastMonthContributions,
      lastQuarterContributions,
      longestStreak,
      currentStreak,
      calendar: calendar
  };

  fs.writeFileSync(
      "./contributions.json",
      JSON.stringify(outputData, null, 2)
  );
  console.log("Successfully fetched and processed contribution data.");
}

fetchContributions().catch((err) => {
  console.error("Failed to fetch contributions:", err.message);
  if (err.response && err.response.data) {
    console.error("GitHub response:", JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
