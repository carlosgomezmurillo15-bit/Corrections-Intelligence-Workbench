
"use strict";

// ======================================================
// CRIMINAL INTELLIGENCE ANALYSIS LAB
// Fictional case CR-2026-014
// Educational simulation only.
// ======================================================

// SOURCE REPORTS

const records = [
  {
    id: "RPT-014-01",
    date: "2026-11-10",
    type: "Housing Unit Observation",
    refs: ["P-01", "P-02"],
    relevance: "HIGH",
    source: "Officer observation",
    summary: "Two fictional person identifiers appeared in an observation near the unit common area. The report records proximity, not a confirmed exchange or agreement."
  },
  {
    id: "RPT-014-02",
    date: "2026-11-10",
    type: "Monitored Phone Note",
    refs: ["P-02", "D-01"],
    relevance: "HIGH",
    source: "Fictional phone-monitoring note",
    summary: "A training note referenced a device identifier also present in an earlier administrative record. Ownership and use are unverified."
  },
  {
    id: "RPT-014-03",
    date: "2026-11-11",
    type: "Property Receipt",
    refs: ["P-01", "D-01"],
    relevance: "MEDIUM",
    source: "Property receipt",
    summary: "The property log lists a generic device reference under a fictional person identifier. No communications content or intent is established."
  },
  {
    id: "RPT-014-04",
    date: "2026-11-11",
    type: "Program Attendance Log",
    refs: ["P-01", "P-02"],
    relevance: "LOW",
    source: "Administrative attendance log",
    summary: "Both person identifiers appear on the same scheduled program attendance sheet. Shared attendance is routine and does not demonstrate coordination."
  },
  {
    id: "RPT-014-05",
    date: "2026-11-11",
    type: "Unit Movement Log",
    refs: ["P-02", "G-01"],
    relevance: "MEDIUM",
    source: "Movement log",
    summary: "A movement entry contains a provisional group reference marker. The abbreviation has not been explained or independently attributed."
  },
  {
    id: "RPT-014-06",
    date: "2026-11-12",
    type: "Follow-up Observation",
    refs: ["P-01", "G-01"],
    relevance: "HIGH",
    source: "Officer observation",
    summary: "A follow-up account used the same group marker while describing a separate encounter. The source did not establish the marker's meaning."
  },
  {
    id: "RPT-014-07",
    date: "2026-11-12",
    type: "Shift Assignment Log",
    refs: ["P-02"],
    relevance: "LOW",
    source: "Administrative roster",
    summary: "A routine assignment entry places the identifier within the relevant housing unit; the record contains no allegation or suspicious behavior."
  },
  {
    id: "RPT-014-08",
    date: "2026-11-12",
    type: "Interview Summary",
    refs: ["P-01", "D-01", "G-01"],
    relevance: "MEDIUM",
    source: "Unverified interview summary",
    summary: "A fictional interview mentioned several reference markers without independent supporting documents. Statements remain uncorroborated and should not be treated as verified findings."
  }
];

// ENTITY REFERENCES

const entities = [
  {
    id: "P-01",
    kind: "PERSON IDENTIFIER",
    summary: "Person A, referenced in observation and administrative records."
  },
  {
    id: "P-02",
    kind: "PERSON IDENTIFIER",
    summary: "Person B, referenced in observation and movement records."
  },
  {
    id: "G-01",
    kind: "GROUP REFERENCE",
    summary: "Unverified group marker mentioned in fictional reports; not a confirmed affiliation."
  },
  {
    id: "D-01",
    kind: "DEVICE REFERENCE",
    summary: "Generic device reference; custody, ownership, and use not established."
  }
];

// ELEMENT HELPERS

const $ = id => document.getElementById(id);
const $$ = selector => [...document.querySelectorAll(selector)];

function node(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text !== undefined) el.textContent = text;
  return el;
}

function formatDate(s) {
  return new Date(`${s}T12:00:00`).toLocaleDateString(
    "en-US",
    {
      month: "numeric",
      day: "numeric",
      year: "2-digit"
    }
  );
}

// LOCAL BROWSER STORAGE

const storageKey = "cila-cr-2026-014-v1";

const defaults = {
  reviews: {},
  findings: [],
  brief: ""
};

let state = { ...defaults };

try {
  const stored = JSON.parse(
    localStorage.getItem(storageKey) || "{}"
  );

  if (stored && typeof stored === "object") {
    state = {
      reviews: stored.reviews || {},
      findings: Array.isArray(stored.findings)
        ? stored.findings
        : [],
      brief: typeof stored.brief === "string"
        ? stored.brief
        : ""
    };
  }
} catch {
  state = { ...defaults };
}

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

