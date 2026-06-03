import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CircleAlert,
  FileSpreadsheet,
  Info,
  Play,
  RefreshCcw,
  RotateCcw,
} from "lucide-react";
import XLSX from "xlsx-js-style";
import { RuntimeChatScreen } from "./chatbot-ui/RuntimeChatScreen.jsx";
import "./styles.css";

const API_BASE = "/chatbot";

const CHATBOT_ROLES = ["Complainant", "Witness", "Subject", "Other"];
const COMPETENCY_OPTIONS = [
  { title: "Empathy & Support", details: ["Empathy & Reassurance", "Active Listening", "Crisis Management"] },
  {
    title: "Communication Skills",
    details: ["Clarity of Communication", "Non-Verbal Communication", "Questioning Technique", "Professionalism & Composure"],
  },
  { title: "Credibility & Problem-Solving", details: ["Resolution & Procedural Competency", "Documenting Information"] },
];
const FACTOR_OPTIONS = [
  "Race/Ethnicity",
  "Sex",
  "Religion",
  "Sexual Orientation",
  "Disability-Based",
  "Age",
  "National Origin",
  "Pregnancy/Parental Issue",
  "Military/Veteran Status",
  "Other",
];
const COMPLEXITY_OPTIONS = [
  "Maximized Emotional Intensity",
  "Organizational and Systemic Challenges",
  "Ethical Dilemmas and Ambiguity",
  "Other",
];
const PERSONA_STYLE_OPTIONS = [
  "Frustrated Skeptic",
  "Reluctant Witness",
  "Defensive Respondent",
  "Anxious Reporter",
  "Over-Explaining Narrator",
  "Cautious Professional",
  "Other",
];
const PERSONA_EMOTIONAL_STATE_OPTIONS = ["Frustrated", "Anxious", "Defensive", "Guarded", "Confused", "Overwhelmed", "Other"];
const PERSONA_TRUST_LEVEL_OPTIONS = ["Low trust", "Mixed trust", "Cautiously cooperative", "High trust but worried", "Other"];
const PERSONA_COMMUNICATION_STYLE_OPTIONS = [
  "Direct and brief",
  "Detailed and narrative",
  "Hesitant and careful",
  "Emotional and urgent",
  "Formal and guarded",
  "Other",
];
const PERSONA_PRIMARY_CONCERN_OPTIONS = [
  "Being dismissed",
  "Retaliation",
  "Privacy and confidentiality",
  "Fair process",
  "Being blamed",
  "Immediate safety",
  "Other",
];

const DEFAULT_FORM = {
  sourceScenarioMode: "auto",
  curriculumScenarioId: "",
  chatbotRole: "Complainant",
  chatbotRoleOther: "",
  competencyFocus: "Empathy & Support",
  competencyFocuses: ["Empathy & Support"],
  scenarioFactors: ["Sexual Orientation", "Pregnancy/Parental Issue"],
  scenarioComplexities: ["Maximized Emotional Intensity"],
  otherFactor: "",
  otherComplexity: "",
  chatbotBehaviorNotes: "",
  otherDetails: "",
  personaStyle: "Frustrated Skeptic",
  personaStyleOther: "",
  personaEmotionalState: "Frustrated",
  personaEmotionalStateOther: "",
  personaTrustLevel: "Low trust",
  personaTrustLevelOther: "",
  personaCommunicationStyle: "Direct and brief",
  personaCommunicationStyleOther: "",
  personaPrimaryConcern: "Being dismissed",
  personaPrimaryConcernOther: "",
  personaNotes: "",
  difficulty: "Expert",
};

function formatLatency(ms) {
  if (ms === null || ms === undefined) return "";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text };
    }
  }
  if (!response.ok) {
    throw new Error(data.detail || `Request failed with status ${response.status}`);
  }
  return data;
}

