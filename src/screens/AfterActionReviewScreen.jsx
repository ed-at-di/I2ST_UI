import { ArrowLeft, Download, MessageSquareText, RefreshCcw, Target, UsersRound } from "lucide-react";
import { activeScenarioStages } from "../lib/stageHelpers.js";

export function AfterActionReviewScreen({ scenario, form, messages, busy, onReturnHome, onRunAgain }) {
  const stages = activeScenarioStages(form);
  const traineeMessages = messages.filter((message) => message.role === "trainee");
  const avatarMessages = messages.filter((message) => message.role === "avatar");
  const responseTimes = avatarMessages.map((message) => Number(message.latencyMs)).filter(Number.isFinite);
  const averageResponse = responseTimes.length ? Math.round(responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length) : null;
  const focusAreas = form.competencyFocuses || [];
  const behaviors = form.competencyBehaviorFocuses || [];

  function exportTranscript() {
    const title = scenario?.title || "Scenario Review";
    const transcript = messages
      .map((message) => `${message.role === "trainee" ? "Learner" : scenario?.avatar_name || "Avatar"}: ${message.text}`)
      .join("\n\n");
    const file = new Blob([`${title}\nAfter Action Review Transcript\n\n${transcript}\n`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "scenario"}-transcript.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="aarScreen">
      <section className="aarHero">
        <div>
          <span className="aarEyebrow">After Action Review</span>
          <h1>{scenario?.title || "Scenario Review"}</h1>
          <p>Review the interaction, connect decisions to the training focus, and identify one adjustment for the next attempt.</p>
        </div>
        <span className="aarCompleteBadge">Session complete</span>
      </section>

      <section className="aarMetrics" aria-label="Session summary">
        <article><MessageSquareText size={20} /><div><strong>{messages.length}</strong><span>Total messages</span></div></article>
        <article><Target size={20} /><div><strong>{traineeMessages.length}</strong><span>Learner responses</span></div></article>
        <article><UsersRound size={20} /><div><strong>{stages.length}</strong><span>Scenario stages</span></div></article>
        <article><RefreshCcw size={20} /><div><strong>{averageResponse ? `${averageResponse} ms` : "—"}</strong><span>Avg. avatar response</span></div></article>
      </section>

      <div className="aarGrid">
        <section className="aarCard aarFocusCard">
          <div className="aarCardHeader"><div><span>Training focus</span><h2>KPA and behaviors</h2></div><Target size={20} /></div>
          <dl className="aarFocusList">
            <div><dt>KPA</dt><dd>{form.selectedKpa || "Not specified"}</dd></div>
            <div><dt>Focus areas</dt><dd>{focusAreas.join(", ") || "Not specified"}</dd></div>
            <div><dt>Behaviors emphasized</dt><dd>{behaviors.join(", ") || "Not specified"}</dd></div>
          </dl>
        </section>

        <section className="aarCard aarStagesCard">
          <div className="aarCardHeader"><div><span>Scenario structure</span><h2>Stages reviewed</h2></div><UsersRound size={20} /></div>
          <div className="aarStageList">
            {stages.map((stage, index) => {
              const role = stage.chatbotRole === "Other" ? stage.chatbotRoleOther : stage.chatbotRole;
              return <div key={stage.id}><strong>Stage {index + 1}</strong><span>{role || "Avatar role"}{stage.domainTitle ? ` · ${stage.domainTitle}` : ""}</span></div>;
            })}
          </div>
        </section>

        <section className="aarCard aarReflectionCard">
          <div className="aarCardHeader"><div><span>Guided reflection</span><h2>Questions for the learner</h2></div></div>
          <ol>
            <li>Which response helped the avatar share more useful information?</li>
            <li>Where could you have applied the selected behaviors more deliberately?</li>
            <li>What is one specific change you would make in another attempt?</li>
          </ol>
        </section>

        <section className="aarCard aarTranscriptCard">
          <div className="aarCardHeader">
            <div><span>Interaction evidence</span><h2>Transcript</h2></div>
            <button className="aarTranscriptExport" type="button" onClick={exportTranscript} disabled={!messages.length}>
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
          <div className="aarTranscript">
            {messages.map((message, index) => (
              <article className={message.role} key={`${message.role}-${index}`}>
                <span>{message.role === "trainee" ? "Learner" : scenario?.avatar_name || "Avatar"}</span>
                <p>{message.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <footer className="aarActions">
        <button className="secondaryButton" type="button" onClick={onReturnHome}><ArrowLeft size={16} /><span>Return Home</span></button>
        <button className="primaryButton" type="button" onClick={onRunAgain} disabled={busy}><RefreshCcw size={16} /><span>{busy ? "Starting…" : "Run Again"}</span></button>
      </footer>
    </main>
  );
}