// NAVIGATION CONFIGURATION

const titles = {
  briefing: "Case Brief",
  casefiles: "Training Case Files",
  sources: "Security Threat Group Communication Review",
  entities: "Entity Index",
  associations: "Association Review",
  timeline: "Event Timeline",
  findings: "Analytic Findings",
  product: "Intelligence Brief",
  guide: "Training Guide"
};

const descriptions = {
  briefing: "OBJECTIVE: Review the scenario, evidence limits, and assessment requirements.",
  casefiles: "AVAILABLE CASE: Select the current fictional training file.",
  sources: "OBJECTIVE: Identify a possible communication network and document only relationships supported by source reporting.",
  entities: "SOURCE INDEX: Track fictional reference identifiers back to specific reports.",
  associations: "ANALYSIS: Review reported connections; distinguish co-reference from verified relationships.",
  timeline: "CHRONOLOGY: Review the order of events as described in the source reports.",
  findings: "ASSESSMENT: Record a conclusion or question with its source and confidence.",
  product: "INTELLIGENCE PRODUCT: Prepare a source-referenced summary with explicit limitations.",
  guide: "TRAINING MODE: Step-by-step instructions for this simulated case."
};

let activeView = "sources";
let activeRecord = null;
let activeEntity = "P-01";

// PAGE NAVIGATION

function navigate(view) {
  if (!titles[view]) return;

  activeView = view;

  $$(".view").forEach(el => {
    el.classList.toggle(
      "active",
      el.id === `view-${view}`
    );

    el.hidden = el.id !== `view-${view}`;
  });

  $$("[data-view]").forEach(el => {
    el.classList.toggle(
      "selected",
      el.closest(".case-menu") !== null &&
      el.dataset.view === view
    );

    el.classList.toggle(
      "active",
      el.closest(".site-nav") !== null &&
      el.dataset.view === view
    );
  });

  $("breadcrumb").textContent =
    `CASE FILES / CR-2026-014 / ${titles[view].toUpperCase()}`;

  $("viewTitle").textContent = titles[view];
  $("viewDescription").textContent = descriptions[view];

  $$(".workflow button").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.view === view
    );
  });

  if (view === "product") renderEvidence();
  if (view === "associations") renderNetwork();
  if (view === "findings") renderFindings();
}

// REPORT REVIEW COUNTERS

function reviewedCount() {
  return records.filter(
    r => Boolean(state.reviews[r.id]?.reviewed)
  ).length;
}

function reviewValue(r) {
  return state.reviews[r.id] || {};
}

// SOURCE REPORT REGISTER

function renderSources() {
  const search = $("searchReports").value.trim().toLowerCase();
  const relevance = $("relevanceFilter").value;

  const matches = records.filter(r => {
    const rating =
      reviewValue(r).relevance || r.relevance;

    const ratingMatches =
      !relevance || rating === relevance;

    const searchMatches =
      !search ||
      [
        r.id,
        r.type,
        r.date,
        r.source,
        ...r.refs,
        r.summary
      ]
        .join(" ")
        .toLowerCase()
        .includes(search);

    return ratingMatches && searchMatches;
  });

  const tbody = $("sourceRows");
  tbody.replaceChildren();

  for (const r of matches) {
    const tr = node("tr");
    tr.tabIndex = 0;

    tr.setAttribute(
      "aria-label",
      `Open ${r.id}, ${r.type}`
    );

    tr.addEventListener(
      "click",
      () => openRecord(r.id)
    );

    tr.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openRecord(r.id);
      }
    });

    const rating =
      reviewValue(r).relevance || r.relevance;

    const reviewed = Boolean(reviewValue(r).reviewed);

    const cells = [
      ["id-link", r.id],
      ["", r.type],
      ["", formatDate(r.date)],
      [`relevance ${rating}`, rating],
      [
        `status-txt ${reviewed ? "reviewed" : ""}`,
        reviewed ? "REVIEWED" : "OPEN"
      ]
    ];

    for (const [cls, value] of cells) {
      tr.append(node("td", cls, value));
    }

    tbody.append(tr);
  }

  if (!matches.length) {
    const tr = node("tr");
    const td = node(
      "td",
      "",
      "No reports match the filters."
    );

    td.colSpan = 5;
    tr.append(td);
    tbody.append(tr);
  }

  $("sourceCount").textContent =
    `${matches.length} of ${records.length} reports displayed`;

  const count = reviewedCount();

  $("reviewCounter").textContent =
    `${count} OF ${records.length} REVIEWED`;

  $("briefReviewed").textContent =
    String(count).padStart(2, "0");

  $("briefCount").textContent =
    String(records.length).padStart(2, "0");

  $("briefFindings").textContent =
    String(state.findings.length).padStart(2, "0");

  $("caseStatus").textContent =
    count === records.length
      ? "REVIEW COMPLETE"
      : "ACTIVE REVIEW";
}

