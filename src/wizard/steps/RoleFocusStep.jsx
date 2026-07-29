import { InfoNote } from "../../components/InfoNote.jsx";
import { SelectControl } from "../../components/SelectControl.jsx";
import { FIELD_INFO } from "../../data/fieldInfo.js";
import { CHATBOT_ROLES, COMPETENCY_OPTIONS } from "../../data/scenarioOptions.js";
import { arrayToggle } from "../../lib/scenarioHelpers.js";

export function RoleFocusStep({ form, updateForm, competencies }) {
  return (
    <div className="wizardStepBody">
      <h2>Role &amp; Key Performance Areas Focus</h2>
      <p className="wizardStepIntro">Set who the avatar plays and what skill this scenario is meant to exercise.</p>

      <label className="studioField">
        <span className="studioLabel">Chatbot Role*</span>
        <SelectControl value={form.chatbotRole} onChange={(event) => updateForm({ chatbotRole: event.target.value })}>
          <option value="" disabled>
            Select a role
          </option>
          {CHATBOT_ROLES.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </SelectControl>
        <InfoNote>{FIELD_INFO.chatbotRole}</InfoNote>
      </label>
      {form.chatbotRole === "Other" && (
        <label className="studioField compactField">
          <span>Custom Chatbot Role</span>
          <input value={form.chatbotRoleOther} onChange={(event) => updateForm({ chatbotRoleOther: event.target.value })} placeholder="Direct manager" />
        </label>
      )}

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
