import { ArrowRight, ArrowUpRight, Library, Play, Plus, Trash2 } from "lucide-react";
import { assignedScenariosFromCatalog } from "../data/dummyAssignedScenarioData.js";
import { DUMMY_STATS, DUMMY_USER, dummyLastRun } from "../data/dummyHomeData.js";

const RECENTS_LIMIT = 8;

function ScenarioTable({ scenarios, loading, emptyText, activityHeading, activityLabel, onOpenScenario, launchAction = false }) {
  if (loading) return <p className="homeEmptyState">Loading scenarios…</p>;
  if (!scenarios.length) return <p className="homeEmptyState">{emptyText}</p>;

  return (
    <div className="recentsTableWrap">
      <table className={`recentsTable ${launchAction ? "assignedScenarioTable" : ""}`}>
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Role</th>
            {!launchAction && <th>{activityHeading}</th>}
            <th aria-label="Action"></th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((item, index) => (
            <tr
              key={item.assignmentId || item.scenario_id}
              className={launchAction ? "assignedScenarioRow" : ""}
              onClick={launchAction ? undefined : () => onOpenScenario(item)}
            >
              <td className="recentsTitleCell">{item.title}</td>
              <td>{item.role || "—"}</td>
              {!launchAction && <td className="recentsLastRun">{activityLabel(item, index)}</td>}
              <td className={launchAction ? "assignedLaunchCell" : "recentsOpenCell"}>
                {launchAction ? (
                  <button className="assignedLaunchButton" type="button" onClick={() => onOpenScenario(item)}>
                    <Play size={14} />
                    <span>Launch Scenario</span>
                  </button>
                ) : (
                  <ArrowUpRight size={16} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HomeScreen({
  scenarios,
  loading,
  onCreateNew,
  onCreateFromExisting,
  onOpenScenario,
  onOpenAssignedScenario,
  draft,
  onResumeDraft,
  onDeleteDraft,
}) {
  const initial = DUMMY_USER.name.trim().slice(0, 1).toUpperCase();
  const recents = scenarios.slice(0, RECENTS_LIMIT);
  const assignedScenarios = assignedScenariosFromCatalog(scenarios);

  return (
    <div className="homeScreen">
      <aside className="homeSidebar">
        <div className="homeUserCard">
          <div className="homeUserIdentity">
            <span className="homeUserAvatar">{initial}</span>
            <div>
              <p className="homeUserGreeting">Welcome back, {DUMMY_USER.name.split(" ")[0]}</p>
              <p className="homeUserMeta">
                {DUMMY_USER.role} · {DUMMY_USER.team}
              </p>
            </div>
          </div>
          <div className="homeStatsRow">
            {DUMMY_STATS.map((stat) => (
              <div className="homeStatTile" key={stat.label}>
                <span className="homeStatValue">{stat.value}</span>
                <span className="homeStatLabel">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="homeMain">
        <section className="homeHero">
          <p className="eyebrow">I2ST Scenario Studio</p>
          <h1>Build and run roleplay training scenarios</h1>
          <p className="homeHeroSubtitle">
            Start with a blank scenario or use an existing scenario as the foundation.
          </p>
          <div className="homeCreateActions">
            <button className="primaryButton homeCreateButton" type="button" onClick={onCreateNew}>
              <Plus size={18} />
              <span>Create New</span>
            </button>
            <button className="secondaryButton homeCreateButton" type="button" onClick={onCreateFromExisting}>
              <Library size={18} />
              <span>Create from Existing</span>
            </button>
          </div>
        </section>

        {draft && (
          <section className="homeCurrentSection">
            <h2>Current Scenario</h2>
            <div className="currentCard" onClick={onResumeDraft}>
              <div className="currentCardInfo">
                <span className="currentCardBadge">{draft.stepLabel}</span>
                <h3>{draft.title}</h3>
                <span className="currentCardRole">{draft.role}</span>
              </div>
              <div className="currentCardActions">
                <button
                  className="currentCardDelete"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteDraft();
                  }}
                  aria-label="Delete current scenario"
                  title="Delete current scenario"
                >
                  <Trash2 size={16} />
                </button>
                <span className="currentCardResume">
                  <ArrowRight size={18} />
                </span>
              </div>
            </div>
          </section>
        )}

        <section className="homeScenarios assignedScenarios">
          <div className="homeSectionHeading">
            <div>
              <h2>Assigned Scenarios</h2>
              <p>Scenarios selected for your upcoming training.</p>
            </div>
            <span>{assignedScenarios.length} assigned</span>
          </div>
          <ScenarioTable
            scenarios={assignedScenarios}
            loading={loading}
            emptyText="No scenarios are currently assigned."
            onOpenScenario={onOpenAssignedScenario}
            launchAction
          />
        </section>

        <section className="homeScenarios">
          <h2>Recent Scenarios</h2>
          <ScenarioTable
            scenarios={recents}
            loading={loading}
            emptyText="No scenarios yet — create your first one above."
            activityHeading="Last Run"
            activityLabel={(_, index) => dummyLastRun(index)}
            onOpenScenario={onOpenScenario}
          />
        </section>
      </div>
    </div>
  );
}