// OPEN SOURCE REPORT

function openRecord(id) {
  const r = records.find(x => x.id === id);

  if (!r) return;

  activeRecord = r;

  $("recordHeading").textContent = id;

  const dl = $("recordDetails");
  dl.replaceChildren();

  const fields = [
    ["SOURCE TYPE", r.type],
    ["REPORT DATE", formatDate(r.date)],
    ["PROVENANCE", r.source],
    ["ENTITY REFERENCES", r.refs.join(", ")]
  ];

  for (const [key, value] of fields) {
    const div = node("div");
    const dt = node("dt", "", key);
    const dd = node("dd", "", value);

    div.append(dt, dd);
    dl.append(div);
  }

  $("recordSummary").textContent = r.summary;

  $("recordRelevance").value =
    reviewValue(r).relevance || r.relevance;

  $("recordReviewed").checked =
    Boolean(reviewValue(r).reviewed);

  $("reviewStatus").textContent = "";

  $("recordOverlay").hidden = false;
  document.body.style.overflow = "hidden";
  $("closeRecord").focus();
}

function closeRecord() {
  $("recordOverlay").hidden = true;
  document.body.style.overflow = "";
}

// SAVE SOURCE REVIEW

function saveReview() {
  if (!activeRecord) return;

  state.reviews[activeRecord.id] = {
    reviewed: $("recordReviewed").checked,
    relevance: $("recordRelevance").value
  };

  const successful = save();

  renderSources();

  $("reviewStatus").textContent = successful
    ? "Review saved in this browser."
    : "Review updated for this session; browser storage is unavailable.";
}

// ENTITY INDEX

function renderEntities() {
  const tbody = $("entityRows");
  tbody.replaceChildren();

  for (const entity of entities) {
    const linked = records.filter(
      r => r.refs.includes(entity.id)
    );

    const tr = node("tr");

    const values = [
      entity.id,
      entity.kind,
      entity.summary,
      String(linked.length)
    ];

    for (const value of values) {
      tr.append(
        node(
          "td",
          value === entity.id ? "id-link" : "",
          value
        )
      );
    }

    const td = node("td");

    const button = node(
      "button",
      "",
      "Inspect sources →"
    );

    button.addEventListener("click", () => {
      activeEntity = entity.id;
      navigate("associations");
    });

    td.append(button);
    tr.append(td);
    tbody.append(tr);
  }
}

// EVENT TIMELINE

function renderTimeline() {
  const container = $("timelineItems");
  container.replaceChildren();

  const chronological = [...records].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.id.localeCompare(b.id)
  );

  for (const r of chronological) {
    const article = node("article", "event");
    const date = node(
      "time",
      "",
      formatDate(r.date)
    );

    date.dateTime = r.date;

    const content = node("div");

    content.append(
      node("h4", "", `${r.id} / ${r.type}`),
      node("p", "", r.summary)
    );

    const button = node(
      "button",
      "",
      "Inspect source →"
    );

    button.addEventListener(
      "click",
      () => openRecord(r.id)
    );

    content.append(button);
    article.append(date, content);
    container.append(article);
  }
}

// SVG HELPER FOR ASSOCIATION NETWORK

function svgEl(tag, attributes = {}, text) {
  const el = document.createElementNS(
    "http://www.w3.org/2000/svg",
    tag
  );

  for (const [key, value] of Object.entries(attributes)) {
    el.setAttribute(key, String(value));
  }

  if (text !== undefined) {
    el.textContent = text;
  }

  return el;
}

// INTERACTIVE ASSOCIATION REVIEW

