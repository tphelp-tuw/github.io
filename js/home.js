"use strict";

const semesterGrid = document.querySelector("#semester-grid");
const currentYear = document.querySelector("#current-year");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

async function loadSemesters() {
  try {
    const response = await fetch(
      `data/courses.json?v=${Date.now()}`,
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(`Could not load course data: ${response.status}`);
    }

    const data = await response.json();

    semesterGrid.innerHTML = "";

    for (const semester of data.semesters) {
      const courseCount = semester.courses.length;

      const semesterCard = document.createElement("a");
      semesterCard.className = "card";
      semesterCard.href =
        `course.html?semester=${encodeURIComponent(semester.number)}`;

      semesterCard.innerHTML = `
        <h2>${escapeHtml(semester.title)}</h2>
        <p>
          ${courseCount}
          ${courseCount === 1 ? "course" : "courses"} available
        </p>
      `;

      semesterGrid.appendChild(semesterCard);
    }
  } catch (error) {
    console.error(error);

    semesterGrid.innerHTML = `
      <div class="error-message">
        The semester information could not be loaded.
        Please try again later.
      </div>
    `;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadSemesters();