async function uiApi(path, options = {}) {
  const response = await fetch(`/ui-api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.error || `Request failed with status ${response.status}`);
  }
  return data;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const headers = rows.shift()?.map((item) => item.trim()) || [];
  return rows
    .filter((items) => items.some((item) => item.trim()))
    .map((items) => Object.fromEntries(headers.map((header, index) => [header, items[index] || ""])));
}

async function loadLocalCurriculumRows() {
  try {
    const response = await fetch("/data/curriculum_scenarios.csv", { cache: "no-store" });
    if (!response.ok) return [];
    return parseCsv(await response.text());
  } catch {
    return [];
  }
}

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function slug(value, fallback = "scenario") {
  const out = clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return out || fallback;
}

function timestampForFilename(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

function exportScenarioFilename(scenario) {
  const titleSlug = slug(scenario.title).slice(0, 72).replace(/-+$/g, "") || "scenario";
  return `i2st-scenario-record-${titleSlug}-${timestampForFilename()}.xlsx`;
}

function arrayToggle(values, value) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function selectedCompetencies(form) {
  return Array.isArray(form.competencyFocuses) ? form.competencyFocuses : form.competencyFocus ? [form.competencyFocus] : [];
}

function competencyDetails(titles) {
  const out = [];
  titles.forEach((title) => {
    const option = COMPETENCY_OPTIONS.find((item) => item.title === title);
    (option?.details || []).forEach((detail) => {
      if (!out.includes(detail)) out.push(detail);
    });
  });
  return out;
}

function sourceReference(source) {
  if (!source) return "";
  return ["SJT curriculum PDF", source.curriculum_scenario_id, source.source_page ? `page ${source.source_page}` : ""]
    .filter(Boolean)
    .join(" · ");
}

function sourceLabel(source, rows) {
  if (!source) return "";
  const category = clean(source.category || "Source scenario");
  const subcategory = clean(source.subcategory || category);
  const sameType = rows.filter((item) => clean(item.category) === clean(source.category) && clean(item.subcategory) === clean(source.subcategory));
  const index = sameType.findIndex((item) => item.curriculum_scenario_id === source.curriculum_scenario_id);
  const scenarioNumber = index >= 0 ? index + 1 : source.item_number || "";
  return `${category} - ${subcategory} - Scenario ${scenarioNumber}`.trim();
}

function firstSource(catalog, form) {
  const rows = catalog.curriculumScenarios || [];
  return rows.find((item) => item.curriculum_scenario_id === form.curriculumScenarioId) || rows[0] || null;
}

function formValue(form, key, otherKey) {
  const value = clean(form[key]);
  if (value === "Other" && otherKey) return clean(form[otherKey]);
  return value;
}

function selectedList(values, otherValue) {
  return values.map((item) => (item === "Other" && otherValue ? otherValue : item)).filter(Boolean);
}

function previewFromFormOrScenario(scenario, form, source) {
  if (!scenario) {
    return {
      chatbotRole: "",
      competencyFocus: "",
      scenarioFactors: "",
      scenarioComplexities: "",
      sourceScenario: "",
      avatarName: "",
      personaDetails: "",
      otherDetails: "",
      scenarioTitle: "",
      scenarioSummary: "",
      inContextPersonaSummary: "",
    };
  }
  const competencies = selectedCompetencies(form);
  const factorList = selectedList(form.scenarioFactors, form.otherFactor);
  const complexityList = selectedList(form.scenarioComplexities, form.otherComplexity);
  const authoring = scenario?.authoring || {};
  const persona = scenario?.persona || {};
  const sourceMode = authoring.payload?.sourceScenarioMode || form.sourceScenarioMode;
  const authoredSource = sourceMode === "manual" ? authoring.sourceContext?.scenario : null;
  const previewSource = authoredSource && Object.keys(authoredSource).length ? authoredSource : null;
  const sourceText = previewSource ? [sourceLabel(previewSource, []), clean(previewSource.scenario_text), authoring.sourceContext?.reference || sourceReference(previewSource)].filter(Boolean).join("\n") : "";
  const personaDetails = [
    `Style: ${persona.style || formValue(form, "personaStyle", "personaStyleOther")}`,
    `Emotional start: ${persona.emotional_state || formValue(form, "personaEmotionalState", "personaEmotionalStateOther")}`,
    `Trust level: ${persona.trust_level || formValue(form, "personaTrustLevel", "personaTrustLevelOther")}`,
    `Communication: ${persona.communication_style || formValue(form, "personaCommunicationStyle", "personaCommunicationStyleOther")}`,
    `Primary concern: ${persona.primary_concern || formValue(form, "personaPrimaryConcern", "personaPrimaryConcernOther")}`,
    persona.notes || form.personaNotes ? `Persona notes: ${persona.notes || form.personaNotes}` : "",
    persona.behavior_notes || form.chatbotBehaviorNotes ? `Behavior notes: ${persona.behavior_notes || form.chatbotBehaviorNotes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const inContextPersonaSummary =
    authoring.inContextPersonaSummary ||
    [
      scenario.role,
      persona.style || formValue(form, "personaStyle", "personaStyleOther"),
      persona.emotional_state || formValue(form, "personaEmotionalState", "personaEmotionalStateOther"),
      persona.trust_level || formValue(form, "personaTrustLevel", "personaTrustLevelOther"),
      persona.communication_style || formValue(form, "personaCommunicationStyle", "personaCommunicationStyleOther"),
      persona.primary_concern || formValue(form, "personaPrimaryConcern", "personaPrimaryConcernOther"),
    ]
      .filter(Boolean)
      .join(" / ");

  return {
    chatbotRole: scenario.role || formValue(form, "chatbotRole", "chatbotRoleOther"),
    competencyFocus: `${competencies.join(", ") || "None"}\n(${competencyDetails(competencies).join(", ") || "No details"})`,
    scenarioFactors: factorList.join(", ") || "None",
    scenarioComplexities: complexityList.join(", ") || "None",
    sourceScenario: sourceText,
    avatarName: scenario.avatar_name || "Avatar",
    personaDetails,
    otherDetails: form.otherDetails || "None",
    scenarioTitle: scenario.title || `${formValue(form, "chatbotRole", "chatbotRoleOther")}: Workplace Concern`,
    scenarioSummary:
      scenario.summary ||
      [
        clean(source?.scenario_text),
        `Role: ${formValue(form, "chatbotRole", "chatbotRoleOther")}.`,
        `Training focus: ${competencies.join(", ") || "workplace conversation"}.`,
        `Factors: ${factorList.join(", ") || "not specified"}.`,
        `Complexities: ${complexityList.join(", ") || "none selected"}.`,
        form.otherDetails,
      ]
        .filter(Boolean)
        .join(" "),
    inContextPersonaSummary,
  };
}

function InfoMark() {
  return (
    <span className="infoMark" title="This control is passed into the scenario authoring request.">
      <Info size={12} />
    </span>
  );
}

function StudioLabel({ children, required = false, info = true }) {
  return (
    <span className="studioLabel">
      {children}
      {required ? "*" : ""}
      {info ? <InfoMark /> : null}
    </span>
  );
}

function PersonaSelect({ label, value, options, otherValue, onChange, onOtherChange, placeholder }) {
  const isOther = value === "Other";
  return (
    <label className="personaSelect">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      {isOther && <input value={otherValue} onChange={(event) => onOtherChange(event.target.value)} placeholder={placeholder} />}
    </label>
  );
}

function PreviewField({ label, value, multiline = false, boxed = false }) {
  return (
    <div className={`previewField ${multiline ? "multiline" : ""} ${boxed ? "boxed" : ""} ${clean(value) ? "" : "empty"}`}>
      <span>{label}</span>
      <p>{clean(value) ? value : "\u00a0"}</p>
    </div>
  );
}

function writeScenarioWorkbook(scenario) {
  const authoring = scenario.authoring || {};
  const payload = authoring.payload || {};
  const sourceContext = authoring.sourceContext || {};
  const isSourceLibraryScenario = (payload.sourceScenarioMode || "") === "manual" || authoring.generatedBy === "source-library";
  const sourceScenario = isSourceLibraryScenario ? sourceContext.scenario || {} : {};
  const persona = scenario.persona || {};
  const focusTitles = selectedList(payload.competencyFocuses || [], "");
  const primaryFocus = focusTitles[0] || clean(payload.competencyFocus).split(",")[0] || "None";
  const factorText = selectedList(payload.scenarioFactors || [], payload.otherFactor).join(", ") || "None";
  const complexityText = selectedList(payload.scenarioComplexities || [], payload.otherComplexity).join(", ") || "None";
  const personaDetails = [
    persona.style ? `Style: ${persona.style}` : "",
    persona.emotional_state ? `Emotional start: ${persona.emotional_state}` : "",
    persona.trust_level ? `Trust level: ${persona.trust_level}` : "",
    persona.communication_style ? `Communication: ${persona.communication_style}` : "",
    persona.primary_concern ? `Primary concern: ${persona.primary_concern}` : "",
    persona.notes ? `Persona notes: ${persona.notes}` : "",
    persona.behavior_notes ? `Behavior notes: ${persona.behavior_notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const sourceText =
    isSourceLibraryScenario && (clean(sourceScenario.scenario_text) || clean(sourceScenario.curriculum_scenario_id))
      ? [
          sourceLabel(sourceScenario, []),
          clean(sourceScenario.scenario_text),
          sourceContext.reference || sourceReference(sourceScenario),
        ]
          .filter(Boolean)
          .join("\n")
      : "";
  const inContextPersonaSummary =
    authoring.inContextPersonaSummary ||
    [
      scenario.role,
      persona.style,
      persona.emotional_state,
      persona.trust_level,
      persona.communication_style,
      persona.primary_concern,
    ]
      .filter(Boolean)
      .join(" / ");
  const rows = [
    { kind: "title", cells: ["Scenario Record", ""] },
    { group: "scenario", cells: ["Chatbot Role", scenario.role || ""] },
    { group: "scenario", cells: ["Competency Focus", primaryFocus] },
    { group: "scenario", cells: ["Scenario Factors", factorText] },
    { group: "scenario", cells: ["Scenario Complexities", complexityText] },
    ...(isSourceLibraryScenario ? [{ group: "scenario", cells: ["Source Curriculum Scenario", sourceText] }] : []),
    { group: "scenario", cells: ["Other Details", payload.otherDetails || "None"] },
    { group: "persona", cells: ["Chatbot Character", scenario.avatar_name || ""] },
    { group: "persona", cells: ["Persona Inputs", personaDetails] },
    { group: "summary", kind: "boxed", cells: ["Scenario Title", scenario.title || ""] },
    { group: "summary", cells: ["Scenario Summary", scenario.summary || ""] },
    { group: "summary", cells: ["In-Context Persona Summary", inContextPersonaSummary] },
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(rows.map((row) => row.cells));
  worksheet["!cols"] = [{ wch: 30 }, { wch: 105 }];
  worksheet["!merges"] = rows
    .map((row, index) => (row.kind === "title" ? { s: { r: index, c: 0 }, e: { r: index, c: 1 } } : null))
    .filter(Boolean);
  rows.forEach((row, rowIndex) => {
    for (let colIndex = 0; colIndex < 2; colIndex += 1) {
      const ref = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
      if (!worksheet[ref]) worksheet[ref] = { t: "s", v: "" };
      const groupColors = {
        scenario: { label: "EAF7FB", value: "F6FCFE" },
        persona: { label: "FCEAEA", value: "FFF7F7" },
        summary: { label: "EAF7EC", value: "F7FFF8" },
      };
      const colors = groupColors[row.group] || groupColors.scenario;
      const baseStyle = {
        alignment: { vertical: "top", wrapText: true },
        border: {
          top: { style: "thin", color: { rgb: "D9E1E5" } },
          bottom: { style: "thin", color: { rgb: "D9E1E5" } },
          left: { style: "thin", color: { rgb: "D9E1E5" } },
          right: { style: "thin", color: { rgb: "D9E1E5" } },
        },
      };
      if (row.kind === "title") {
        worksheet[ref].s = {
          ...baseStyle,
          fill: { fgColor: { rgb: "078DA2" } },
          font: { color: { rgb: "FFFFFF" }, bold: true, sz: 16 },
        };
      } else if (row.kind === "boxed") {
        worksheet[ref].s = {
          ...baseStyle,
          fill: { fgColor: { rgb: colIndex === 0 ? colors.label : colors.value } },
          font: { color: { rgb: "374451" }, bold: true },
        };
      } else {
        worksheet[ref].s = {
          ...baseStyle,
          fill: { fgColor: { rgb: colIndex === 0 ? colors.label : colors.value } },
          font: { color: { rgb: "374451" }, bold: colIndex === 0 },
        };
      }
    }
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Scenario Record");
  XLSX.writeFile(workbook, exportScenarioFilename(scenario));
}

function App() {
  const [catalog, setCatalog] = useState({ curriculumScenarios: [], scenarios: [], personas: [], counts: {} });
  const [health, setHealth] = useState({ ok: false, sessions: 0 });
  const [form, setForm] = useState(DEFAULT_FORM);
  const [scenario, setScenario] = useState(null);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [view, setView] = useState("studio");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const scrollRef = useRef(null);

  const source = useMemo(() => firstSource(catalog, form), [catalog, form]);
  const preview = useMemo(() => previewFromFormOrScenario(scenario, form, source), [scenario, form, source]);
  const isManualSource = form.sourceScenarioMode === "manual";
  const competencies = selectedCompetencies(form);

  function updateForm(patch) {
    setForm((current) => ({ ...current, ...patch }));
    setScenario(null);
    setSession(null);
    setMessages([]);
    setStatus("");
  }

  async function loadCatalog() {
    setLoading(true);
    setError("");
    try {
      const [healthResult, catalogResult, localCurriculumRows] = await Promise.all([
        api("/health").catch(() => ({ ok: false, sessions: 0 })),
        api("/catalog/ui"),
        loadLocalCurriculumRows(),
      ]);
      setHealth(healthResult);
      const curriculumScenarios = localCurriculumRows.length ? localCurriculumRows : catalogResult.curriculumScenarios || [];
      setCatalog({
        ...catalogResult,
        curriculumScenarios,
        counts: {
          ...(catalogResult.counts || {}),
          curriculumScenarios: curriculumScenarios.length,
        },
      });
      setForm((current) => ({
        ...current,
        curriculumScenarioId: current.curriculumScenarioId || curriculumScenarios[0]?.curriculum_scenario_id || "",
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    if (!messages.length) return;
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [messages, busy]);

  function payloadFromForm() {
    const focusTitles = selectedCompetencies(form);
    return {
      ...form,
      competencyFocus: focusTitles.join(", "),
      competencyFocuses: focusTitles,
      competencyFocusDetails: competencyDetails(focusTitles),
      curriculumScenarioId: isManualSource ? form.curriculumScenarioId || source?.curriculum_scenario_id || "" : "",
    };
  }

  async function requestScenarioPacket() {
    return uiApi("/scenarios/generate", {
      method: "POST",
      body: JSON.stringify(payloadFromForm()),
    });
  }

  async function generateScenario() {
    setBusy(true);
    setError("");
    setStatus("");
    const started = performance.now();
    try {
      const result = await requestScenarioPacket();
      setScenario(result);
      const elapsed = Math.max(1, Math.round(performance.now() - started));
      setStatus(isManualSource ? `Source scenario loaded in ${elapsed} ms` : `Scenario generated in ${elapsed} ms`);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function startSession() {
    setBusy(true);
    setError("");
    setMessages([]);
    try {
      let activeScenario = scenario;
      if (!activeScenario) {
        const result = await requestScenarioPacket();
        setScenario(result);
        activeScenario = result;
      }
      const result = await api("/sessions", {
        method: "POST",
        body: JSON.stringify({ scenario: activeScenario }),
      });
      setSession(result);
      setMessages([{ role: "avatar", text: result.avatar || "No response returned.", latencyMs: result.latency_ms }]);
      const healthResult = await api("/health").catch(() => null);
      if (healthResult) setHealth(healthResult);
      setStatus(`Chat started · ${formatLatency(result.latency_ms)}`);
      setView("runtime");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function exportScenarioExcel() {
    setBusy(true);
    setError("");
    try {
      let activeScenario = scenario;
      if (!activeScenario) {
        activeScenario = await requestScenarioPacket();
        setScenario(activeScenario);
      }
      writeScenarioWorkbook(activeScenario);
      setStatus("Scenario export created");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function sendTurn(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || !session?.session_id || busy) return;
    setInput("");
    setBusy(true);
    setError("");
    setMessages((current) => [...current, { role: "trainee", text }]);
    try {
      const result = await api(`/sessions/${session.session_id}/turns`, {
        method: "POST",
        body: JSON.stringify({ message: text }),
      });
      setMessages((current) => [
        ...current,
        {
          role: "avatar",
          text: result.avatar || "No response returned.",
          latencyMs: result.latency_ms,
          fallback: result.fallback,
          repairUsed: result.repair_used,
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function clearForm() {
    setForm({
      ...DEFAULT_FORM,
      curriculumScenarioId: catalog.curriculumScenarios?.[0]?.curriculum_scenario_id || "",
    });
    setScenario(null);
    setSession(null);
    setMessages([]);
    setStatus("");
    setError("");
    setView("studio");
  }

  function returnToStudio() {
    setView("studio");
  }

  if (view === "runtime" && session) {
    return (
      <div className="appShell">
        <RuntimeChatScreen
          busy={busy}
          error={error}
          exportScenario={exportScenarioExcel}
          formatLatency={formatLatency}
          health={health}
          input={input}
          messages={messages}
          scenario={scenario}
          scrollRef={scrollRef}
          sendTurn={sendTurn}
          session={session}
          setInput={setInput}
          status={status}
          returnToStudio={returnToStudio}
        />
      </div>
    );
  }

  return (
    <div className="appShell">
      <main className="studioWorkspace">
        <section className="studioCard scenarioFormCard">
          <h2>Create New Scenario</h2>

          <div className="studioGroup sourceScenarioSection">
            <StudioLabel>Source Curriculum Scenario</StudioLabel>
            <div className="sourceModeRow">
              <label className="checkRow">
                <input
                  type="radio"
                  name="sourceScenarioMode"
                  checked={isManualSource}
                  onChange={() =>
                    updateForm({
                      sourceScenarioMode: "manual",
                      curriculumScenarioId: form.curriculumScenarioId || catalog.curriculumScenarios?.[0]?.curriculum_scenario_id || "",
                    })
                  }
                />
                <span>Choose from source library</span>
              </label>
              <label className="checkRow">
                <input type="radio" name="sourceScenarioMode" checked={!isManualSource} onChange={() => updateForm({ sourceScenarioMode: "auto" })} />
                <span>Create from selections</span>
              </label>
            </div>

            {isManualSource && (
              <select className="sourceScenarioSelect" value={source?.curriculum_scenario_id || ""} onChange={(event) => updateForm({ curriculumScenarioId: event.target.value })}>
                {(catalog.curriculumScenarios || []).map((item) => (
                  <option key={item.curriculum_scenario_id} value={item.curriculum_scenario_id}>
                    {sourceLabel(item, catalog.curriculumScenarios || [])}
                  </option>
                ))}
              </select>
            )}

            <div className="sourceScenarioDetail">
              {isManualSource && source ? (
                <>
                  <p>{source.scenario_text}</p>
                  <span>{sourceReference(source)}</span>
                </>
              ) : (
                <>
                  <strong>Create from selections is on.</strong>
                  <span>The authoring layer will create a scenario packet from the role, competency, factors, complexities, and persona controls below.</span>
                  <p>The preview is populated only after the generated scenario packet is returned.</p>
                </>
              )}
            </div>

            <label className="studioField">
              <StudioLabel required>Chatbot Role</StudioLabel>
              <select value={form.chatbotRole} onChange={(event) => updateForm({ chatbotRole: event.target.value })}>
                {CHATBOT_ROLES.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
            {form.chatbotRole === "Other" && (
              <label className="studioField compactField">
                <span>Custom Chatbot Role</span>
                <input value={form.chatbotRoleOther} onChange={(event) => updateForm({ chatbotRoleOther: event.target.value })} placeholder="Direct manager" />
              </label>
            )}

            <div className="studioGroup innerStudioGroup competencyGroup">
              <StudioLabel required>Competency Focus</StudioLabel>
              <div className="checkboxGrid">
                {COMPETENCY_OPTIONS.map((focus) => (
                  <label className="checkRow" key={focus.title}>
                    <input
                      type="checkbox"
                      checked={competencies.includes(focus.title)}
                      onChange={() => {
                        const next = arrayToggle(competencies, focus.title);
                        updateForm({ competencyFocuses: next, competencyFocus: next[0] || "" });
                      }}
                    />
                    <span>{focus.title}</span>
                  </label>
                ))}
              </div>
            </div>

            {!isManualSource && (
              <div className="studioGroup generatedInputsSection">
                <StudioLabel info={false}>Create From Selection Inputs</StudioLabel>

                <div className="studioGroup innerStudioGroup factorGroup">
                  <StudioLabel info={false}>Select Scenario Factors</StudioLabel>
                  <div className="checkboxGrid">
                    {FACTOR_OPTIONS.map((factor) =>
                      factor === "Other" ? (
                        <div className="checkRow otherRow" key={factor}>
                          <label className="otherToggle">
                            <input type="checkbox" checked={form.scenarioFactors.includes(factor)} onChange={() => updateForm({ scenarioFactors: arrayToggle(form.scenarioFactors, factor) })} />
                            <span>{factor}</span>
                          </label>
                          <input className="otherFactor" value={form.otherFactor} onChange={(event) => updateForm({ otherFactor: event.target.value })} disabled={!form.scenarioFactors.includes(factor)} placeholder="Other" />
                        </div>
                      ) : (
                        <label className="checkRow" key={factor}>
                          <input type="checkbox" checked={form.scenarioFactors.includes(factor)} onChange={() => updateForm({ scenarioFactors: arrayToggle(form.scenarioFactors, factor) })} />
                          <span>{factor}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                <div className="studioGroup innerStudioGroup complexityGroup">
                  <StudioLabel info={false}>Select Any Additional Scenario Complexities:</StudioLabel>
                  <div className="complexityStack">
                    {COMPLEXITY_OPTIONS.map((complexity) =>
                      complexity === "Other" ? (
                        <div className="checkRow otherRow complexityOtherRow" key={complexity}>
                          <label className="otherToggle">
                            <input type="checkbox" checked={form.scenarioComplexities.includes(complexity)} onChange={() => updateForm({ scenarioComplexities: arrayToggle(form.scenarioComplexities, complexity) })} />
                            <span>{complexity}</span>
                          </label>
                          <input className="otherFactor" value={form.otherComplexity} onChange={(event) => updateForm({ otherComplexity: event.target.value })} disabled={!form.scenarioComplexities.includes(complexity)} placeholder="Other complexity" />
                          <InfoMark />
                        </div>
                      ) : (
                        <label className="checkRow" key={complexity}>
                          <input type="checkbox" checked={form.scenarioComplexities.includes(complexity)} onChange={() => updateForm({ scenarioComplexities: arrayToggle(form.scenarioComplexities, complexity) })} />
                          <span>{complexity}</span>
                          <InfoMark />
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            <label className="studioField">
              <StudioLabel>Chatbot Behavior Notes <em>(optional)</em></StudioLabel>
              <textarea value={form.chatbotBehaviorNotes} onChange={(event) => updateForm({ chatbotBehaviorNotes: event.target.value })} placeholder="Optional behavior notes for how the chatbot should speak or react in this scenario" />
            </label>

            <label className="studioField">
              <StudioLabel>Describe Other Details <em>(optional)</em></StudioLabel>
              <textarea value={form.otherDetails} onChange={(event) => updateForm({ otherDetails: event.target.value })} placeholder="Other details related to the scenario" />
            </label>
          </div>

          <div className="studioDivider" role="separator" aria-hidden="true" />

          <div className="studioGroup personaConfig">
            <StudioLabel info={false}>Select Chatbot Persona Details</StudioLabel>
            <div className="personaControlGrid">
              <PersonaSelect label="Style" value={form.personaStyle} options={PERSONA_STYLE_OPTIONS} otherValue={form.personaStyleOther} onChange={(value) => updateForm({ personaStyle: value })} onOtherChange={(value) => updateForm({ personaStyleOther: value })} placeholder="Custom persona style" />
              <PersonaSelect label="Emotional Start" value={form.personaEmotionalState} options={PERSONA_EMOTIONAL_STATE_OPTIONS} otherValue={form.personaEmotionalStateOther} onChange={(value) => updateForm({ personaEmotionalState: value })} onOtherChange={(value) => updateForm({ personaEmotionalStateOther: value })} placeholder="Custom emotional state" />
              <PersonaSelect label="Trust Level" value={form.personaTrustLevel} options={PERSONA_TRUST_LEVEL_OPTIONS} otherValue={form.personaTrustLevelOther} onChange={(value) => updateForm({ personaTrustLevel: value })} onOtherChange={(value) => updateForm({ personaTrustLevelOther: value })} placeholder="Custom trust level" />
              <PersonaSelect label="Communication" value={form.personaCommunicationStyle} options={PERSONA_COMMUNICATION_STYLE_OPTIONS} otherValue={form.personaCommunicationStyleOther} onChange={(value) => updateForm({ personaCommunicationStyle: value })} onOtherChange={(value) => updateForm({ personaCommunicationStyleOther: value })} placeholder="Custom communication style" />
              <PersonaSelect label="Primary Concern" value={form.personaPrimaryConcern} options={PERSONA_PRIMARY_CONCERN_OPTIONS} otherValue={form.personaPrimaryConcernOther} onChange={(value) => updateForm({ personaPrimaryConcern: value })} onOtherChange={(value) => updateForm({ personaPrimaryConcernOther: value })} placeholder="Custom primary concern" />
            </div>
            <label className="studioField">
              <StudioLabel>Persona Notes <em>(optional)</em></StudioLabel>
              <textarea value={form.personaNotes} onChange={(event) => updateForm({ personaNotes: event.target.value })} placeholder="Optional persona details that are not covered by the selections" />
            </label>
          </div>

          <div className="studioActions">
            <button className="secondaryButton" type="button" onClick={clearForm} disabled={busy}>
              <RotateCcw size={16} />
              <span>Clear All</span>
            </button>
            <button className="primaryButton" type="button" onClick={generateScenario} disabled={busy || loading}>
              <RefreshCcw size={16} />
              <span>{busy ? "Working..." : isManualSource ? "Load Source Scenario" : "Regenerate Scenario"}</span>
            </button>
          </div>
        </section>

        <section className="studioCard previewCard">
          <div className="previewHeading">
            <h2>New Scenario Preview</h2>
            {status && <span>{status}</span>}
          </div>
          {error && (
            <div className="errorBanner" role="alert">
              <CircleAlert size={17} />
              <span>{error}</span>
            </div>
          )}
          <div className="previewScroll">
            {scenario && (
              <>
                <PreviewField label="Chatbot Role" value={preview.chatbotRole} />
                <PreviewField label="Competency Focus" value={preview.competencyFocus} multiline />
                {!isManualSource && <PreviewField label="Scenario Factors" value={preview.scenarioFactors} />}
                {!isManualSource && <PreviewField label="Scenario Complexities" value={preview.scenarioComplexities} />}
                {isManualSource && <PreviewField label="Source Curriculum Scenario" value={preview.sourceScenario} multiline />}
                <PreviewField label="Chatbot Character" value={preview.avatarName} />
                <PreviewField label="Persona Inputs" value={preview.personaDetails} multiline />
                <PreviewField label="Other Details" value={preview.otherDetails} multiline />
                <PreviewField label="Scenario Title" value={preview.scenarioTitle} boxed />
                <PreviewField label="Scenario Summary" value={preview.scenarioSummary} multiline />
                <PreviewField label="In-Context Persona Summary" value={preview.inContextPersonaSummary} multiline />
              </>
            )}
          </div>
          <div className="previewActions">
            <button className="secondaryButton" type="button" onClick={exportScenarioExcel} disabled={busy || loading || !scenario}>
              <FileSpreadsheet size={16} />
              <span>Export Scenario</span>
            </button>
            <button className="primaryButton" type="button" onClick={startSession} disabled={busy || loading || !scenario}>
              <Play size={16} />
              <span>Start Chat</span>
            </button>
          </div>

        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
