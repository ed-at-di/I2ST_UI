import { InfoNote } from "../../components/InfoNote.jsx";
import { SelectControl } from "../../components/SelectControl.jsx";
import { FIELD_INFO } from "../../data/fieldInfo.js";
import { COMPETENCY_OPTIONS, KPA_OPTIONS } from "../../data/scenarioOptions.js";

export function RoleFocusStep({ form, updateForm, competencies, creationMode }) {
  const selectedBehaviors = form.competencyBehaviorFocuses || [];

  function toggleKpa(focus) {
    const allSelected = focus.details.every((detail) => selectedBehaviors.includes(detail));
    const nextBehaviors = allSelected
      ? selectedBehaviors.filter((detail) => !focus.details.includes(detail))
      : [...new Set([...selectedBehaviors, ...focus.details])];
    const nextKpas = allSelected
      ? competencies.filter((title) => title !== focus.title)
      : [...new Set([...competencies, focus.title])];
    updateForm({ competencyFocuses: nextKpas, competencyFocus: nextKpas[0] || "", competencyBehaviorFocuses: nextBehaviors });
  }

  function toggleBehavior(focus, behavior) {
    const nextBehaviors = selectedBehaviors.includes(behavior)
      ? selectedBehaviors.filter((item) => item !== behavior)
      : [...selectedBehaviors, behavior];
    const hasSelectedChild = focus.details.some((detail) => nextBehaviors.includes(detail));
    const nextKpas = hasSelectedChild
      ? [...new Set([...competencies, focus.title])]
      : competencies.filter((title) => title !== focus.title);
    updateForm({ competencyFocuses: nextKpas, competencyFocus: nextKpas[0] || "", competencyBehaviorFocuses: nextBehaviors });
  }

  return (
    <div className="wizardStepBody">
      <h2>KPA Focus</h2>
      <p className="wizardStepIntro">Choose the shared skills this scenario is meant to exercise across every stage.</p>

      {creationMode !== "existing" && (
        <label className="studioField performanceObjectiveField">
          <span className="studioLabel">Performance Objective* <InfoNote>{FIELD_INFO.performanceObjective}</InfoNote></span>
          <textarea
            value={form.performanceObjective}
            onChange={(event) => updateForm({ performanceObjective: event.target.value })}
            placeholder="Example: The learner will establish rapport, elicit relevant facts, and explain available options."
          />
        </label>
      )}

      <label className="studioField kpaSelectionField">
        <span className="studioLabel">KPA* <InfoNote>{FIELD_INFO.selectedKpa}</InfoNote></span>
        <SelectControl value={form.selectedKpa || ""} onChange={(event) => updateForm({ selectedKpa: event.target.value })}>
          <option value="" disabled>Select a KPA</option>
          {KPA_OPTIONS.map((kpa) => <option key={kpa}>{kpa}</option>)}
        </SelectControl>
      </label>

      <div className="studioGroup innerStudioGroup competencyGroup">
        <span className="studioLabel">Focus Areas* <InfoNote>{FIELD_INFO.focusAreas}</InfoNote></span>
        <p className="fieldHelperText">Select a complete focus area or choose only the individual behaviors the scenario should emphasize.</p>
        <div className="kpaHierarchy">
          {COMPETENCY_OPTIONS.map((focus) => (
            <div className="kpaOption" key={focus.title}>
              <label className="checkRow kpaParentRow">
                <input
                  type="checkbox"
                  checked={focus.details.every((detail) => selectedBehaviors.includes(detail))}
                  onChange={() => toggleKpa(focus)}
                />
                <span>{focus.title}</span>
              </label>
              <div className="kpaBehaviorList">
                {focus.details.map((detail) => (
                  <label className="checkRow kpaBehaviorRow" key={detail}>
                    <input type="checkbox" checked={selectedBehaviors.includes(detail)} onChange={() => toggleBehavior(focus, detail)} />
                    <span>{detail}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
