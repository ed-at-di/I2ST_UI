export const CHATBOT_ROLES = ["Complainant", "Witness", "Subject", "Other"];

export const COMPETENCY_OPTIONS = [
  { title: "Empathy & Support", details: ["Empathy & Reassurance", "Active Listening", "Crisis Management"] },
  {
    title: "Communication Skills",
    details: ["Clarity of Communication", "Non-Verbal Communication", "Questioning Technique", "Professionalism & Composure"],
  },
  { title: "Credibility & Problem-Solving", details: ["Resolution & Procedural Competency", "Documenting Information"] },
];

export const FACTOR_OPTIONS = [
  "Race/Ethnicity",
  "Sex",
  "Religion",
  "Sexual Orientation",
  "Disability-Based",
  "Age",
  "National Origin",
  "Pregnancy/Parental Issue",
  "Military/Veteran Status",
  "Other",
];

export const COMPLEXITY_OPTIONS = [
  "Maximized Emotional Intensity",
  "Organizational and Systemic Challenges",
  "Ethical Dilemmas and Ambiguity",
  "Other",
];

export const PERSONA_STYLE_OPTIONS = [
  "Frustrated Skeptic",
  "Reluctant Witness",
  "Defensive Respondent",
  "Anxious Reporter",
  "Over-Explaining Narrator",
  "Cautious Professional",
  "Other",
];

export const PERSONA_EMOTIONAL_STATE_OPTIONS = ["Frustrated", "Anxious", "Defensive", "Guarded", "Confused", "Overwhelmed", "Other"];

export const PERSONA_TRUST_LEVEL_OPTIONS = ["Low trust", "Mixed trust", "Cautiously cooperative", "High trust but worried", "Other"];

export const PERSONA_COMMUNICATION_STYLE_OPTIONS = [
  "Direct and brief",
  "Detailed and narrative",
  "Hesitant and careful",
  "Emotional and urgent",
  "Formal and guarded",
  "Other",
];

export const PERSONA_PRIMARY_CONCERN_OPTIONS = [
  "Being dismissed",
  "Retaliation",
  "Privacy and confidentiality",
  "Fair process",
  "Being blamed",
  "Immediate safety",
  "Other",
];

export const DEFAULT_FORM = {
  sourceScenarioMode: "auto",
  curriculumScenarioId: "",
  chatbotRole: "Complainant",
  chatbotRoleOther: "",
  competencyFocus: "Empathy & Support",
  competencyFocuses: ["Empathy & Support"],
  scenarioFactors: ["Sexual Orientation", "Pregnancy/Parental Issue"],
  scenarioComplexities: ["Maximized Emotional Intensity"],
  otherFactor: "",
  otherComplexity: "",
  chatbotBehaviorNotes: "",
  otherDetails: "",
  personaStyle: "Frustrated Skeptic",
  personaStyleOther: "",
  personaEmotionalState: "Frustrated",
  personaEmotionalStateOther: "",
  personaTrustLevel: "Low trust",
  personaTrustLevelOther: "",
  personaCommunicationStyle: "Direct and brief",
  personaCommunicationStyleOther: "",
  personaPrimaryConcern: "Being dismissed",
  personaPrimaryConcernOther: "",
  personaNotes: "",
  difficulty: "Expert",
};

export const NEW_SCENARIO_FORM = {
  ...DEFAULT_FORM,
  sourceScenarioMode: "auto",
  chatbotRole: "",
  competencyFocus: "",
  competencyFocuses: [],
  scenarioFactors: [],
  scenarioComplexities: [],
  personaStyle: "",
  personaEmotionalState: "",
  personaTrustLevel: "",
  personaCommunicationStyle: "",
  personaPrimaryConcern: "",
};
