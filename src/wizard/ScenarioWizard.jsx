import { Check, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { SourceStep } from "./steps/SourceStep.jsx";
import { RoleFocusStep } from "./steps/RoleFocusStep.jsx";
import { DetailsStep } from "./steps/DetailsStep.jsx";
import { PersonaStep } from "./steps/PersonaStep.jsx";
import { ReviewStep } from "./steps/ReviewStep.jsx";
import { ScenarioPreviewPanel } from "./ScenarioPreviewPanel.jsx";
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
  creationMode,
}) {
  const roleFocusValid = Boolean(formValue(form, "chatbotRole", "chatbotRoleOther")) && competencies.length > 0;
  const detailsValid = isManualSource || form.scenarioFactors.length > 0;
  const personaValid = [
    formValue(form, "personaStyle", "personaStyleOther"),
    formValue(form, "personaEmotionalState", "personaEmotionalStateOther"),
    formValue(form, "personaTrustLevel", "personaTrustLevelOther"),
    formValue(form, "personaCommunicationStyle", "personaCommunicationStyleOther"),
    formValue(form, "personaPrimaryConcern", "personaPrimaryConcernOther"),
  ].every(Boolean);
  const canAdvanceFrom = { 0: true, 1: roleFocusValid, 2: detailsValid, 3: personaValid, 4: true };
  const visibleSteps = STEPS.map((item, index) => ({ ...item, index })).filter(
    (item) => creationMode !== "new" || item.key !== "source"
  );
  const currentPosition = Math.max(0, visibleSteps.findIndex((item) => item.index === step));
  const isLastStep = currentPosition === visibleSteps.length - 1;

  function goBack() {
    setStep(visibleSteps[Math.max(0, currentPosition - 1)].index);
  }

  function goNext() {
    if (!canAdvanceFrom[step]) return;
    setStep(visibleSteps[Math.min(visibleSteps.length - 1, currentPosition + 1)].index);
  }

  return (
    <div className="wizardShell">
      <main className="wizardWorkspace">
        <section className="wizardBuilderColumn">
          <header className="wizardHeader">
            <button className="wizardHomeButton" type="button" onClick={onExitToHome} title="Back to Home" aria-label="Back to Home">
              <Home size={16} />
            </button>
            <ol className="wizardStepper">
              {visibleSteps.map((item, position) => (
                <li
                  key={item.key}
                  className={`wizardStepperItem ${item.index === step ? "active" : ""} ${position < currentPosition ? "done" : ""}`}
                  onClick={() => position < currentPosition && setStep(item.index)}
                >
                  <span className="wizardStepperDot">{position < currentPosition ? <Check size={12} /> : position + 1}</span>
                  <span className="wizardStepperLabel">{item.label}</span>
                </li>
              ))}
            </ol>
          </header>

          <div className="wizardCard">
            {step === 0 && <SourceStep updateForm={updateForm} catalog={catalog} source={source} />}
            {step === 1 && <RoleFocusStep form={form} updateForm={updateForm} competencies={competencies} />}
            {step === 2 && <DetailsStep form={form} updateForm={updateForm} isManualSource={isManualSource} />}
            {step === 3 && <PersonaStep form={form} updateForm={updateForm} />}
            {step === 4 && (
              <ReviewStep
                scenario={scenario}
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
                <button className="secondaryButton" type="button" onClick={goBack} disabled={currentPosition === 0}>
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
        </section>

        <ScenarioPreviewPanel
          form={form}
          catalog={catalog}
          source={source}
          isManualSource={isManualSource}
          competencies={competencies}
          scenario={scenario}
          preview={preview}
        />
      </main>
    </div>
  );
}
