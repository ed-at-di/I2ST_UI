import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronDown, FileSpreadsheet, LogOut, PhoneOff } from "lucide-react";
import logo from "../images/EOCo-logo-black.png";
import { DUMMY_STATS, DUMMY_USER } from "../data/dummyHomeData.js";

export function AppHeader({ onLogout, wizardNavigation, runtimeSession }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuId = useId();
  const userMenuRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!isUserMenuOpen) return undefined;

    function closeOnOutsideClick(event) {
      if (!userMenuRef.current?.contains(event.target)) setIsUserMenuOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key !== "Escape") return;
      setIsUserMenuOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isUserMenuOpen]);

  const currentWizardPosition = wizardNavigation
    ? Math.max(0, wizardNavigation.steps.findIndex((item) => item.index === wizardNavigation.step))
    : -1;

  return (
    <header className={`appHeader ${wizardNavigation ? "appHeaderWizard" : ""} ${runtimeSession ? "appHeaderRuntime" : ""}`}>
      <div className="appHeaderLeading">
        {runtimeSession ? (
          <div className="appHeaderRuntimeTitle">
            <span>Active Stage</span>
            <strong>{runtimeSession.title}</strong>
          </div>
        ) : wizardNavigation ? (
          <button className="appHeaderBack" type="button" onClick={wizardNavigation.onExitToHome} aria-label="Back to Home" title="Back to Home">
            <ArrowLeft size={19} />
          </button>
        ) : (
          <span className="appHeaderMark">
            <img src={logo} alt="EOCo" />
          </span>
        )}
      </div>

      {wizardNavigation && (
        <nav className="appHeaderProgress" aria-label="Scenario creation progress">
          <ol className="wizardStepper">
            {wizardNavigation.steps.map((item, position) => {
              const done = position < currentWizardPosition;
              const active = item.index === wizardNavigation.step;
              return (
                <li key={item.key} className={`wizardStepperItem ${active ? "active" : ""} ${done ? "done" : ""}`}>
                  <button
                    className="wizardStepperTarget"
                    type="button"
                    disabled={!done}
                    onClick={() => wizardNavigation.onStepChange(item.index)}
                    aria-current={active ? "step" : undefined}
                  >
                    <span className="wizardStepperDot">{done ? <Check size={12} /> : position + 1}</span>
                    <span className="wizardStepperLabel">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {runtimeSession && (
        <div className="appHeaderRuntimeActions">
          <button type="button" onClick={runtimeSession.onExport} disabled={runtimeSession.exportDisabled}>
            <FileSpreadsheet size={16} />
            <span>Export Scenario</span>
          </button>
          <button className="danger" type="button" onClick={runtimeSession.onEndSession}>
            <PhoneOff size={16} />
            <span>End Session</span>
          </button>
        </div>
      )}

      <div className="appHeaderUser" ref={userMenuRef}>
        <button
          ref={triggerRef}
          className="appHeaderUserButton"
          type="button"
          aria-expanded={isUserMenuOpen}
          aria-controls={menuId}
          aria-haspopup="dialog"
          onClick={() => setIsUserMenuOpen((current) => !current)}
        >
          <span className="appHeaderUserName">{DUMMY_USER.name}</span>
          <ChevronDown className="appHeaderUserChevron" size={16} aria-hidden="true" />
        </button>

        {isUserMenuOpen && (
          <section id={menuId} className="userMenu" role="dialog" aria-label="User account">
            <div className="userMenuIdentity">
              <span className="userMenuEyebrow">Signed in as</span>
              <strong>{DUMMY_USER.name}</strong>
              <span>{DUMMY_USER.role}</span>
              <span>{DUMMY_USER.team}</span>
            </div>

            <div className="userMenuStats" aria-label="Your activity">
              {DUMMY_STATS.map((stat) => (
                <div className="userMenuStat" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="userMenuActions">
              <button className="userMenuLogout" type="button" onClick={onLogout}>
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </div>
          </section>
        )}
      </div>
    </header>
  );
}
