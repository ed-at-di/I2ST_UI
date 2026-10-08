import { CheckCircle2, CircleAlert, FileSpreadsheet, Play } from "lucide-react";
import { ExistingCopyBanner } from "../ExistingCopyBanner.jsx";

export function ReviewStep({
  scenario,
  isManualSource,
  status,
  error,
  busy,
  loading,
  onExport,
  onStartChat,
  copyMustBeSaved,
  isExistingCopy,
  copyName,
  originalName,
  copySaved,
  copyDirty,
  onCopyNameChange,
  onSaveCopy,
}) {
  return (
    <div className="wizardStepBody reviewStepBody">
      <h2>Review &amp; Launch</h2>
      <p className="wizardStepIntro">Review the complete scenario and every stage persona, then start the chat when all selections are ready.</p>

      {isExistingCopy && (
        <ExistingCopyBanner
          copyName={copyName}
          originalName={originalName}
          saved={copySaved}
          dirty={copyDirty}
          onNameChange={onCopyNameChange}
          onSave={onSaveCopy}
        />
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
          <strong>{scenario ? "Scenario packet generated" : "Ready to generate and launch"}</strong>
          <p>
            {scenario ? "The scenario summary and stage-specific chatbot selections are shown in the preview." : "Start Chat will generate the final packet with the completed stage personas and open the interview."}
          </p>
          {status && <span>{status}</span>}
        </div>
      </div>

      <div className="wizardActions reviewActions">
        <button className="secondaryButton" type="button" onClick={onExport} disabled={busy || loading}>
          <FileSpreadsheet size={16} />
          <span>Export Scenario</span>
        </button>
        <button className="primaryButton" type="button" onClick={onStartChat} disabled={busy || loading}>
          <Play size={16} />
          <span>{scenario ? "Start Chat" : "Generate & Start Chat"}</span>
        </button>
      </div>
    </div>
  );
}
