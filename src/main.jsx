import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import XLSX from "xlsx-js-style";
import { RuntimeChatScreen } from "./chatbot-ui/RuntimeChatScreen.jsx";
import { AppHeader } from "./components/AppHeader.jsx";
import { HomeScreen } from "./screens/HomeScreen.jsx";
import { ScenarioWizard, STEPS, wizardStepsForMode } from "./wizard/ScenarioWizard.jsx";
import { DEFAULT_FORM, NEW_SCENARIO_FORM } from "./data/scenarioOptions.js";
import { demoApi, demoUiApi } from "./demo/demoApi.js";
import {
  competencyDetails,
  firstSource,
  formatLatency,
  loadLocalCurriculumRows,
  previewFromFormOrScenario,
  scenarioFromCatalogItem,
  selectedCompetencies,
  sourceLabel,
  writeScenarioWorkbook,
} from "./lib/scenarioHelpers.js";
import { activeScenarioStages, stageCountFromForm } from "./lib/stageHelpers.js";
import "@fontsource-variable/atkinson-hyperlegible-next/wght.css";
import "@fontsource-variable/atkinson-hyperlegible-next/wght-italic.css";
import "./styles.css";

const API_BASE = "/chatbot";
const DEMO_MODE = import.meta.env.MODE === "demo" || import.meta.env.VITE_DEMO_MODE === "true";

