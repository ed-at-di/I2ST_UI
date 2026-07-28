import { CheckCircle2, Copy, Save } from "lucide-react";

export function ExistingCopyBanner({ copyName, originalName, saved, dirty, onNameChange, onSave }) {
  const trimmedName = copyName.trim();
  const canSave = Boolean(trimmedName && trimmedName !== originalName.trim());

  return (
    <section className={`existingCopyBanner ${saved && !dirty ? "saved" : ""}`} aria-label="Save copied scenario">
      <div className="existingCopyMessage">
        <span className="existingCopyIcon">{saved && !dirty ? <CheckCircle2 size={18} /> : <Copy size={18} />}</span>
        <div>
          <strong>{saved && !dirty ? "New scenario saved" : "You’re creating a new scenario"}</strong>
          <p>Any changes are saved to a copy. The original library scenario stays unchanged.</p>
        </div>
      </div>
      <div className="existingCopyControls">
        <label>
          <span>New scenario name</span>
          <input
            value={copyName}
            onChange={(event) => onNameChange(event.target.value)}
            aria-invalid={!canSave}
            placeholder="Enter a new scenario name"
          />
        </label>
        <button className="primaryButton" type="button" onClick={onSave} disabled={!canSave || (saved && !dirty)}>
          <Save size={16} />
          <span>{saved && !dirty ? "Saved" : "Save New Scenario"}</span>
        </button>
      </div>
      {!canSave && <p className="existingCopyValidation">Enter a name that is different from the original scenario.</p>}
    </section>
  );
}
