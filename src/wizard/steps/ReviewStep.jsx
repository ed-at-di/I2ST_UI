import { CircleAlert, FileSpreadsheet, Play, RefreshCcw } from "lucide-react";
import { PreviewField } from "../../components/PreviewField.jsx";

export function ReviewStep({ scenario, preview, isManualSource, status, error, busy, loading, onRegenerate, onExport, onStartChat }) {
  return (
    <div className="wizardStepBody reviewStepBody">
      <div className="previewHeading">
        <h2>New Scenario Preview</h2>
        {status && <span>{status}</span>}
      </div>
      <p className="wizardStepIntro">Double check everything below before starting the chat — this is your last chance to make changes.</p>

      {error && (
        <div className="errorBanner" role="alert">
          <CircleAlert size={17} />
          <span>{error}</span>
        </div>
      )}

      <div className="previewScroll">
        {scenario ? (
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
        ) : (
          <p className="homeEmptyState">Generate the scenario to see a full preview here.</p>
        )}
      </div>

      <div className="wizardActions reviewActions">
        <button className="secondaryButton" type="button" onClick={onRegenerate} disabled={busy || loading}>
          <RefreshCcw size={16} />
          <span>{busy ? "Working..." : isManualSource ? "Load Source Scenario" : "Regenerate Scenario"}</span>
        </button>
        <button className="secondaryButton" type="button" onClick={onExport} disabled={busy || loading || !scenario}>
          <FileSpreadsheet size={16} />
          <span>Export Scenario</span>
        </button>
        <button className="primaryButton" type="button" onClick={onStartChat} disabled={busy || loading || !scenario}>
          <Play size={16} />
          <span>Start Chat</span>
        </button>
      </div>
    </div>
  );
}
