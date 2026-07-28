import { Check, Layers3 } from "lucide-react";
import { formValue, selectedList, sourceLabel } from "../lib/scenarioHelpers.js";

function PreviewBlock({ label, complete, children }) {
  return (
    <section className={`livePreviewBlock ${complete ? "complete" : ""}`}>
      <div className="livePreviewBlockHeader">
        <span>{label}</span>
        <span className="livePreviewBlockStatus" aria-label={complete ? "Selection added" : "Not yet completed"}>
          {complete ? <Check size={12} /> : "—"}
        </span>
      </div>
      {children}
    </section>
  );
}

function TagList({ values, emptyText }) {
  if (!values.length) return <p className="livePreviewEmpty">{emptyText}</p>;
  return (
    <div className="livePreviewTags">
      {values.map((value) => (
        <span key={value}>{value}</span>
      ))}
    </div>
  );
}

export function ScenarioPreviewPanel({ form, catalog, source, isManualSource, competencies, scenario, preview }) {
  const role = formValue(form, "chatbotRole", "chatbotRoleOther");
  const factors = selectedList(form.scenarioFactors || [], form.otherFactor);
  const complexities = selectedList(form.scenarioComplexities || [], form.otherComplexity);
  const persona = [
    formValue(form, "personaStyle", "personaStyleOther"),
    formValue(form, "personaEmotionalState", "personaEmotionalStateOther"),
    formValue(form, "personaTrustLevel", "personaTrustLevelOther"),
    formValue(form, "personaCommunicationStyle", "personaCommunicationStyleOther"),
    formValue(form, "personaPrimaryConcern", "personaPrimaryConcernOther"),
  ].filter(Boolean);
  const sourceTitle = isManualSource
    ? sourceLabel(source, catalog.curriculumScenarios || [])
    : "Create from selected building blocks";
  const draftTitle = scenario?.title || (role ? `${role}: Workplace Concern` : "Untitled Scenario");
  const draftSummary =
    scenario?.summary ||
    (isManualSource
      ? source?.scenario_text
      : "The generated title, character, and scenario summary will appear here after the building blocks are reviewed.");

  return (
    <aside className="livePreviewPanel" aria-label="Live scenario preview">
      <header className="livePreviewHeader">
        <div>
          <span className="livePreviewEyebrow">
            <Layers3 size={14} />
            Scenario Preview
          </span>
          <h2>{draftTitle}</h2>
        </div>
        <span className={`livePreviewState ${scenario ? "generated" : ""}`}>{scenario ? "Generated" : "Draft"}</span>
      </header>

      <div className="livePreviewBody">
        <PreviewBlock label="Source" complete={Boolean(sourceTitle)}>
          <strong>{sourceTitle}</strong>
          <p>
            {isManualSource
              ? source?.scenario_text || "Select a curriculum scenario."
              : "The scenario will be assembled from the role, training focus, details, and persona below."}
          </p>
        </PreviewBlock>

        <PreviewBlock label="Role & Focus" complete={Boolean(role && competencies.length)}>
          <strong>{role || "Choose a chatbot role"}</strong>
          <TagList values={competencies} emptyText="Add at least one competency focus." />
        </PreviewBlock>

        <PreviewBlock label="Scenario Details" complete={isManualSource || Boolean(factors.length || complexities.length)}>
          {isManualSource ? (
            <p>Details are inherited from the selected curriculum scenario.</p>
          ) : (
            <>
              <TagList values={factors} emptyText="No scenario factors selected." />
              <TagList values={complexities} emptyText="No additional complexities selected." />
            </>
          )}
          {(form.chatbotBehaviorNotes || form.otherDetails) && (
            <p className="livePreviewNote">{form.chatbotBehaviorNotes || form.otherDetails}</p>
          )}
        </PreviewBlock>

        <PreviewBlock label="Persona" complete={persona.length >= 5}>
          <TagList values={persona} emptyText="Persona selections will appear here." />
          {form.personaNotes && <p className="livePreviewNote">{form.personaNotes}</p>}
        </PreviewBlock>

        <PreviewBlock label="Scenario Output" complete={Boolean(scenario)}>
          {scenario?.avatar_name && <strong>Character: {scenario.avatar_name}</strong>}
          <p className={!scenario ? "livePreviewEmpty" : ""}>{draftSummary}</p>
          {scenario && preview.inContextPersonaSummary && (
            <p className="livePreviewNote">{preview.inContextPersonaSummary}</p>
          )}
        </PreviewBlock>
      </div>
    </aside>
  );
}
