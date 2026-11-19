"use strict";

// Fictional training data for case CR-2026-014.
// No operational or personally identifiable information is used.

const REPORTS = [
  {
    id: "RPT-014-01",
    shortId: "RPT-01",
    date: "2026-11-10",
    type: "Housing Unit Observation",
    source: "Officer observation",
    refs: ["P-01", "P-02"],
    relevance: "HIGH",
    summary: "Two fictional person identifiers were observed in the unit common area during the same period. The report documents proximity but does not describe a confirmed exchange, instruction, or agreement.",
    value: "Provides a dated observation placing P-01 and P-02 in the same location. It can support chronology and contact analysis.",
    limitations: "Proximity is not proof of coordination. The common area was available to multiple people, and the report does not establish intent."
  },
  {
    id: "RPT-014-02",
    shortId: "RPT-02",
    date: "2026-11-10",
    type: "Monitored Phone Note",
    source: "Fictional monitoring note",
    refs: ["P-02", "D-01"],
    relevance: "HIGH",
    summary: "A training note associated P-02 with a generic device reference that also appeared in an earlier administrative record. The note does not establish ownership or exclusive use.",
    value: "Creates a reportable connection between P-02 and D-01 that can be compared with property and interview reporting.",
    limitations: "The device reference is generic. Attribution, custody, and the identity of the user remain unverified."
  },
  {
    id: "RPT-014-03",
    shortId: "RPT-03",
    date: "2026-11-11",
    type: "Property Receipt",
    source: "Administrative property record",
    refs: ["P-01", "D-01"],
    relevance: "MEDIUM",
    summary: "A property record lists a generic device reference under P-01. The receipt contains no communication content and does not establish how or when the item was used.",
    value: "Provides a separate administrative record connecting P-01 to D-01.",
    limitations: "A property record alone cannot establish use during the relevant event period or coordination with another person."
  },
  {
    id: "RPT-014-04",
    shortId: "RPT-04",
    date: "2026-11-11",
    type: "Program Attendance Log",
    source: "Administrative attendance log",
    refs: ["P-01", "P-02"],
    relevance: "LOW",
    summary: "P-01 and P-02 appear on the same scheduled program attendance sheet. The event was part of a routine institutional schedule.",
    value: "Confirms that both identifiers had a normal reason to be present in the same area.",
    limitations: "Shared attendance may explain proximity and does not demonstrate a private association or coordinated behavior."
  },
  {
    id: "RPT-014-05",
    shortId: "RPT-05",
    date: "2026-11-11",
    type: "Unit Movement Log",
    source: "Administrative movement record",
    refs: ["P-02", "G-01"],
    relevance: "MEDIUM",
    summary: "A movement entry concerning P-02 contains a provisional group reference marker labeled G-01. The entry does not define the abbreviation.",
    value: "Identifies a group reference that appears again in follow-up reporting.",
    limitations: "The marker's origin and meaning are unknown. It should not be treated as confirmed affiliation."
  },
  {
    id: "RPT-014-06",
    shortId: "RPT-06",
    date: "2026-11-12",
    type: "Follow-up Observation",
    source: "Officer observation",
    refs: ["P-01", "G-01"],
    relevance: "HIGH",
    summary: "A follow-up report concerning P-01 used the same provisional marker G-01 while describing a separate encounter. The report did not explain the marker's meaning.",
    value: "Provides a second appearance of G-01 and connects the reference to a separate person identifier.",
    limitations: "Repeated terminology may reflect a shared reporting practice rather than a verified relationship."
  },
  {
    id: "RPT-014-07",
    shortId: "RPT-07",
    date: "2026-11-12",
    type: "Shift Assignment Log",
    source: "Administrative roster",
    refs: ["P-02"],
    relevance: "LOW",
    summary: "A routine assignment entry places P-02 in the relevant housing unit. The record contains no allegation or suspicious behavior.",
    value: "Supports location and access analysis for the event period.",
    limitations: "The entry is administrative and does not support an inference of coordination by itself."
  },
  {
    id: "RPT-014-08",
    shortId: "RPT-08",
    date: "2026-11-12",
    type: "Interview Summary",
    source: "Uncorroborated interview account",
    refs: ["P-01", "D-01", "G-01"],
    relevance: "MEDIUM",
    summary: "A fictional interview mentioned P-01, D-01, and G-01 without providing independent records or firsthand detail sufficient to verify the account.",
    value: "Identifies possible lines of inquiry and a potential connection among three indexed references.",
    limitations: "The account is uncorroborated. It should generate questions, not serve as a verified finding."
  }
];

