import { InfoNote } from "../../components/InfoNote.jsx";
import { FIELD_INFO } from "../../data/fieldInfo.js";
import {
  PERSONA_COMMUNICATION_STYLE_OPTIONS,
  PERSONA_EMOTIONAL_STATE_OPTIONS,
  PERSONA_PRIMARY_CONCERN_OPTIONS,
  PERSONA_STYLE_OPTIONS,
  PERSONA_TRUST_LEVEL_OPTIONS,
} from "../../data/scenarioOptions.js";

function PersonaSelect({ label, value, options, otherValue, onChange, onOtherChange, placeholder, info }) {
  const isOther = value === "Other";
  return (
    <label className="personaSelect">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      {isOther && <input value={otherValue} onChange={(event) => onOtherChange(event.target.value)} placeholder={placeholder} />}
      <InfoNote>{info}</InfoNote>
    </label>
  );
}

export function PersonaStep({ form, updateForm }) {
  return (
    <div className="wizardStepBody">
      <h2>Persona Details</h2>
      <p className="wizardStepIntro">Shape how the avatar behaves and feels throughout the conversation.</p>

      <div className="studioGroup personaConfig">
        <div className="personaControlGrid">
          <PersonaSelect
            label="Style"
            value={form.personaStyle}
            options={PERSONA_STYLE_OPTIONS}
            otherValue={form.personaStyleOther}
            onChange={(value) => updateForm({ personaStyle: value })}
            onOtherChange={(value) => updateForm({ personaStyleOther: value })}
            placeholder="Custom persona style"
            info={FIELD_INFO.personaStyle}
          />
          <PersonaSelect
            label="Emotional Start"
            value={form.personaEmotionalState}
            options={PERSONA_EMOTIONAL_STATE_OPTIONS}
            otherValue={form.personaEmotionalStateOther}
            onChange={(value) => updateForm({ personaEmotionalState: value })}
            onOtherChange={(value) => updateForm({ personaEmotionalStateOther: value })}
            placeholder="Custom emotional state"
            info={FIELD_INFO.personaEmotionalState}
          />
          <PersonaSelect
            label="Trust Level"
            value={form.personaTrustLevel}
            options={PERSONA_TRUST_LEVEL_OPTIONS}
            otherValue={form.personaTrustLevelOther}
            onChange={(value) => updateForm({ personaTrustLevel: value })}
            onOtherChange={(value) => updateForm({ personaTrustLevelOther: value })}
            placeholder="Custom trust level"
            info={FIELD_INFO.personaTrustLevel}
          />
          <PersonaSelect
            label="Communication"
            value={form.personaCommunicationStyle}
            options={PERSONA_COMMUNICATION_STYLE_OPTIONS}
            otherValue={form.personaCommunicationStyleOther}
            onChange={(value) => updateForm({ personaCommunicationStyle: value })}
            onOtherChange={(value) => updateForm({ personaCommunicationStyleOther: value })}
            placeholder="Custom communication style"
            info={FIELD_INFO.personaCommunicationStyle}
          />
          <PersonaSelect
            label="Primary Concern"
            value={form.personaPrimaryConcern}
            options={PERSONA_PRIMARY_CONCERN_OPTIONS}
            otherValue={form.personaPrimaryConcernOther}
            onChange={(value) => updateForm({ personaPrimaryConcern: value })}
            onOtherChange={(value) => updateForm({ personaPrimaryConcernOther: value })}
            placeholder="Custom primary concern"
            info={FIELD_INFO.personaPrimaryConcern}
          />
        </div>
        <label className="studioField">
          <span className="studioLabel">Persona Notes <em>(optional)</em></span>
          <textarea value={form.personaNotes} onChange={(event) => updateForm({ personaNotes: event.target.value })} placeholder="Optional persona details that are not covered by the selections" />
          <InfoNote>{FIELD_INFO.personaNotes}</InfoNote>
        </label>
      </div>
    </div>
  );
}
