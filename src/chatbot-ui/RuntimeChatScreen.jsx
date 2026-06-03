import { ArrowLeft, Clock3, FileSpreadsheet, Send } from "lucide-react";

function formatTime(value = new Date()) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export function RuntimeChatScreen({
  busy,
  error,
  exportScenario,
  formatLatency,
  health,
  input,
  messages,
  scenario,
  scrollRef,
  sendTurn,
  session,
  setInput,
  status,
  returnToStudio,
}) {
  const avatarName = scenario?.avatar_name || "Avatar";
  const avatarTurns = messages.filter((item) => item.role === "avatar").length;

  return (
    <main className="runtimeScreen">
      <header className="runtimeToolbar">
        <button className="secondaryButton" type="button" onClick={returnToStudio}>
          <ArrowLeft size={16} />
          <span>Create New Scenario</span>
        </button>
        <div className="runtimeToolbarStatus">
          {status && <span>{status}</span>}
          <span>{health.sessions || 0} active sessions</span>
        </div>
        <button className="secondaryButton" type="button" onClick={exportScenario} disabled={busy || !scenario}>
          <FileSpreadsheet size={16} />
          <span>Export Scenario</span>
        </button>
      </header>

      {error && (
        <div className="runtimeError" role="alert">
          {error}
        </div>
      )}

      <section className="runtimeChatSurface">
        <div className="runtimeAvatarStage">
          <div className="runtimeAvatarPortrait" aria-hidden="true">
            <span>{avatarName.slice(0, 1)}</span>
          </div>
          <div className="runtimeAvatarMeta">
            <p>{scenario?.role || "Roleplay Avatar"}</p>
            <h1>{avatarName}</h1>
            <span>{scenario?.title || "Scenario session"}</span>
          </div>
        </div>

        <div className="runtimeTranscript" aria-live="polite">
          {messages.map((message, index) => (
            <article className={`runtimeMessageRow ${message.role}`} key={`${message.role}-${index}`}>
              <div className={`runtimeBubble ${message.role}`}>
                <span>
                  {message.role === "avatar" ? avatarName : "Trainee"}
                  {message.latencyMs !== undefined && (
                    <em>
                      <Clock3 size={12} />
                      {formatLatency(message.latencyMs)}
                    </em>
                  )}
                </span>
                <p>{message.text}</p>
              </div>
              <time>{formatTime()}</time>
            </article>
          ))}

          {busy && (
            <div className="runtimeTypingLine">
              <span />
              <span />
              <span />
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <footer className="runtimeComposerShell">
          <div className="runtimeSessionStrip">
            <span>{session?.session_id || "No active session"}</span>
            <span>{avatarTurns} avatar turns</span>
          </div>
          <form className="runtimeComposer" onSubmit={sendTurn}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your trainee response..."
              disabled={busy || !session?.session_id}
              rows={2}
            />
            <button className="sendButton" type="submit" disabled={busy || !input.trim() || !session?.session_id} aria-label="Send">
              <Send size={18} />
            </button>
          </form>
        </footer>
      </section>
    </main>
  );
}
