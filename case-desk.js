"use strict";

// Homepage-only case desk.
// All cases and identifiers are fictional training data.

const CASES = [
  {
    id: "CR-2026-014",
    shortName: "Communication Review",
    title: "Possible coordinated communication activity",
    queue: "ACTIVE",
    status: "ACTIVE REVIEW",
    priority: "ROUTINE",
    analyst: "C. Gomez",
    due: "20 Nov 2026",
    updated: "19 Nov 2026",
    type: "Communication review",
    stage: "Source evaluation",
    progress: 46,

    summary:
      "This case examines whether overlapping observations, a device reference, and a provisional group reference indicate coordinated activity between two fictional person identifiers. Current reporting establishes points of contact, but it does not establish intent or direction.",

    requirement:
      "Does the available reporting indicate coordinated communication between P-01 and P-02, or are the observed connections better explained by routine proximity and shared institutional activity?",

    questions: [
      "Which reported connections are independently corroborated?",
      "What is the significance of group reference G-01?",
      "Can device reference D-01 be reliably attributed?"
    ],

    holdings: [
      ["Source reports", 8, "5 awaiting review"],
      ["Indexed entities", 4, "2 unresolved"],
      ["Analytical findings", 0, "Draft stage"]
    ],

    activity: [
      [
        "19 Nov",
        "Case desk updated",
        "Source holdings and tasking reviewed"
      ],
      [
        "18 Nov",
        "RPT-014-08 added",
        "Interview summary entered in source register"
      ],
      [
        "17 Nov",
        "Requirement approved",
        "IR-01 established for preliminary review"
      ]
    ],

    nextAction: "Complete source evaluation",

    nextDetail:
      "Review the remaining reports and record reliability, credibility, and limitations.",

    tasks: [
      "Review five open source reports",
      "Test D-01 attribution",
      "Draft at least one source-linked finding"
    ],

    gaps: [
      "Meaning of G-01 remains unverified",
      "D-01 custody and use are unresolved"
    ]
  },

  {
    id: "CR-2026-019",
    shortName: "Movement Pattern",
    title: "Possible contraband movement pattern",
    queue: "ACTIVE",
    status: "COLLECTION",
    priority: "ELEVATED",
    analyst: "C. Gomez",
    due: "23 Nov 2026",
    updated: "19 Nov 2026",
    type: "Pattern assessment",
    stage: "Collection and indexing",
    progress: 28,

    summary:
      "This fictional case compares property discrepancies, unit movements, and recurring location references to determine whether they form a meaningful movement pattern. The present record contains repeated locations, but the sequence is incomplete and several events have only one source.",

    requirement:
      "Do the available property and movement records support a recurring contraband movement pattern across the identified locations?",

    questions: [
      "Which locations recur across independent records?",
      "Does the chronology show a repeatable sequence?",
      "Which events lack a second source?"
    ],

    holdings: [
      ["Source reports", 6, "3 indexed"],
      ["Indexed entities", 5, "Initial review"],
      ["Location references", 4, "2 recurring"]
    ],

    activity: [
      [
        "19 Nov",
        "Movement log received",
        "Two new location references identified"
      ],
      [
        "18 Nov",
        "Case opened",
        "Initial scope and collection plan recorded"
      ],
      [
        "18 Nov",
        "Property record added",
        "Discrepancy entered for comparison"
      ]
    ],

    nextAction: "Normalize location references",

    nextDetail:
      "Standardize location names before comparing sequence and frequency.",

    tasks: [
      "Index three remaining reports",
      "Build preliminary event chronology",
      "Compare recurring locations"
    ],

    gaps: [
      "Two movement times are missing",
      "No independent source for one property discrepancy"
    ]
  },

  {
    id: "CR-2026-021",
    shortName: "Threat Validation",
    title: "Threat reporting validation",
    queue: "PENDING",
    status: "INTAKE",
    priority: "TIME SENSITIVE",
    analyst: "C. Gomez",
    due: "21 Nov 2026",
    updated: "19 Nov 2026",
    type: "Threat information review",
    stage: "Triage",
    progress: 12,

    summary:
      "This fictional intake reviews four reports that repeat a similar threat claim. The wording is similar across the reports, but it is not yet clear whether they represent independent information or repetition from a single original account.",

    requirement:
      "Are the threat reports independently corroborated, and what immediate information is required to judge credibility?",

    questions: [
      "Do the reports originate from independent sources?",
      "Which details are specific enough to verify?",
      "What indicators would change the current urgency?"
    ],

    holdings: [
      ["Source reports", 4, "Triage required"],
      ["Indexed entities", 3, "Provisional"],
      ["Corroborated claims", 0, "Not established"]
    ],

    activity: [
      [
        "19 Nov",
        "Intake created",
        "Four reports grouped for validation"
      ],
      [
        "19 Nov",
        "Priority assigned",
        "Initial due date established"
      ],
      [
        "19 Nov",
        "Source overlap noted",
        "Possible single-origin reporting identified"
      ]
    ],

    nextAction: "Conduct source-origin check",

    nextDetail:
      "Determine whether the four reports repeat one account or provide independent information.",

    tasks: [
      "Compare report language",
      "Identify original source chain",
      "Record preliminary credibility judgment"
    ],

    gaps: [
      "Source independence is unknown",
      "Time and location details remain incomplete"
    ]
  }
];

