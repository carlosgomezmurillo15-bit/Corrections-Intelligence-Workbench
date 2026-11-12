
// Fictional training records. Not an operational agency system.

const raw = [
  ["2026-10-20", "07:15", "Access discrepancy", "North Corridor", "M. Reyes", "Door N-4 recorded as unsecured during scheduled morning check.", "Shift log"],
  ["2026-10-20", "19:40", "Unusual movement", "Housing B", "J. Porter", "Two unscheduled movements were recorded near the east stairwell.", "Officer report"],
  ["2026-10-21", "12:10", "Property discrepancy", "Property Room", "L. Chen", "Inventory count identified one missing sealed property envelope.", "Inventory log"],
  ["2026-10-21", "22:30", "Communication concern", "Housing B", "J. Porter, A. Brooks", "Staff documented repeated attempts to pass handwritten messages.", "Officer report"],
  ["2026-10-22", "08:05", "Access discrepancy", "North Corridor", "M. Reyes", "Access log showed a badge attempt outside an assigned work period.", "Access log"],
  ["2026-10-22", "16:50", "Unusual movement", "Recreation Hall", "A. Brooks", "Movement between assigned areas was recorded without a matching schedule entry.", "Movement log"],
  ["2026-10-23", "11:20", "Property discrepancy", "Housing C", "D. Ellis", "A routine inventory identified an unassigned personal item.", "Inventory log"],
  ["2026-10-23", "21:05", "Communication concern", "Housing B", "J. Porter", "An officer reported a disputed exchange of notes during evening movement.", "Officer report"],
  ["2026-10-24", "09:30", "Access discrepancy", "Service Entrance", "M. Reyes", "Entry request occurred during a temporary access restriction.", "Access log"],
  ["2026-10-24", "18:15", "Unusual movement", "Recreation Hall", "A. Brooks, D. Ellis", "Two individuals appeared in the same unscheduled movement entry.", "Movement log"],
  ["2026-10-25", "06:55", "Safety observation", "Housing C", "D. Ellis", "Staff documented an obstruction in a shared inspection area.", "Inspection note"],
  ["2026-10-25", "20:40", "Communication concern", "Housing B", "A. Brooks", "Officer reported possible message passing; contents were not recovered.", "Officer report"],
  ["2026-10-26", "13:25", "Property discrepancy", "Property Room", "L. Chen", "Follow-up reconciliation did not resolve the earlier inventory difference.", "Inventory log"],
  ["2026-10-26", "23:10", "Access discrepancy", "North Corridor", "M. Reyes", "Door N-4 recorded an additional after-hours opening event.", "Access log"],
  ["2026-10-27", "07:45", "Safety observation", "Recreation Hall", "D. Ellis", "Maintenance request noted a damaged storage cabinet latch.", "Inspection note"],
  ["2026-10-27", "17:20", "Unusual movement", "Housing B", "J. Porter, A. Brooks", "Movement record referenced both identifiers during an unplanned corridor transfer.", "Movement log"],
  ["2026-10-28", "10:10", "Communication concern", "Housing C", "D. Ellis", "Staff recovered an unsigned message with no verified author.", "Officer report"],
  ["2026-10-28", "19:55", "Access discrepancy", "Service Entrance", "M. Reyes", "An access attempt was denied by the electronic entry system.", "Access log"],
  ["2026-10-29", "14:00", "Property discrepancy", "Property Room", "L. Chen", "Audit identified a labeling mismatch between two inventory entries.", "Inventory log"],
  ["2026-10-29", "22:35", "Unusual movement", "North Corridor", "J. Porter", "A movement entry lacked the usual destination field.", "Movement log"],
  ["2026-10-30", "08:20", "Safety observation", "Housing C", "D. Ellis", "Routine inspection logged an unattended maintenance tool.", "Inspection note"],
  ["2026-10-31", "16:05", "Communication concern", "Recreation Hall", "A. Brooks", "An officer noted a possible exchange; observation remains unconfirmed.", "Officer report"],
  ["2026-11-01", "20:45", "Access discrepancy", "North Corridor", "M. Reyes", "Access record again referenced Door N-4 outside the normal sequence.", "Access log"],
  ["2026-11-02", "11:35", "Property discrepancy", "Housing C", "D. Ellis", "Property check noted a second inventory mismatch awaiting review.", "Inventory log"],
  ["2026-11-03", "18:30", "Unusual movement", "Housing B", "J. Porter", "Unscheduled movement appeared in an evening activity report.", "Movement log"]
];