const ENTITIES = [
  {
    id: "P-01",
    type: "Person identifier",
    description: "Fictional person A; appears in observation, property, attendance, and interview reporting.",
    status: "Identity controlled"
  },
  {
    id: "P-02",
    type: "Person identifier",
    description: "Fictional person B; appears in observation, monitoring, attendance, movement, and roster reporting.",
    status: "Identity controlled"
  },
  {
    id: "D-01",
    type: "Device reference",
    description: "Generic device marker; ownership, custody, and use during the relevant period are not established.",
    status: "Attribution unresolved"
  },
  {
    id: "G-01",
    type: "Group reference",
    description: "Provisional marker appearing in multiple reports; meaning and affiliation remain unverified.",
    status: "Meaning unresolved"
  }
];

const STORAGE_KEY = "corrections-intelligence-workbench-v3";

const emptyState = () => ({
  reviews: {},
  findings: [],
  brief: {}
});

let state = loadState();
let activeReportId = null;
let toastTimer = null;

function byId(id) {
  return document.getElementById(id);
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    return saved && typeof saved === "object"
      ? {
          reviews: saved.reviews || {},
          findings: saved.findings || [],
          brief: saved.brief || {}
        }
      : emptyState();
  } catch {
    return emptyState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateGlobalProgress();
}

function create(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function showToast(message) {
  const toast = byId("toast");

  if (!toast) {
    return;
  }

  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function briefFieldCompletion() {
  const required = [
    "briefBluf",
    "briefJudgments",
    "briefConfidence",
    "briefAlternative",
    "briefGaps",
    "briefRecommendations"
  ];

  const completed = required.filter((key) => {
    return String(state.brief[key] || "").trim();
  }).length;

  return Math.round((completed / required.length) * 100);
}

function overallProgress() {
  const reviewPoints =
    (Object.keys(state.reviews).length / REPORTS.length) * 55;

  const findingPoints =
    Math.min(state.findings.length / 2, 1) * 20;

  const briefPoints =
    (briefFieldCompletion() / 100) * 25;

  return Math.round(reviewPoints + findingPoints + briefPoints);
}

function updateGlobalProgress() {
  const progress = overallProgress();
  const reviewed = Object.keys(state.reviews).length;

  if (byId("sidebarProgress")) {
    byId("sidebarProgress").textContent = `${progress}%`;
  }

  if (byId("sidebarProgressBar")) {
    byId("sidebarProgressBar").style.width = `${progress}%`;
  }

  if (byId("overviewProgress")) {
    byId("overviewProgress").textContent = `${progress}%`;
  }

  if (byId("overviewFindingCount")) {
    byId("overviewFindingCount").textContent =
      String(state.findings.length).padStart(2, "0");
  }

  if (byId("reviewStatus")) {
    byId("reviewStatus").textContent = `${reviewed}/8`;
  }

  if (byId("findingStatus")) {
    byId("findingStatus").textContent =
      String(state.findings.length);
  }

  if (byId("briefStatus")) {
    byId("briefStatus").textContent =
      briefFieldCompletion()
        ? `${briefFieldCompletion()}%`
        : "Not started";
  }

  const checklist = byId("overviewChecklist");

  if (checklist) {
    checklist
      .querySelector('[data-check="review"]')
      .classList.toggle("complete", reviewed === REPORTS.length);

    checklist
      .querySelector('[data-check="finding"]')
      .classList.toggle("complete", state.findings.length >= 1);

    checklist
      .querySelector('[data-check="brief"]')
      .classList.toggle("complete", briefFieldCompletion() === 100);
  }
}

function initializeShell() {
  const page = document.body.dataset.page;
  const activeLink = document.querySelector(`[data-nav="${page}"]`);

  if (activeLink) {
    activeLink.classList.add("active");
  }

  const menuButton = byId("menuButton");
  const sidebar = byId("sidebar");

  if (menuButton && sidebar) {
    menuButton.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });

    sidebar.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        sidebar.classList.remove("open");
      });
    });
  }

  const resetButton = byId("resetWorkspace");

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      const confirmed = window.confirm(
        "Reset all report reviews, findings, and the draft brief for this fictional case?"
      );

      if (!confirmed) {
        return;
      }

      state = emptyState();
      localStorage.removeItem(STORAGE_KEY);
      updateGlobalProgress();
      showToast("Case workspace reset.");
    });
  }
}