const PRIMARY_STORAGE_KEY = "corrections-intelligence-workbench-v3";
const NOTE_STORAGE_KEY = "ciw-case-desk-notes";
const SELECTED_CASE_KEY = "ciw-selected-case";

let selectedCaseId =
  localStorage.getItem(SELECTED_CASE_KEY) || "CR-2026-014";

let activeCaseFilter = "ALL";
let toastTimer;

function byId(id) {
  return document.getElementById(id);
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

function readPrimaryState() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(PRIMARY_STORAGE_KEY)
    );

    if (saved && typeof saved === "object") {
      return {
        reviews: saved.reviews || {},
        findings: saved.findings || [],
        brief: saved.brief || {}
      };
    }

    return {
      reviews: {},
      findings: [],
      brief: {}
    };
  } catch {
    return {
      reviews: {},
      findings: [],
      brief: {}
    };
  }
}

function briefCompletion(brief) {
  const required = [
    "briefBluf",
    "briefJudgments",
    "briefConfidence",
    "briefAlternative",
    "briefGaps",
    "briefRecommendations"
  ];

  const completed = required.filter((key) => {
    return String(brief[key] || "").trim();
  }).length;

  return completed / required.length;
}

function primaryProgress() {
  const state = readPrimaryState();

  const reviewPoints =
    (Object.keys(state.reviews).length / 8) * 55;

  const findingPoints =
    Math.min(state.findings.length / 2, 1) * 20;

  const briefPoints =
    briefCompletion(state.brief) * 25;

  return Math.round(
    reviewPoints + findingPoints + briefPoints
  );
}

function caseProgress(caseRecord) {
  if (caseRecord.id === "CR-2026-014") {
    return primaryProgress();
  }

  return caseRecord.progress;
}

function caseDeskNotes() {
  try {
    return (
      JSON.parse(localStorage.getItem(NOTE_STORAGE_KEY)) || {}
    );
  } catch {
    return {};
  }
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
  }, 2400);
}

