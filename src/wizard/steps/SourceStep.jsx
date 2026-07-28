import { SelectControl } from "../../components/SelectControl.jsx";
import { sourceLabel, sourceReference } from "../../lib/scenarioHelpers.js";

export function SourceStep({ updateForm, catalog, source }) {
  return (
    <div className="wizardStepBody">
      <h2>Create from Existing</h2>
      <p className="wizardStepIntro">Select a scenario from the source library to use as the foundation, then customize its roleplay details in the next steps.</p>

      <div className="studioGroup sourceScenarioSection">
        <span className="studioLabel">Source Curriculum Scenario</span>
        <SelectControl className="sourceScenarioSelect" value={source?.curriculum_scenario_id || ""} onChange={(event) => updateForm({ curriculumScenarioId: event.target.value })}>
          {(catalog.curriculumScenarios || []).map((item) => (
            <option key={item.curriculum_scenario_id} value={item.curriculum_scenario_id}>
              {sourceLabel(item, catalog.curriculumScenarios || [])}
            </option>
          ))}
        </SelectControl>

        <div className="sourceScenarioDetail">
          {source ? (
            <>
              <p>{source.scenario_text}</p>
              <span>{sourceReference(source)}</span>
            </>
          ) : (
            <p>Select a curriculum scenario to continue.</p>
          )}
        </div>
      </div>
    </div>
  );
}