function renderReports() {
  const tbody = byId("reportTableBody");

  if (!tbody) {
    return;
  }

  const query =
    (byId("reportSearch").value || "").trim().toLowerCase();

  const relevance = byId("relevanceFilter").value;
  const reviewState = byId("reviewFilter").value;

  const filtered = REPORTS.filter((report) => {
    const searchable = [
      report.id,
      report.type,
      report.source,
      report.summary,
      ...report.refs
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery =
      !query || searchable.includes(query);

    const matchesRelevance =
      relevance === "ALL" ||
      report.relevance === relevance;

    const isReviewed =
      Boolean(state.reviews[report.id]);

    const matchesState =
      reviewState === "ALL" ||
      (reviewState === "REVIEWED"
        ? isReviewed
        : !isReviewed);

    return (
      matchesQuery &&
      matchesRelevance &&
      matchesState
    );
  });

  tbody.replaceChildren();

  filtered.forEach((report) => {
    const row = create("tr");

    row.tabIndex = 0;
    row.setAttribute(
      "aria-label",
      `Open ${report.id}`
    );

    row.addEventListener("click", () => {
      openReport(report.id);
    });

    row.addEventListener("keydown", (event) => {
      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        openReport(report.id);
      }
    });

    row.append(
      create("td", "", report.id)
    );

    row.append(
      create("td", "", formatDate(report.date))
    );

    row.append(
      create("td", "", report.type)
    );

    const refCell = create("td");
    const pills = create("div", "entity-pills");

    report.refs.forEach((ref) => {
      pills.append(
        create("span", "entity-pill", ref)
      );
    });

    refCell.append(pills);
    row.append(refCell);

    const relevanceCell = create("td");

    relevanceCell.append(
      create(
        "span",
        `relevance ${report.relevance.toLowerCase()}`,
        report.relevance
      )
    );

    row.append(relevanceCell);

    const stateCell = create("td");
    const reviewed =
      Boolean(state.reviews[report.id]);

    stateCell.append(
      create(
        "span",
        `review-state ${
          reviewed ? "reviewed" : "open"
        }`,
        reviewed ? "REVIEWED" : "OPEN"
      )
    );

    row.append(stateCell);
    tbody.append(row);
  });

  byId("reportCount").textContent =
    `Showing ${filtered.length} of ${REPORTS.length} records`;
}

function openReport(reportId) {
  const report = REPORTS.find(
    (item) => item.id === reportId
  );

  if (!report) {
    return;
  }

  activeReportId = reportId;

  byId("drawerReportId").textContent =
    report.id;

  byId("drawerSummary").textContent =
    report.summary;

  byId("drawerValue").textContent =
    report.value;

  byId("drawerLimitations").textContent =
    report.limitations;

  const metadata = byId("drawerMetadata");

  metadata.replaceChildren();

  const metadataItems = [
    ["REPORT DATE", formatDate(report.date)],
    ["REPORT TYPE", report.type],
    ["SOURCE TYPE", report.source],
    ["REFERENCES", report.refs.join(", ")]
  ];

  metadataItems.forEach(([label, value]) => {
    const item = create("div");

    item.append(
      create("span", "", label),
      create("strong", "", value)
    );

    metadata.append(item);
  });

  const review =
    state.reviews[reportId] || {};

  byId("sourceReliability").value =
    review.reliability || "";

  byId("informationCredibility").value =
    review.credibility || "";

  byId("reportNote").value =
    review.note || "";

  byId("reportDrawer").classList.add("open");
  byId("drawerBackdrop").classList.add("open");

  byId("reportDrawer").setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow = "hidden";
}

