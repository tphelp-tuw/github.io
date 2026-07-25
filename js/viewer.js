"use strict";

import * as pdfjsLib from
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

const documentTitle = document.querySelector("#document-title");
const documentDescription =
  document.querySelector("#document-description");
const viewerStatus = document.querySelector("#viewer-status");
const pagesContainer = document.querySelector("#pdf-pages");
const backLink = document.querySelector("#back-link");
const zoomInButton = document.querySelector("#zoom-in");
const zoomOutButton = document.querySelector("#zoom-out");
const zoomValue = document.querySelector("#zoom-value");
const currentYear = document.querySelector("#current-year");

const parameters = new URLSearchParams(window.location.search);

const semesterNumber = Number(parameters.get("semester"));
const courseId = parameters.get("course");
const documentId = parameters.get("document");

let pdfDocument = null;
let scale = 1.25;
let renderGeneration = 0;

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

async function initializeViewer() {
  try {
    const dataResponse = await fetch("data/courses.json");

    if (!dataResponse.ok) {
      throw new Error("Course information could not be loaded.");
    }

    const data = await dataResponse.json();

    const semester = data.semesters.find(
      item => item.number === semesterNumber
    );

    const course = semester?.courses.find(
      item => item.id === courseId
    );

    const documentData = course?.documents.find(
      item => item.id === documentId
    );

    if (!semester || !course || !documentData) {
      throw new Error("The requested document does not exist.");
    }

    document.title =
      `${documentData.title} | TPHelp`;

    documentTitle.textContent = documentData.title;
    documentDescription.textContent =
      documentData.description || "";

    backLink.href =
      `course.html?semester=${semester.number}` +
      `&course=${encodeURIComponent(course.id)}`;

    const loadingTask = pdfjsLib.getDocument({
      url: documentData.file,
      disableAutoFetch: true,
      disableStream: true
    });

    pdfDocument = await loadingTask.promise;

    await renderAllPages();
  } catch (error) {
    console.error(error);

    viewerStatus.textContent =
      error.message || "The PDF could not be displayed.";
    viewerStatus.className = "error-message";
  }
}

async function renderAllPages() {
  if (!pdfDocument) {
    return;
  }

  const thisGeneration = ++renderGeneration;

  pagesContainer.innerHTML = "";
  viewerStatus.textContent =
    `Rendering ${pdfDocument.numPages} pages…`;

  zoomValue.textContent = `${Math.round(scale * 80)}%`;

  for (
    let pageNumber = 1;
    pageNumber <= pdfDocument.numPages;
    pageNumber += 1
  ) {
    if (thisGeneration !== renderGeneration) {
      return;
    }

    const page = await pdfDocument.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const wrapper = document.createElement("div");
    wrapper.className = "pdf-page-wrapper";

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", {
      alpha: false
    });

    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(viewport.width * pixelRatio);
    canvas.height = Math.floor(viewport.height * pixelRatio);

    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const watermark = document.createElement("div");
    watermark.className = "watermark";
    watermark.textContent =
      "© TPHelp · PERSONAL STUDY USE ONLY";

    wrapper.appendChild(canvas);
    wrapper.appendChild(watermark);
    pagesContainer.appendChild(wrapper);

    await page.render({
      canvasContext: context,
      viewport,
      transform:
        pixelRatio === 1
          ? null
          : [pixelRatio, 0, 0, pixelRatio, 0, 0]
    }).promise;
  }

  viewerStatus.textContent =
    `${pdfDocument.numPages} pages`;
}

zoomInButton.addEventListener("click", async () => {
  scale = Math.min(scale + 0.2, 2.5);
  await renderAllPages();
});

zoomOutButton.addEventListener("click", async () => {
  scale = Math.max(scale - 0.2, 0.6);
  await renderAllPages();
});

document.addEventListener("keydown", event => {
  const prohibitedShortcut =
    (event.ctrlKey || event.metaKey) &&
    ["s", "p", "u"].includes(event.key.toLowerCase());

  if (prohibitedShortcut) {
    event.preventDefault();
  }
});

document.addEventListener("dragstart", event => {
  event.preventDefault();
});

initializeViewer();