// Convert case data into incident objects.
const records = raw.map((r, i) => ({
  id: `CW-${String(i + 1).padStart(3, "0")}`,
  date: r[0],
  time: r[1],
  type: r[2],
  area: r[3],
  people: r[4],
  summary: r[5],
  source: r[6]
})).reverse();

// Common helpers.
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const distinct = key =>
  [...new Set(records.map(r => r[key]))].sort();

const dateText = date =>
  new Date(`${date}T12:00:00`).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

// Load saved notes.
const notesKey = "casework-cw026-notes";
let notes = [];

try {
  const stored = JSON.parse(localStorage.getItem(notesKey) || "[]");
  notes = Array.isArray(stored) ? stored : [];
} catch {
  notes = [];
}

function saveNotes() {
  try {
    localStorage.setItem(notesKey, JSON.stringify(notes));
    return true;
  } catch {
    return false;
  }
}

// Navigation.
function route(page) {
  $$(".page").forEach(p => {
    p.classList.toggle("active", p.id === page);
  });

  $$(".nav-link").forEach(b => {
    b.classList.toggle("active", b.dataset.page === page);
  });

  $("#breadcrumb").textContent = {
    overview: "Overview",
    records: "Incident records",
    timeline: "Timeline",
    notebook: "Analyst notebook"
  }[page];

  window.scrollTo(0, 0);
}

$$(".nav-link").forEach(button => {
  button.addEventListener("click", () => route(button.dataset.page));
});

$$("[data-go]").forEach(button => {
  button.addEventListener("click", () => route(button.dataset.go));
});

// Record table.
function tag(type) {
  return `<span class="pill">${type}</span>`;
}

function tableRow(r, hasSource) {
  return `
    <tr>
      <td>${r.id}</td>
      <td>${dateText(r.date)} · ${r.time}</td>
      <td>${tag(r.type)}</td>
      <td>${r.area}</td>
      ${hasSource ? `<td>${r.source}</td>` : ""}
      <td>
        <button class="open-btn" data-record="${r.id}">
          Open →
        </button>
      </td>
    </tr>
  `;
}

// Count reports by category or area.
function counts(key) {
  return records.reduce((acc, r) => {
    acc[r[key]] = (acc[r[key]] || 0) + 1;
    return acc;
  }, {});
}

// Dashboard charts.
function renderCharts() {
  const types = Object.entries(counts("type"))
    .sort((a, b) => b[1] - a[1]);

  const max = types[0][1];

  $("#typeChart").innerHTML = types.map(([name, n]) => `
    <div class="bar-line">
      <span>${name}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${n / max * 100}%"></div>
      </div>
      <strong>${n}</strong>
    </div>
  `).join("");

  $("#areaChart").innerHTML = Object.entries(counts("area"))
    .sort((a, b) => b[1] - a[1])
    .map(([area, n]) => `
      <div class="location-row">
        <span>${area}</span>
        <strong>${n}</strong>
      </div>
    `).join("");
}

// Dashboard statistics.
function renderSummary() {
  $("#metricTotal").textContent = records.length;
  $("#metricAreas").textContent = distinct("area").length;

  $("#metricPeople").textContent = new Set(
    records.flatMap(r =>
      r.people.split(",").map(person => person.trim())
    )
  ).size;

  $("#metricNotes").textContent = notes.length;

  $("#recentRows").innerHTML = records
    .slice(0, 5)
    .map(r => tableRow(r, false))
    .join("");

  renderCharts();
}

// Search and filter reports.
function renderRecords() {
  const q = $("#searchInput").value.toLowerCase().trim();
  const type = $("#typeFilter").value;
  const area = $("#areaFilter").value;

  const list = records.filter(r =>
    (!type || r.type === type) &&
    (!area || r.area === area) &&
    (!q || Object.values(r).join(" ").toLowerCase().includes(q))
  );

  $("#recordRows").innerHTML = list
    .map(r => tableRow(r, true))
    .join("");

  $("#resultCount").textContent =
    `${list.length} of ${records.length} records`;

  $("#noResults").hidden = list.length > 0;
}

// Timeline.
function renderTimeline() {
  $("#timelineItems").innerHTML = records.map(r => `
    <article class="timeline-event">
      <div class="timeline-date">
        ${dateText(r.date)} · ${r.time} / ${r.id}
      </div>

      <h3>${r.type} — ${r.area}</h3>
      <p>${r.summary}</p>

      <button class="open-btn" data-record="${r.id}">
        View source record →
      </button>
    </article>
  `).join("");
}

// Record details.
function detailField(name, value) {
  const div = document.createElement("div");
  div.className = "detail-field";

  const small = document.createElement("small");
  small.textContent = name;

  const strong = document.createElement("strong");
  strong.textContent = value;

  div.append(small, strong);
  return div;
}

