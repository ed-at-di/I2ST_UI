import { InfoNote } from "../../components/InfoNote.jsx";
import { FIELD_INFO } from "../../data/fieldInfo.js";
import { sourceLabel, sourceReference } from "../../lib/scenarioHelpers.js";

export function SourceStep({ form, updateForm, catalog, source, isManualSource }) {
  return (
    <div className="wizardStepBody">
      <h2>Scenario Source</h2>
      <p className="wizardStepIntro">Choose where this scenario's roleplay content comes from.</p>

      <div className="studioGroup sourceScenarioSection">
        <span className="studioLabel">Source Curriculum Scenario</span>
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
        <InfoNote>{FIELD_INFO.sourceScenarioMode}</InfoNote>

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
              <span>The authoring layer will create a scenario packet from the role, competency, factors, complexities, and persona controls in the next steps.</span>
              <p>The review step is populated only after the generated scenario packet is returned.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
