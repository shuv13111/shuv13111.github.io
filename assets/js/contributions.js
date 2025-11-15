document.addEventListener("DOMContentLoaded", () => {
    fetch("contributions.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const container = document.getElementById("contributions-container");
            const totalContributionsEl = document.getElementById("total-contributions");
            const monthContributionsEl = document.getElementById("month-contributions");
            const quarterContributionsEl = document.getElementById("quarter-contributions");
            const longestStreakEl = document.getElementById("longest-streak");
            const currentStreakEl = document.getElementById("current-streak");

            if (!container || !totalContributionsEl || !data) {
                console.error("Could not find necessary elements or data for contributions graph.");
                return;
            }

            // Populate stats
            totalContributionsEl.textContent = data.totalContributions;
            monthContributionsEl.textContent = data.lastMonthContributions;
            quarterContributionsEl.textContent = data.lastQuarterContributions;
            longestStreakEl.textContent = `${data.longestStreak} days`;
            currentStreakEl.textContent = `${data.currentStreak} days`;

            // Clear any existing content
            container.innerHTML = '';

            data.calendar.weeks.forEach(week => {
                week.contributionDays.forEach(day => {
                    const dayDiv = document.createElement("div");
                    dayDiv.classList.add("contribution-day");

                    if (day.isFirstDayOfMonth) {
                        dayDiv.classList.add("month-separator");
                    }
                    dayDiv.style.backgroundColor = getContributionColor(day.contributionCount);
                    
                    const tooltip = document.createElement("span");
                    tooltip.classList.add("tooltip");
                    tooltip.textContent = `${day.contributionCount} contributions on ${day.date}`;
                    dayDiv.appendChild(tooltip);

                    container.appendChild(dayDiv);
                });
            });
        })
        .catch(error => {
            console.error("Error fetching or processing contribution data:", error);
            const container = document.getElementById("contributions-container");
            if(container) {
                container.innerHTML = "<p style='color: var(--text-secondary);'>Could not load contribution data. You can trigger the update action in the repository's Actions tab.</p>";
            }
        });
});

function getContributionColor(count) {
    if (count === 0) return "rgba(255, 255, 255, 0.05)";
    if (count < 5) return "#0e4429";
    if (count < 10) return "#006d32";
    if (count < 20) return "#26a641";
    return "#39d353";
}