let activeRecord = null;

function openRecord(id) {
  const r = records.find(record => record.id === id);
  if (!r) return;

  activeRecord = r;

  $("#detailTitle").textContent = `${r.id} · ${r.type}`;

  $("#detailGrid").replaceChildren(
    detailField("DATE / TIME", `${dateText(r.date)} · ${r.time}`),
    detailField("FACILITY AREA", r.area),
    detailField("REFERENCED PERSON(S)", r.people),
    detailField("SOURCE TYPE", r.source)
  );

  $("#detailSummary").textContent = r.summary;
  $("#modal").hidden = false;
  $("#closeModal").focus();
}

function closeRecord() {
  $("#modal").hidden = true;
  activeRecord = null;
}

// Open a report from the table or timeline.
document.addEventListener("click", e => {
  const button = e.target.closest("[data-record]");
  if (button) openRecord(button.dataset.record);
});

$("#closeModal").addEventListener("click", closeRecord);

$("#modal").addEventListener("click", e => {
  if (e.target.id === "modal") closeRecord();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeRecord();
});

// Create a note linked to the selected report.
$("#addRecordNote").addEventListener("click", () => {
  const id = activeRecord.id;
  closeRecord();
  route("notebook");

  $("#noteRecord").value = id;
  $("#noteText").focus();
});

// Live search and filters.
["searchInput", "typeFilter", "areaFilter"].forEach(id => {
  const eventName = id === "searchInput" ? "input" : "change";

  $("#" + id).addEventListener(eventName, renderRecords);
});

$("#clearFilters").addEventListener("click", () => {
  $("#searchInput").value = "";
  $("#typeFilter").value = "";
  $("#areaFilter").value = "";
  renderRecords();
});

// Display saved analyst notes.
function renderNotes() {
  const list = $("#savedNotes");
  list.replaceChildren();

  $("#notesCount").textContent =
    `${notes.length} saved note${notes.length === 1 ? "" : "s"}`;

  if (!notes.length) {
    const p = document.createElement("p");
    p.className = "note-placeholder";
    p.textContent =
      "Nothing saved yet. Open a source record and record what needs closer review.";
    list.append(p);
  }

  notes.forEach(n => {
    const card = document.createElement("article");
    card.className = "saved-note";

    const meta = document.createElement("div");
    meta.className = "note-meta";
    meta.textContent = `${n.record || "GENERAL"} · ${n.created}`;

    const p = document.createElement("p");
    p.textContent = n.text;

    const del = document.createElement("button");
    del.className = "note-delete";
    del.textContent = "Delete note";

    del.addEventListener("click", () => {
      notes = notes.filter(x => x.id !== n.id);
      saveNotes();
      renderNotes();
      renderSummary();
    });

    card.append(meta, p, del);
    list.append(card);
  });
}

// Save a new analyst observation.
$("#saveNote").addEventListener("click", () => {
  const value = $("#noteText").value.trim();

  if (!value) {
    $("#saveStatus").textContent =
      "Write an observation before saving.";
    return;
  }

  notes.unshift({
    id: Date.now() + Math.random(),
    record: $("#noteRecord").value,
    text: value,
    created: new Date().toLocaleString()
  });

  if (!saveNotes()) {
    $("#saveStatus").textContent =
      "Browser storage is unavailable; this note may not persist.";
  } else {
    $("#saveStatus").textContent =
      "Observation saved on this device.";
  }

  $("#noteText").value = "";
  $("#noteRecord").value = "";

  renderNotes();
  renderSummary();
});

// Export the fictional case records as CSV.
$("#exportBtn").addEventListener("click", () => {
  const columns = [
    "id", "date", "time", "type",
    "area", "people", "summary", "source"
  ];

  const csv = [
    columns.join(","),
    ...records.map(r =>
      columns.map(k =>
        '"' + String(r[k]).replaceAll('"', '""') + '"'
      ).join(",")
    )
  ].join("\r\n");

  const link = document.createElement("a");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" })
  );

  link.href = url;
  link.download = "CW-026-fictional-incident-records.csv";
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

// Initialize application.
function init() {
  for (const type of distinct("type")) {
    $("#typeFilter").add(new Option(type, type));
  }

  for (const area of distinct("area")) {
    $("#areaFilter").add(new Option(area, area));
  }

  for (const r of [...records].reverse()) {
    $("#noteRecord").add(
      new Option(`${r.id} — ${r.type}`, r.id)
    );
  }

  renderSummary();
  renderRecords();
  renderTimeline();
  renderNotes();
}

init();