function renderNetwork() {
  const net = $("network");
  net.replaceChildren();

  const svg = svgEl("svg", {
    viewBox: "0 0 600 350",
    role: "img",
    "aria-label": "Selectable entity relationship overview based on report co-references"
  });

  const locations = {
    "P-01": [120, 128],
    "P-02": [470, 128],
    "G-01": [295, 62],
    "D-01": [295, 248]
  };

  const edges = [
    ["P-01", "P-02"],
    ["P-01", "G-01"],
    ["P-02", "G-01"],
    ["P-01", "D-01"],
    ["P-02", "D-01"],
    ["G-01", "D-01"]
  ];

  for (const [a, b] of edges) {
    const [x1, y1] = locations[a];
    const [x2, y2] = locations[b];

    svg.append(
      svgEl("line", {
        x1,
        y1,
        x2,
        y2,
        stroke: "#a7bbca",
        "stroke-width": 2
      })
    );
  }

  for (const entity of entities) {
    const [x, y] = locations[entity.id];
    const selected = entity.id === activeEntity;

    const group = svgEl("g", {
      role: "button",
      tabindex: "0",
      "aria-label": `Inspect ${entity.id}`
    });

    let colors;

    if (entity.id.startsWith("P")) {
      colors = ["#102c47", "#fff"];
    } else if (entity.id.startsWith("G")) {
      colors = ["#facd52", "#1d3c51"];
    } else {
      colors = ["#dbeaf1", "#14384d"];
    }

    group.append(
      svgEl("rect", {
        x: x - 67,
        y: y - 23,
        width: 134,
        height: 46,
        rx: 2,
        fill: colors[0],
        stroke: selected ? "#0b7db3" : "#8396a6",
        "stroke-width": selected ? 4 : 1
      })
    );

    group.append(
      svgEl(
        "text",
        {
          x,
          y: y + 4,
          "text-anchor": "middle",
          fill: colors[1],
          "font-size": 14,
          "font-weight": "bold"
        },
        entity.id
      )
    );

    group.addEventListener("click", () => {
      activeEntity = entity.id;
      renderNetwork();
    });

    group.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activeEntity = entity.id;
        renderNetwork();
      }
    });

    svg.append(group);
  }

  net.append(svg);

  const entity = entities.find(
    x => x.id === activeEntity
  );

  $("networkTitle").textContent =
    `${entity.id} / ${entity.kind}`;

  $("networkDescription").textContent =
    entity.summary;

  const sourceList = $("networkSources");
  sourceList.replaceChildren();

  const linked = records.filter(
    r => r.refs.includes(entity.id)
  );

  for (const r of linked) {
    const wrap = node("div");

    const heading = node(
      "strong",
      "",
      `${r.id} · ${r.type}`
    );

    const details = node(
      "p",
      "body-small",
      r.summary
    );

    const button = node(
      "button",
      "",
      "Inspect source →"
    );

    button.addEventListener(
      "click",
      () => openRecord(r.id)
    );

    wrap.append(heading, details, button);
    sourceList.append(wrap);
  }
}

// SAVED ANALYTIC FINDINGS

function renderFindings() {
  const list = $("findingList");
  list.replaceChildren();

  if (!state.findings.length) {
    list.append(
      node(
        "p",
        "empty-copy",
        "No findings recorded. Create a finding and link it to a source report."
      )
    );
    return;
  }

  for (const finding of state.findings) {
    const card = node("article", "finding-card");

    const title = node(
      "strong",
      "",
      finding.title
    );

    const meta = node(
      "small",
      "",
      `${finding.source} / CONFIDENCE: ${finding.confidence}`
    );

    const description = node(
      "p",
      "",
      finding.text
    );

    const deleteButton = node(
      "button",
      "",
      "Delete finding"
    );

    deleteButton.addEventListener("click", () => {
      state.findings = state.findings.filter(
        x => x.id !== finding.id
      );

      save();
      renderFindings();
      renderSources();
    });

    card.append(
      title,
      meta,
      description,
      deleteButton
    );

    list.append(card);
  }
}

// FINAL BRIEF SUPPORTING EVIDENCE

function renderEvidence() {
  const container = $("briefEvidence");
  container.replaceChildren();

  container.append(
    node(
      "p",
      "body-small",
      `${reviewedCount()} of ${records.length} source reports reviewed. ${state.findings.length} findings saved.`
    )
  );

  if (!state.findings.length) {
    container.append(
      node(
        "p",
        "empty-copy",
        "No supported findings added yet."
      )
    );
    return;
  }

  for (const finding of state.findings) {
    const card = node("div", "finding-card");

    const title = node(
      "strong",
      "",
      finding.title
    );

    const meta = node(
      "small",
      "",
      `${finding.source} / ${finding.confidence} confidence`
    );

    card.append(title, meta);
    container.append(card);
  }
}

