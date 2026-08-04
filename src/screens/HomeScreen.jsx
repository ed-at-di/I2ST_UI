import { ArrowRight, Library, Play, Plus, Trash2 } from "lucide-react";
import { assignedScenariosFromCatalog } from "../data/dummyAssignedScenarioData.js";
import { DUMMY_STATS, DUMMY_USER } from "../data/dummyHomeData.js";

function AssignedScenarioTable({ scenarios, loading, emptyText, onOpenScenario }) {
  if (loading) return <p className="homeEmptyState">Loading scenarios…</p>;
  if (!scenarios.length) return <p className="homeEmptyState">{emptyText}</p>;

  return (
    <div className="recentsTableWrap">
      <table className="recentsTable assignedScenarioTable">
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Role</th>
            <th aria-label="Action"></th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((item) => (
            <tr key={item.assignmentId || item.scenario_id} className="assignedScenarioRow">
              <td className="recentsTitleCell">{item.title}</td>
              <td>{item.role || "—"}</td>
              <td className="assignedLaunchCell">
                <button className="assignedLaunchButton" type="button" onClick={() => onOpenScenario(item)}>
                  <Play size={14} />
                  <span>Launch Scenario</span>
                </button>
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
  onOpenAssignedScenario,
  draft,
  onResumeDraft,
  onDeleteDraft,
}) {
  const firstName = DUMMY_USER.name.split(" ")[0];
  const assignedScenarios = assignedScenariosFromCatalog(scenarios);

  return (
    <div className="homeScreen">
      <aside className="homeSidebar">
        <div className="homeUserCard">
          <div className="homeUserIdentity">
            <p className="homeUserWelcome">Welcome back</p>
            <p className="homeUserName">{firstName}</p>
            <div className="homeUserMeta">
              <span className="homeUserRole">{DUMMY_USER.role}</span>
              <span className="homeUserTeam">{DUMMY_USER.team}</span>
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
          <AssignedScenarioTable
            scenarios={assignedScenarios}
            loading={loading}
            emptyText="No scenarios are currently assigned."
            onOpenScenario={onOpenAssignedScenario}
          />
        </section>
      </div>
    </div>
  );
}
