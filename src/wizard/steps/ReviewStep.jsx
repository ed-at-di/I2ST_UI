import { CheckCircle2, CircleAlert, FileSpreadsheet, Play, RefreshCcw } from "lucide-react";

export function ReviewStep({ scenario, isManualSource, status, error, busy, loading, onRegenerate, onExport, onStartChat, copyMustBeSaved }) {
  return (
    <div className="wizardStepBody reviewStepBody">
      <h2>Review &amp; Launch</h2>
      <p className="wizardStepIntro">Review the assembled scenario on the right, then generate the final scenario packet and start the chat.</p>

      {copyMustBeSaved && (
        <div className="errorBanner copySaveReminder" role="status">
          <CircleAlert size={17} />
          <span>Save the renamed scenario copy above before generating or starting the chat.</span>
        </div>
      )}

      {error && (
        <div className="errorBanner" role="alert">
          <CircleAlert size={17} />
          <span>{error}</span>
        </div>
      )}

      <div className={`reviewReadiness ${scenario ? "ready" : ""}`}>
        <CheckCircle2 size={22} />
        <div>
          <strong>{scenario ? "Scenario packet generated" : "Building blocks are ready"}</strong>
          <p>
            {scenario
              ? "The final title, character, and summary are shown in the preview. You can export it or begin the roleplay."
              : "Generate the scenario to finalize its title, character, and summary."}
          </p>
          {status && <span>{status}</span>}
        </div>
      </div>

      <div className="wizardActions reviewActions">
        <button className="secondaryButton" type="button" onClick={onRegenerate} disabled={busy || loading || copyMustBeSaved}>
          <RefreshCcw size={16} />
          <span>{busy ? "Working..." : isManualSource ? "Load Source Scenario" : scenario ? "Regenerate Scenario" : "Generate Scenario"}</span>
        </button>
        <button className="secondaryButton" type="button" onClick={onExport} disabled={busy || loading || !scenario || copyMustBeSaved}>
          <FileSpreadsheet size={16} />
          <span>Export Scenario</span>
        </button>
        <button className="primaryButton" type="button" onClick={onStartChat} disabled={busy || loading || !scenario || copyMustBeSaved}>
          <Play size={16} />
          <span>Start Chat</span>
        </button>
      </div>
    </div>
  );
}