function closeReport() {
  if (!byId("reportDrawer")) {
    return;
  }

  byId("reportDrawer").classList.remove("open");
  byId("drawerBackdrop").classList.remove("open");

  byId("reportDrawer").setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow = "";
}

function initializeReportsPage() {
  if (!byId("reportTableBody")) {
    return;
  }

  [
    "reportSearch",
    "relevanceFilter",
    "reviewFilter"
  ].forEach((id) => {
    byId(id).addEventListener(
      "input",
      renderReports
    );
  });

  byId("closeDrawer").addEventListener(
    "click",
    closeReport
  );

  byId("drawerBackdrop").addEventListener(
    "click",
    closeReport
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        closeReport();
      }
    }
  );

  byId("saveReportReview").addEventListener(
    "click",
    () => {
      if (!activeReportId) {
        return;
      }

      const reliability =
        byId("sourceReliability").value;

      const credibility =
        byId("informationCredibility").value;

      const note =
        byId("reportNote").value.trim();

      if (
        !reliability ||
        !credibility ||
        !note
      ) {
        showToast(
          "Select both ratings and enter an analyst note."
        );
        return;
      }

      state.reviews[activeReportId] = {
        reliability,
        credibility,
        note,
        reviewedAt: new Date().toISOString()
      };

      saveState();
      renderReports();

      showToast(
        `${activeReportId} review saved.`
      );

      closeReport();
    }
  );

  byId("copyCitation").addEventListener(
    "click",
    async () => {
      if (!activeReportId) {
        return;
      }

      const text =
        `Corrections Intelligence Workbench, Case CR-2026-014, ${activeReportId}.`;

      try {
        await navigator.clipboard.writeText(text);
        showToast("Report citation copied.");
      } catch {
        showToast(text);
      }
    }
  );

  renderReports();
}

function renderEntities() {
  const tbody = byId("entityTableBody");

  if (!tbody) {
    return;
  }

  tbody.replaceChildren();

  ENTITIES.forEach((entity) => {
    const row = create("tr");

    const reports = REPORTS
      .filter((report) => {
        return report.refs.includes(entity.id);
      })
      .map((report) => report.shortId)
      .join(", ");

    row.append(
      create("td", "", entity.id),
      create("td", "", entity.type),
      create("td", "", entity.description),
      create("td", "", reports),
      create("td", "", entity.status)
    );

    tbody.append(row);
  });
}

function renderTimeline() {
  const container = byId("timelineList");

  if (!container) {
    return;
  }

  container.replaceChildren();

  const dates = [
    ...new Set(
      REPORTS.map((report) => report.date)
    )
  ];

  dates.forEach((date) => {
    const day = create(
      "div",
      "timeline-day"
    );

    day.append(
      create(
        "div",
        "timeline-date",
        formatDate(date)
      )
    );

    const events = create(
      "div",
      "timeline-events"
    );

    REPORTS
      .filter((report) => report.date === date)
      .forEach((report) => {
        const event = create(
          "article",
          "timeline-event"
        );

        const title = create(
          "strong",
          "",
          report.type
        );

        title.append(
          create(
            "span",
            "",
            report.shortId
          )
        );

        event.append(
          title,
          create("p", "", report.summary)
        );

        events.append(event);
      });

    day.append(events);
    container.append(day);
  });
}

function populateFindingSources() {
  const select = byId("findingSource");

  if (!select) {
    return;
  }

  select.replaceChildren();

  const placeholder = create(
    "option",
    "",
    "Select report"
  );

  placeholder.value = "";
  select.append(placeholder);

  REPORTS.forEach((report) => {
    const option = create(
      "option",
      "",
      `${report.id} — ${report.type}`
    );

    option.value = report.id;
    select.append(option);
  });
}

