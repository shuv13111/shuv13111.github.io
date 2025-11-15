const { graphql } = require("@octokit/graphql");
const fs = require("fs");

const USERNAME = "shuv13111"; // <-- IMPORTANT: Replace with your GitHub username

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
      headers: {
        authorization: `bearer ${process.env.GH_TOKEN}`,
      },
    }
  );

  fs.writeFileSync(
    "./contributions.json",
    JSON.stringify(user.contributionsCollection.contributionCalendar, null, 2)
  );
}

fetchContributions();
