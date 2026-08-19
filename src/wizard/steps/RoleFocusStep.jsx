import { InfoNote } from "../../components/InfoNote.jsx";
import { FIELD_INFO } from "../../data/fieldInfo.js";
import { COMPETENCY_OPTIONS } from "../../data/scenarioOptions.js";
import { arrayToggle } from "../../lib/scenarioHelpers.js";

export function RoleFocusStep({ updateForm, competencies }) {
  return (
    <div className="wizardStepBody">
      <h2>KPA Focus</h2>
      <p className="wizardStepIntro">Choose the shared skills this scenario is meant to exercise across every stage.</p>

      <div className="studioGroup innerStudioGroup competencyGroup">
        <span className="studioLabel">Key Performance Areas Focus*</span>
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
        <InfoNote>{FIELD_INFO.competencyFocus}</InfoNote>
      </div>
    </div>
  );
}