function renderCaseQueue() {
  const queue = byId("caseQueue");

  const visibleCases = CASES.filter((caseRecord) => {
    return (
      activeCaseFilter === "ALL" ||
      caseRecord.queue === activeCaseFilter
    );
  });

  queue.replaceChildren();

  visibleCases.forEach((caseRecord) => {
    const selectedClass =
      caseRecord.id === selectedCaseId ? " selected" : "";

    const button = create(
      "button",
      `queue-case${selectedClass}`
    );

    button.type = "button";
    button.dataset.priority = caseRecord.priority;

    const top = create("div", "queue-case-top");

    top.append(
      create("span", "queue-case-id", caseRecord.id)
    );

    top.append(
      create(
        "span",
        "queue-case-status",
        caseRecord.status
      )
    );

    const meta = create("div", "queue-case-meta");

    meta.append(
      create("span", "", `Due ${caseRecord.due}`)
    );

    meta.append(
      create(
        "b",
        "",
        `${caseProgress(caseRecord)}%`
      )
    );

    button.append(
      top,
      create("strong", "", caseRecord.title),
      meta
    );

    button.addEventListener("click", () => {
      selectCase(caseRecord.id);
    });

    queue.append(button);
  });

  byId("queueCount").textContent =
    String(visibleCases.length);
}

function setCaseLinks(caseRecord) {
  const primary =
    caseRecord.id === "CR-2026-014";

  const linkIds = [
    "caseReportsLink",
    "caseEntitiesLink",
    "caseTimelineLink",
    "caseProductLink"
  ];

  linkIds.forEach((id) => {
    const link = byId(id);

    link.classList.toggle("disabled", !primary);
    link.setAttribute(
      "aria-disabled",
      String(!primary)
    );

    link.title = primary
      ? "Open the working primary case"
      : "Detailed records are planned for the final prototype";
  });
}

function renderSelectedCase() {
  const caseRecord =
    CASES.find((item) => item.id === selectedCaseId) ||
    CASES[0];

  const progress = caseProgress(caseRecord);
  const primaryState = readPrimaryState();

  byId("selectedCaseId").textContent =
    caseRecord.id;

  byId("selectedCaseTitle").textContent =
    caseRecord.title;

  byId("selectedCasePriority").textContent =
    caseRecord.priority;

  byId("selectedCaseStatus").textContent =
    caseRecord.status;

  byId("selectedCaseUpdated").textContent =
    `Updated ${caseRecord.updated}`;

  byId("selectedCaseAnalyst").textContent =
    caseRecord.analyst;

  byId("selectedCaseDue").textContent =
    caseRecord.due;

  byId("selectedCaseType").textContent =
    caseRecord.type;

  byId("selectedCaseStage").textContent =
    caseRecord.stage;

  byId("selectedCaseSummary").textContent =
    caseRecord.summary;

  byId("selectedCaseRequirement").textContent =
    caseRecord.requirement;

  byId("selectedCaseNextAction").textContent =
    caseRecord.nextAction;

  byId("selectedCaseNextDetail").textContent =
    caseRecord.nextDetail;

  byId("selectedCaseProgressText").textContent =
    `${progress}%`;

  byId("selectedCaseProgressBar").style.width =
    `${progress}%`;

  byId("sidebarCaseId").textContent =
    caseRecord.id;

  byId("sidebarCaseName").textContent =
    caseRecord.shortName;

  byId("caseBreadcrumb").textContent =
    `CASEWORK / ${caseRecord.id} / CASE DESK`;

  const questions =
    byId("selectedCaseQuestions");

  questions.replaceChildren();

  caseRecord.questions.forEach((question) => {
    questions.append(
      create("li", "", question)
    );
  });

  const holdings =
    caseRecord.holdings.map((row) => [...row]);

  if (caseRecord.id === "CR-2026-014") {
    const reviewedReports =
      Object.keys(primaryState.reviews).length;

    holdings[0][2] =
      `${8 - reviewedReports} awaiting review`;

    holdings[2][1] =
      primaryState.findings.length;

    holdings[2][2] =
      primaryState.findings.length
        ? "Analyst entries saved"
        : "Draft stage";
  }

  const holdingsBody =
    byId("selectedCaseHoldings");

  holdingsBody.replaceChildren();

  holdings.forEach(([label, count, status]) => {
    const row = create("tr");

    row.append(
      create("td", "", label),
      create("td", "", String(count))
    );

    const stateCell = create("td");

    stateCell.append(
      create(
        "span",
        "holdings-state",
        status
      )
    );

    row.append(stateCell);
    holdingsBody.append(row);
  });

  const activity =
    byId("selectedCaseActivity");

  activity.replaceChildren();

  caseRecord.activity.forEach(
    ([date, title, detail]) => {
      const row =
        create("div", "activity-row");

      const copy = create("div");

      copy.append(
        create("strong", "", title),
        create("small", "", detail)
      );

      row.append(
        create("time", "", date),
        copy
      );

      activity.append(row);
    }
  );

  const tasks =
    byId("selectedCaseTasks");

  tasks.replaceChildren();

  caseRecord.tasks.forEach((task) => {
    tasks.append(create("li", "", task));
  });

  const gaps =
    byId("selectedCaseGaps");

  gaps.replaceChildren();

  caseRecord.gaps.forEach((gap) => {
    gaps.append(create("li", "", gap));
  });

  const savedNotes = caseDeskNotes();

  byId("caseDeskNote").value =
    savedNotes[caseRecord.id] || "";

  const primaryCaseProgress =
    primaryProgress();

  byId("sidebarProgress").textContent =
    `${primaryCaseProgress}%`;

  byId("sidebarProgressBar").style.width =
    `${primaryCaseProgress}%`;

  setCaseLinks(caseRecord);
  renderCaseQueue();
}

