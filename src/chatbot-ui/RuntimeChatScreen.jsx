import { useMemo, useState } from "react";
import {
  Bot,
  Clock3,
  Gauge,
  MessageSquareText,
  Mic,
  MicOff,
  Send,
} from "lucide-react";

function formatTime(value = new Date()) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export function RuntimeChatScreen({
  busy,
  error,
  formatLatency,
  input,
  messages,
  scenario,
  scrollRef,
  sendTurn,
  session,
  setInput,
}) {
  const showTranscript = true;
  const [listening, setListening] = useState(false);
  const avatarName = scenario?.avatar_name || "Avatar";
  const avatarTurns = messages.filter((item) => item.role === "avatar").length;
  const traineeTurns = messages.filter((item) => item.role === "trainee").length;
  const latestAvatar = [...messages].reverse().find((item) => item.role === "avatar");
  const roleLabel = scenario?.role || scenario?.preview?.chatbotRole || "Roleplay Avatar";
  const panelClassName = [
    "runtimeExperience",
    showTranscript ? "showTranscript" : "hideTranscript",
  ].join(" ");

  const mind = useMemo(() => {
    const trust = Math.min(82, 42 + traineeTurns * 8);
    const comfort = Math.max(36, 72 - traineeTurns * 4);
    const candor = Math.min(76, 38 + traineeTurns * 7);
    return [
      { label: "Trust", value: trust, tone: "teal" },
      { label: "Composure", value: comfort, tone: "blue" },
      { label: "Candor", value: candor, tone: "gold" },
    ];
  }, [traineeTurns]);

  function toggleListening() {
    const nextListening = !listening;
    setListening(nextListening);
    if (nextListening && !input.trim()) {
      setInput("I hear you. Can you tell me more about what happened and how it affected your work?");
    }
  }

  function sendOnEnter(event) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <main className={`runtimeScreen ${error ? "hasError" : ""}`}>
      {error && (
        <div className="runtimeError" role="alert">
          {error}
        </div>
      )}

      <section className={panelClassName}>
        {showTranscript && (
          <aside className="runtimeTranscriptPanel" aria-label="Conversation transcript">
            <div className="runtimePanelHeader">
              <div>
                <p>Transcript</p>
                <span>{messages.length} turns</span>
              </div>
              <MessageSquareText size={18} />
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
                <div className="runtimeTypingLine" aria-label="Avatar is responding">
                  <span />
                  <span />
                  <span />
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </aside>
        )}

        <div className="runtimeAvatarFocus">
          <div className="runtimeStageHeader">
            <div>
              <p>{roleLabel}</p>
              <h1>{avatarName}</h1>
            </div>
            <span>{session?.session_id || "No active session"}</span>
          </div>

          <div className="runtimeAvatarStage">
            <div className="runtimeAvatarBackdrop" />
            <div className="runtimeAvatarPortrait" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                shapeRendering="geometricPrecision"
                textRendering="geometricPrecision"
                imageRendering="optimizeQuality"
                fillRule="evenodd"
                clipRule="evenodd"
                viewBox="0 0 512 512"
              >
                <path fill="#D0D0D0" d="M0 0h512v512H0z" />
                <path
                  fill="#B1B1B1"
                  d="M174.139 280.588c-11.32-3.697-19.915-9.191-25.926-16.341 17.362-6.542 25.352-27.052 26.478-57.757.835-22.826-3.905-41.685 3.882-64.21 15.414-44.591 72.372-59.828 104.114-33.739 24.888-2.654 49.962 10.181 55.377 48.562 4.041 28.659-4.537 58.357 4.509 84.756 3.891 11.359 10.644 20.047 21.213 25.126-6.775 6.479-16.593 10.776-28.368 13.647-9.112 2.225-25.572 3.932-44.737 4.953v13.44l18.649 24.916-53.361 42.435-53.299-42.057 14.238-23.909v-14.445c-18.584-.88-34.318-2.619-42.769-5.377zm160.831 64.768c-8.26-16.581-18.734-30.641-30.926-43.854 22.977 8.89 50.179 17.669 67.564 28.573 11.06 6.933 16.776 12.157 21.25 20.55 11.016 20.66 9.396 43.614 15.285 65.592H103.856c5.885-21.978 4.266-44.932 15.286-65.592 4.474-8.393 10.186-13.617 21.25-20.55 17.38-10.904 44.582-19.683 67.564-28.573-12.192 13.213-22.666 27.273-30.93 43.854l23.926-.586 53.716 42.901 56.375-42.901 23.927.586z"
                />
              </svg>
            </div>
            <div className="runtimeAvatarCaption">
              <Bot size={18} />
              <span>{busy ? "Formulating response" : "Waiting for response"}</span>
            </div>
          </div>

          <div className="runtimeLiveResponse">
            <span>{avatarName}</span>
            <p>{latestAvatar?.text || "The avatar response will appear here when the roleplay begins."}</p>
          </div>

          <footer className="runtimeComposerShell">
            <div className="runtimeSessionStrip">
              <span>{avatarTurns} avatar turns</span>
            </div>
            <form className="runtimeComposer" onSubmit={sendTurn}>
              <div className="runtimeDraftField">
                <div className="runtimeDraftLabelRow">
                  <label htmlFor="runtime-response">
                    {listening ? "Listening — edit the transcript before sending" : "Your response"}
                  </label>
                  <span>Enter to send · Shift+Enter for a new line</span>
                </div>
                <textarea
                  id="runtime-response"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={sendOnEnter}
                  placeholder={listening ? "Listening… recognized speech will appear here." : "Type your trainee response or use the microphone…"}
                  disabled={busy || !session?.session_id}
                  rows={2}
                />
                <button
                  className={listening ? "voiceButton active" : "voiceButton"}
                  type="button"
                  onClick={toggleListening}
                  disabled={busy || !session?.session_id}
                  aria-pressed={listening}
                  aria-label={listening ? "Stop voice capture" : "Start voice capture"}
                  title={listening ? "Stop voice capture" : "Start voice capture"}
                >
                  {listening ? <MicOff size={19} /> : <Mic size={19} />}
                </button>
              </div>
              <button className="sendButton" type="submit" disabled={busy || !input.trim() || !session?.session_id} aria-label="Send">
                <Send size={18} />
              </button>
            </form>
          </footer>
        </div>

        <aside className="runtimeMindPanel" aria-label="Avatar State of Mind">
          <div className="runtimePanelHeader">
            <div>
              <p>State of Mind</p>
              <span>Avatar readout</span>
            </div>
            <Gauge size={18} />
          </div>
          <div className="mindStatus">
            <strong>{traineeTurns > 1 ? "Opening up" : "Cautious"}</strong>
            <span>{traineeTurns > 1 ? "More direct, still guarded" : "Low trust, careful answers"}</span>
          </div>
          <div className="mindMeters">
            {mind.map((item) => (
              <div className="mindMeter" key={item.label}>
                <div>
                  <span>{item.label}</span>
                  <em>{item.value}%</em>
                </div>
                <progress className={item.tone} value={item.value} max="100" />
              </div>
            ))}
          </div>
          <div className="mindCue">
            <span>Current cue</span>
            <p>{latestAvatar?.fallback ? "Response used fallback behavior." : "Respond with calm specificity and acknowledge the concern before moving forward."}</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