function renderFindings() {
  const list = byId("findingList");

  if (!list) {
    return;
  }

  list.replaceChildren();

  if (byId("findingCountChip")) {
    byId("findingCountChip").textContent =
      `${state.findings.length} SAVED`;
  }

  if (!state.findings.length) {
    list.append(
      create(
        "div",
        "empty-state",
        "No findings saved. Add a source-linked assessment above."
      )
    );

    return;
  }

  state.findings.forEach((finding) => {
    const item = create(
      "article",
      "finding-item"
    );

    const copy = create("div");

    copy.append(
      create("h3", "", finding.title),
      create("p", "", finding.text),
      create(
        "small",
        "",
        `${finding.source} / ${finding.confidence.toUpperCase()} CONFIDENCE`
      )
    );

    const remove = create(
      "button",
      "",
      "Remove"
    );

    remove.type = "button";

    remove.addEventListener("click", () => {
      state.findings =
        state.findings.filter((entry) => {
          return entry.id !== finding.id;
        });

      saveState();
      renderFindings();
      showToast("Finding removed.");
    });

    item.append(copy, remove);
    list.append(item);
  });
}

function initializeAnalysisPage() {
  if (!byId("entityTableBody")) {
    return;
  }

  renderEntities();
  renderTimeline();
  populateFindingSources();
  renderFindings();

  byId("findingForm").addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      const finding = {
        id: `finding-${Date.now()}`,
        title:
          byId("findingTitle").value.trim(),
        text:
          byId("findingText").value.trim(),
        source:
          byId("findingSource").value,
        confidence:
          byId("findingConfidence").value
      };

      if (
        !finding.title ||
        !finding.text ||
        !finding.source ||
        !finding.confidence
      ) {
        showToast(
          "Complete every finding field."
        );
        return;
      }

      state.findings.unshift(finding);

      saveState();
      byId("findingForm").reset();
      renderFindings();

      showToast(
        "Source-linked finding saved."
      );
    }
  );
}

const BRIEF_FIELDS = [
  "briefTitle",
  "briefBluf",
  "briefJudgments",
  "briefConfidence",
  "briefAlternative",
  "briefGaps",
  "briefRecommendations"
];

function collectBriefFromForm() {
  BRIEF_FIELDS.forEach((id) => {
    const field = byId(id);

    if (field) {
      state.brief[id] =
        field.value.trim();
    }
  });
}

function restoreBrief() {
  BRIEF_FIELDS.forEach((id) => {
    const field = byId(id);

    if (
      field &&
      state.brief[id] !== undefined
    ) {
      field.value = state.brief[id];
    }
  });
}

function updateBriefQuality() {
  if (!byId("qcList")) {
    return;
  }

  collectBriefFromForm();

  const items = [
    ...byId("qcList").querySelectorAll("li")
  ];

  let completed = 0;

  items.forEach((item) => {
    const field =
      byId(item.dataset.field);

    const done = Boolean(
      field && field.value.trim()
    );

    item.classList.toggle(
      "complete",
      done
    );

    if (done) {
      completed += 1;
    }
  });

  byId("briefCompletion").textContent =
    `${Math.round(
      (completed / items.length) * 100
    )}%`;
}

function renderBriefFindingSummary() {
  const container =
    byId("briefFindingSummary");

  if (!container) {
    return;
  }

  container.replaceChildren();

  if (!state.findings.length) {
    container.append(
      create(
        "p",
        "",
        "No analytical findings saved yet."
      )
    );

    return;
  }

  state.findings.forEach((finding) => {
    const item = create(
      "div",
      "mini-finding"
    );

    item.append(
      create(
        "strong",
        "",
        finding.title
      ),
      create(
        "small",
        "",
        `${finding.source} / ${finding.confidence} confidence`
      )
    );

    container.append(item);
  });
}

function initializeBriefPage() {
  if (!byId("briefForm")) {
    return;
  }

  restoreBrief();
  renderBriefFindingSummary();
  updateBriefQuality();

  BRIEF_FIELDS.forEach((id) => {
    const field = byId(id);

    if (field) {
      field.addEventListener(
        "input",
        updateBriefQuality
      );
    }
  });

  byId("saveBrief").addEventListener(
    "click",
    () => {
      collectBriefFromForm();
      saveState();
      updateBriefQuality();

      showToast(
        "Draft intelligence brief saved in this browser."
      );
    }
  );

  byId("printBrief").addEventListener(
    "click",
    () => {
      window.print();
    }
  );
}

initializeShell();
updateGlobalProgress();
initializeReportsPage();
initializeAnalysisPage();
initializeBriefPage();
