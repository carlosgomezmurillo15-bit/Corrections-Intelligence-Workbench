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
