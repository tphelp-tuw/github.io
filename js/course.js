"use strict";

const courseContent = document.querySelector("#course-content");
const currentYear = document.querySelector("#current-year");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

const parameters = new URLSearchParams(window.location.search);
const semesterNumber = Number(parameters.get("semester"));
const courseId = parameters.get("course");

async function loadCoursePage() {
  try {
    const response = await fetch("data/courses.json");

    if (!response.ok) {
      throw new Error(`Could not load course data: ${response.status}`);
    }

    const data = await response.json();

    const semester = data.semesters.find(
      item => item.number === semesterNumber
    );

    if (!semester) {
      showError("The requested semester does not exist.");
      return;
    }

    if (!courseId) {
      renderCourseSelection(semester);
      return;
    }

    const course = semester.courses.find(
      item => item.id === courseId
    );

    if (!course) {
      showError("The requested course does not exist.");
      return;
    }

    renderCourse(semester, course);
  } catch (error) {
    console.error(error);
    showError("The course information could not be loaded.");
  }
}

function renderCourseSelection(semester) {
  document.title = `${semester.title} | TPHelp`;

  const cards = semester.courses.length > 0
    ? semester.courses.map(course => `
        <a
          class="card"
          href="course.html?semester=${semester.number}&course=${encodeURIComponent(course.id)}"
        >
          <h2>${escapeHtml(course.name)}</h2>
          <p>${escapeHtml(course.shortDescription)}</p>
        </a>
      `).join("")
    : `
        <div class="notice">
          There are currently no published courses for this semester.
        </div>
      `;

  courseContent.innerHTML = `
    <section class="hero">
      <h1>${escapeHtml(semester.title)}</h1>
      <p>Choose a course to see its study materials.</p>
    </section>

    <div class="grid">
      ${cards}
    </div>
  `;
}

function renderCourse(semester, course) {
  document.title = `${course.name} | TPHelp`;

  const documents = course.documents.length > 0
    ? course.documents.map(document => `
        <article class="document-card">
          <h3>${escapeHtml(document.title)}</h3>

          <div class="document-meta">
            ${escapeHtml(document.category)}
            ${document.date ? ` · ${escapeHtml(document.date)}` : ""}
          </div>

          <p>${escapeHtml(document.description || "")}</p>

          <a
            class="button"
            href="viewer.html?semester=${semester.number}&course=${encodeURIComponent(course.id)}&document=${encodeURIComponent(document.id)}"
          >
            Open document
          </a>
        </article>
      `).join("")
    : `
        <div class="notice">
          No documents have been published for this course.
        </div>
      `;

  courseContent.innerHTML = `
    <section class="course-header">
      <p>${escapeHtml(semester.title)}</p>
      <h1>${escapeHtml(course.name)}</h1>
      <p>${escapeHtml(course.description)}</p>

      <div class="metadata">
        <div class="metadata-item">
          <span class="metadata-label">Lecturer</span>
          ${escapeHtml(course.lecturer)}
        </div>

        <div class="metadata-item">
          <span class="metadata-label">Term</span>
          ${escapeHtml(course.term)}
        </div>

        <div class="metadata-item">
          <span class="metadata-label">Course number</span>
          ${escapeHtml(course.courseNumber)}
        </div>

        <div class="metadata-item">
          <span class="metadata-label">Language</span>
          ${escapeHtml(course.language)}
        </div>
      </div>

      <div class="notice">
        These are unofficial personal study materials. Information about the
        course, lecturers and examinations may no longer be current.
      </div>
    </section>

    <section>
      <h2>Documents</h2>

      <p class="legal-notice">
        Documents are provided for personal viewing and study only.
        Redistribution or republication is not permitted.
      </p>

      <div class="document-list">
        ${documents}
      </div>
    </section>
  `;
}

function showError(message) {
  courseContent.innerHTML = `
    <div class="error-message">
      ${escapeHtml(message)}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadCoursePage();