function selectCase(caseId) {
  const validCase =
    CASES.some((item) => item.id === caseId);

  if (!validCase) {
    return;
  }

  selectedCaseId = caseId;

  localStorage.setItem(
    SELECTED_CASE_KEY,
    caseId
  );

  renderSelectedCase();
}

function initializeCaseDesk() {
  const overviewLink =
    document.querySelector(
      '[data-nav="overview"]'
    );

  if (overviewLink) {
    overviewLink.classList.add("active");
  }

  byId("menuButton").addEventListener(
    "click",
    () => {
      byId("sidebar").classList.toggle("open");
    }
  );

  document
    .querySelectorAll(".sidebar a")
    .forEach((link) => {
      link.addEventListener("click", () => {
        byId("sidebar").classList.remove("open");
      });
    });

  document
    .querySelectorAll("[data-case-filter]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        activeCaseFilter =
          button.dataset.caseFilter;

        document
          .querySelectorAll("[data-case-filter]")
          .forEach((item) => {
            item.classList.toggle(
              "active",
              item === button
            );
          });

        renderCaseQueue();
      });
    });

  byId("focusCurrentCase").addEventListener(
    "click",
    () => {
      selectCase("CR-2026-014");
    }
  );

  byId("showAllCases").addEventListener(
    "click",
    () => {
      activeCaseFilter = "ALL";

      document
        .querySelectorAll("[data-case-filter]")
        .forEach((item) => {
          item.classList.toggle(
            "active",
            item.dataset.caseFilter === "ALL"
          );
        });

      renderCaseQueue();
    }
  );

  byId("saveCaseDeskNote").addEventListener(
    "click",
    () => {
      const notes = caseDeskNotes();

      notes[selectedCaseId] =
        byId("caseDeskNote").value.trim();

      localStorage.setItem(
        NOTE_STORAGE_KEY,
        JSON.stringify(notes)
      );

      showToast(
        `Desk note saved for ${selectedCaseId}.`
      );
    }
  );

  byId("resetWorkspace").addEventListener(
    "click",
    () => {
      const approved = window.confirm(
        "Reset report reviews, findings, and the draft brief for the primary fictional case?"
      );

      if (!approved) {
        return;
      }

      localStorage.removeItem(
        PRIMARY_STORAGE_KEY
      );

      renderSelectedCase();

      showToast(
        "Primary case workspace reset."
      );
    }
  );

  renderSelectedCase();
}

initializeCaseDesk();