// PRINTABLE INTELLIGENCE BRIEF

function preparePrint() {
  const root = $("printDocument");
  root.replaceChildren();

  root.append(
    node(
      "div",
      "print-warning",
      "TRAINING / UNCLASSIFIED / ALL RECORDS FICTIONAL — NOT AN OFFICIAL INTELLIGENCE REPORT"
    ),
    node(
      "h1",
      "",
      "Training Case Intelligence Brief"
    ),
    node(
      "p",
      "",
      "Case CR-2026-014 · Security Threat Group Communication Review"
    ),
    node(
      "h2",
      "",
      "1. Case scope"
    ),
    node(
      "p",
      "",
      `${records.length} fictional reports; ${reviewedCount()} marked reviewed. Entity markers represent unverified references only.`
    ),
    node(
      "h2",
      "",
      "2. Analyst assessment"
    ),
    node(
      "p",
      "",
      state.brief.trim() ||
      "No assessment draft entered."
    ),
    node(
      "h2",
      "",
      "3. Source-supported findings"
    )
  );

  if (!state.findings.length) {
    root.append(
      node("p", "", "No findings recorded.")
    );
  }

  for (const finding of state.findings) {
    const item = node("div", "print-item");

    item.append(
      node(
        "h3",
        "",
        `${finding.title} — ${finding.source} (${finding.confidence})`
      ),
      node(
        "p",
        "",
        finding.text
      )
    );

    root.append(item);
  }

  root.append(
    node(
      "h2",
      "",
      "4. Source limitations"
    ),
    node(
      "p",
      "",
      "The entire exercise is fictional. Co-reference does not establish affiliation, communication, misconduct, or intent. Claims requiring corroboration must remain labeled as such."
    )
  );

  window.print();
}

// APPLICATION INITIALIZATION

function init() {
  // Navigation events

  document.addEventListener("click", e => {
    const navigationButton = e.target.closest(
      "[data-view]"
    );

    if (navigationButton) {
      navigate(navigationButton.dataset.view);
    }

    if (e.target.closest("[data-close]")) {
      closeRecord();
    }
  });

  // Source filters

  $("searchReports").addEventListener(
    "input",
    renderSources
  );

  $("relevanceFilter").addEventListener(
    "change",
    renderSources
  );

  // Record drawer

  $("closeRecord").addEventListener(
    "click",
    closeRecord
  );

  document.addEventListener("keydown", e => {
    if (
      e.key === "Escape" &&
      !$("recordOverlay").hidden
    ) {
      closeRecord();
    }
  });

  $("saveReview").addEventListener(
    "click",
    saveReview
  );

  // Create a finding from a source record

  $("recordToFinding").addEventListener(
    "click",
    () => {
      const id = activeRecord?.id;

      closeRecord();
      navigate("findings");

      $("findingSource").value =
        id || records[0].id;

      $("findingTitle").focus();
    }
  );

  // Populate supporting report selector

  for (const r of records) {
    $("findingSource").append(
      new Option(
        `${r.id} / ${r.type}`,
        r.id
      )
    );
  }

  // Save findings

  $("findingForm").addEventListener(
    "submit",
    e => {
      e.preventDefault();

      const title =
        $("findingTitle").value.trim();

      const body =
        $("findingText").value.trim();

      if (!title || !body) return;

      state.findings.push({
        id: `f-${Date.now()}-${Math.random()}`,
        title,
        text: body,
        source: $("findingSource").value,
        confidence: $("findingConfidence").value
      });

      const successful = save();

      $("findingStatus").textContent = successful
        ? "Finding saved to this browser."
        : "Finding added for this session; local storage is unavailable.";

      $("findingTitle").value = "";
      $("findingText").value = "";

      renderFindings();
      renderSources();
    }
  );

  // Draft intelligence brief

  $("briefText").value = state.brief;

  $("saveBrief").addEventListener(
    "click",
    () => {
      state.brief = $("briefText").value;

      $("briefStatus").textContent = save()
        ? "Draft saved in this browser."
        : "Draft updated for this session; browser storage unavailable.";
    }
  );

  // Print or save as PDF

  $("printBrief").addEventListener(
    "click",
    () => {
      state.brief = $("briefText").value;
      save();
      preparePrint();
    }
  );

  // Initial render

  renderSources();
  renderEntities();
  renderTimeline();
  renderFindings();
  renderNetwork();

  navigate("sources");
}

init();
