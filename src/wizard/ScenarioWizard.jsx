import { Check, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { SourceStep } from "./steps/SourceStep.jsx";
import { RoleFocusStep } from "./steps/RoleFocusStep.jsx";
import { DetailsStep } from "./steps/DetailsStep.jsx";
import { PersonaStep } from "./steps/PersonaStep.jsx";
import { ReviewStep } from "./steps/ReviewStep.jsx";
import { formValue } from "../lib/scenarioHelpers.js";

export const STEPS = [
  { key: "source", label: "Source" },
  { key: "role-focus", label: "Role & Focus" },
  { key: "details", label: "Details" },
  { key: "persona", label: "Persona" },
  { key: "review", label: "Review" },
];

export function ScenarioWizard({
  step,
  setStep,
  form,
  updateForm,
  catalog,
  source,
  isManualSource,
  competencies,
  scenario,
  preview,
  status,
  error,
  busy,
  loading,
  onRegenerate,
  onExport,
  onStartChat,
  onExitToHome,
}) {
  const roleFocusValid = Boolean(formValue(form, "chatbotRole", "chatbotRoleOther")) && competencies.length > 0;
  const canAdvanceFrom = { 0: true, 1: roleFocusValid, 2: true, 3: true, 4: true };
  const isLastStep = step === STEPS.length - 1;

  function goBack() {
    setStep((current) => Math.max(0, current - 1));
  }

  function goNext() {
    if (!canAdvanceFrom[step]) return;
    setStep((current) => Math.min(STEPS.length - 1, current + 1));
  }

  return (
    <div className="wizardShell">
      <header className="wizardHeader">
        <button className="wizardHomeButton" type="button" onClick={onExitToHome} title="Back to Home" aria-label="Back to Home">
          <Home size={16} />
        </button>
        <ol className="wizardStepper">
          {STEPS.map((item, index) => (
            <li
              key={item.key}
              className={`wizardStepperItem ${index === step ? "active" : ""} ${index < step ? "done" : ""}`}
              onClick={() => index < step && setStep(index)}
            >
              <span className="wizardStepperDot">{index < step ? <Check size={12} /> : index + 1}</span>
              <span className="wizardStepperLabel">{item.label}</span>
            </li>
          ))}
        </ol>
      </header>

      <div className="wizardCard">
        {step === 0 && <SourceStep form={form} updateForm={updateForm} catalog={catalog} source={source} isManualSource={isManualSource} />}
        {step === 1 && <RoleFocusStep form={form} updateForm={updateForm} competencies={competencies} />}
        {step === 2 && <DetailsStep form={form} updateForm={updateForm} isManualSource={isManualSource} />}
        {step === 3 && <PersonaStep form={form} updateForm={updateForm} />}
        {step === 4 && (
          <ReviewStep
            scenario={scenario}
            preview={preview}
            isManualSource={isManualSource}
            status={status}
            error={error}
            busy={busy}
            loading={loading}
            onRegenerate={onRegenerate}
            onExport={onExport}
            onStartChat={onStartChat}
          />
        )}

        {!isLastStep && (
          <div className="wizardFooter">
            <button className="secondaryButton" type="button" onClick={goBack} disabled={step === 0}>
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
            <button className="primaryButton" type="button" onClick={goNext} disabled={!canAdvanceFrom[step]}>
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        {isLastStep && (
          <div className="wizardFooter">
            <button className="secondaryButton" type="button" onClick={goBack}>
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