async function api(path, options = {}) {
  if (DEMO_MODE) return demoApi(path, options);
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
  if (DEMO_MODE) return demoUiApi(path, options);
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

function App() {
  const [catalog, setCatalog] = useState({ curriculumScenarios: [], scenarios: [], personas: [], counts: {} });
  const [health, setHealth] = useState({ ok: false, sessions: 0 });
  const [form, setForm] = useState(DEFAULT_FORM);
  const [scenario, setScenario] = useState(null);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [view, setView] = useState("home"); // "home" | "wizard" | "runtime"
  const [wizardStep, setWizardStep] = useState(0);
  const [creationMode, setCreationMode] = useState("new"); // "new" | "existing"
  const [existingOriginalName, setExistingOriginalName] = useState("");
  const [existingCopyName, setExistingCopyName] = useState("");
  const [existingCopySaved, setExistingCopySaved] = useState(false);
  const [existingCopyDirty, setExistingCopyDirty] = useState(false);
  const [draftActive, setDraftActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const scrollRef = useRef(null);

  const source = useMemo(() => firstSource(catalog, form), [catalog, form]);
  const preview = useMemo(() => previewFromFormOrScenario(scenario, form, source), [scenario, form, source]);
  const isManualSource = form.sourceScenarioMode === "manual";
  const competencies = selectedCompetencies(form);

  function suggestedCopyName(originalName) {
    return `${originalName || "Scenario"} 02`;
  }

  function prepareExistingCopy(originalName) {
    setExistingOriginalName(originalName);
    setExistingCopyName(suggestedCopyName(originalName));
    setExistingCopySaved(false);
    setExistingCopyDirty(false);
  }

  function updateForm(patch) {
    if (creationMode === "existing" && view === "wizard") {
      if (patch.curriculumScenarioId) {
        const selectedSource = catalog.curriculumScenarios.find(
          (item) => item.curriculum_scenario_id === patch.curriculumScenarioId
        );
        prepareExistingCopy(sourceLabel(selectedSource, catalog.curriculumScenarios));
      } else {
        setExistingCopySaved(false);
        setExistingCopyDirty(true);
      }
    }
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
    const stages = activeScenarioStages(form);
    return {
      ...form,
      stageCount: stageCountFromForm(form),
      stages,
      competencyFocus: focusTitles.join(", "),
      competencyFocuses: focusTitles,
      competencyFocusDetails: competencyDetails(focusTitles),
      curriculumScenarioId: isManualSource ? form.curriculumScenarioId || source?.curriculum_scenario_id || "" : "",
      scenarioName: creationMode === "existing" ? existingCopyName.trim() : "",
    };
  }

  async function requestScenarioPacket() {
    const result = await uiApi("/scenarios/generate", {
      method: "POST",
      body: JSON.stringify(payloadFromForm()),
    });
    if (creationMode !== "existing" || !existingCopyName.trim()) return result;
    return {
      ...result,
      title: existingCopyName.trim(),
      preview: {
        ...(result.preview || {}),
        scenarioTitle: existingCopyName.trim(),
      },
    };
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

  async function openChatSession(activeScenario) {
    const result = await api("/sessions", {
      method: "POST",
      body: JSON.stringify({ scenario: activeScenario.isCatalogStub ? activeScenario.scenario_id : activeScenario }),
    });
    setSession(result);
    setMessages([{ role: "avatar", text: result.avatar || "No response returned.", latencyMs: result.latency_ms }]);
    const healthResult = await api("/health").catch(() => null);
    if (healthResult) setHealth(healthResult);
    setStatus(`Chat started · ${formatLatency(result.latency_ms)}`);
    setView("runtime");
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
      await openChatSession(activeScenario);
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
      writeScenarioWorkbook(XLSX, activeScenario);
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

  function resetForm(overrides = {}) {
    setForm({
      ...DEFAULT_FORM,
      curriculumScenarioId: catalog.curriculumScenarios?.[0]?.curriculum_scenario_id || "",
      ...overrides,
    });
    setScenario(null);
    setSession(null);
    setMessages([]);
    setStatus("");
    setError("");
  }

  function startNewScenario() {
    resetForm(NEW_SCENARIO_FORM);
    setCreationMode("new");
    setExistingOriginalName("");
    setExistingCopyName("");
    setExistingCopySaved(false);
    setExistingCopyDirty(false);
    setWizardStep(1);
    setDraftActive(true);
    setView("wizard");
  }

  function startFromExistingScenario() {
    const initialSource = catalog.curriculumScenarios[0];
    resetForm({ sourceScenarioMode: "manual" });
    setCreationMode("existing");
    prepareExistingCopy(sourceLabel(initialSource, catalog.curriculumScenarios));
    setWizardStep(0);
    setDraftActive(true);
    setView("wizard");
  }

  async function openAssignedScenario(item) {
    const activeScenario = scenarioFromCatalogItem(item);
    setBusy(true);
    setError("");
    setMessages([]);
    setScenario(activeScenario);
    setDraftActive(false);
    try {
      await openChatSession(activeScenario);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function updateExistingCopyName(value) {
    setExistingCopyName(value);
    setExistingCopySaved(false);
    setExistingCopyDirty(true);
    setScenario(null);
    setSession(null);
    setMessages([]);
    setStatus("");
  }

  function saveExistingCopy() {
    const name = existingCopyName.trim();
    if (!name || name === existingOriginalName.trim()) return;
    setExistingCopyName(name);
    setExistingCopySaved(true);
    setExistingCopyDirty(false);
    setStatus(`Saved as “${name}”`);
  }

  function returnHome() {
    setView("home");
    loadCatalog();
  }

  function endTrainingSession() {
    setSession(null);
    setMessages([]);
    setInput("");
    setStatus("Training session ended");
    setView("home");
    loadCatalog();
  }

  function resumeDraft() {
    setView(session ? "runtime" : "wizard");
  }

  function deleteDraft() {
    resetForm();
    setWizardStep(0);
    setDraftActive(false);
  }

  const draftRoleLabel = (form.chatbotRole === "Other" ? form.chatbotRoleOther : form.chatbotRole) || "Scenario";
  const draftSteps = creationMode === "new" ? STEPS.filter((item) => item.key !== "source") : STEPS;
  const draftStepIndex = Math.max(0, draftSteps.findIndex((item) => item.key === STEPS[wizardStep]?.key));
  const draft = draftActive
    ? {
        title:
          scenario?.title ||
          (creationMode === "existing" ? existingCopyName : "") ||
          preview.scenarioTitle ||
          `${draftRoleLabel}: Draft Scenario`,
        role: scenario?.role || draftRoleLabel,
        stepLabel: session ? "In chat" : `Step ${draftStepIndex + 1} of ${draftSteps.length} · ${STEPS[wizardStep]?.label}`,
      }
    : null;

  let body;
  if (view === "runtime" && session) {
    body = (
      <RuntimeChatScreen
        busy={busy}
        error={error}
        formatLatency={formatLatency}
        input={input}
        messages={messages}
        scenario={scenario}
        scrollRef={scrollRef}
        sendTurn={sendTurn}
        session={session}
        setInput={setInput}
      />
    );
  } else if (view === "wizard") {
    body = (
      <ScenarioWizard
        step={wizardStep}
        setStep={setWizardStep}
        form={form}
        updateForm={updateForm}
        catalog={catalog}
        source={source}
        isManualSource={isManualSource}
        competencies={competencies}
        scenario={scenario}
        preview={preview}
        status={status}
        error={error}
        busy={busy}
        loading={loading}
        onRegenerate={generateScenario}
        onExport={exportScenarioExcel}
        onStartChat={startSession}
        creationMode={creationMode}
        existingCopyName={existingCopyName}
        existingOriginalName={existingOriginalName}
        existingCopySaved={existingCopySaved}
        existingCopyDirty={existingCopyDirty}
        onExistingCopyNameChange={updateExistingCopyName}
        onSaveExistingCopy={saveExistingCopy}
      />
    );
  } else {
    body = (
      <HomeScreen
        scenarios={catalog.scenarios || []}
        loading={loading}
        onCreateNew={startNewScenario}
        onCreateFromExisting={startFromExistingScenario}
        onOpenAssignedScenario={openAssignedScenario}
        draft={draft}
        onResumeDraft={resumeDraft}
        onDeleteDraft={deleteDraft}
      />
    );
  }

  return (
    <div className="appShell">
      <AppHeader
        runtimeSession={
          view === "runtime" && session
            ? {
                title: scenario?.title || scenario?.preview?.scenarioTitle || "Scenario session",
                onExport: exportScenarioExcel,
                exportDisabled: busy || !scenario,
                onEndSession: endTrainingSession,
              }
            : undefined
        }
        wizardNavigation={
          view === "wizard"
            ? {
                steps: wizardStepsForMode(creationMode),
                step: wizardStep,
                onStepChange: setWizardStep,
                onExitToHome: returnHome,
              }
            : undefined
        }
      />
      {body}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
