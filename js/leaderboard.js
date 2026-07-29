const leaderboardElement = document.getElementById("leaderboard");

async function loadLeaderboard() {
  try {
    const response = await fetch(
      `data/donors.json?v=${Date.now()}`,
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error("The donor data could not be loaded.");
    }

    const data = await response.json();

    const sortedDonors = [...data.donors]
      .filter((donor) => {
        return (
          typeof donor.name === "string" &&
          donor.name.trim() !== "" &&
          typeof donor.amount === "number" &&
          donor.amount >= 0
        );
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 20);

    renderLeaderboard(sortedDonors);
  } catch (error) {
    console.error(error);

    leaderboardElement.innerHTML = `
      <div class="notice">
        The donor leaderboard could not be loaded.
        Please try again later.
      </div>
    `;
  }
}

function renderLeaderboard(donors) {
  if (donors.length === 0) {
    leaderboardElement.innerHTML = `
      <div class="notice">
        No donors have been added yet.
      </div>
    `;

    return;
  }

  leaderboardElement.innerHTML = donors
    .map((donor, index) => {
      const rank = index + 1;

      return `
        <article class="leaderboard-entry">
          <span class="leaderboard-rank">
            ${getRankDisplay(rank)}
          </span>

          <span class="leaderboard-name">
            ${escapeHtml(donor.name)}
          </span>

          <span class="leaderboard-amount">
            ${formatAmount(donor.amount)}
          </span>
        </article>
      `;
    })
    .join("");
}

function getRankDisplay(rank) {
  if (rank === 1) {
    return "🥇";
  }

  if (rank === 2) {
    return "🥈";
  }

  if (rank === 3) {
    return "🥉";
  }

  return `#${rank}`;
}

function formatAmount(amount) {
  return new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: "EUR"
  }).format(amount);
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

loadLeaderboard();
