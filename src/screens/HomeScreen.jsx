import { ArrowRight, ArrowUpRight, Plus, Trash2 } from "lucide-react";
import { DUMMY_STATS, DUMMY_USER, dummyLastRun } from "../data/dummyHomeData.js";

const RECENTS_LIMIT = 8;

export function HomeScreen({ scenarios, loading, onCreateNew, onOpenScenario, draft, onResumeDraft, onDeleteDraft }) {
  const initial = DUMMY_USER.name.trim().slice(0, 1).toUpperCase();
  const recents = scenarios.slice(0, RECENTS_LIMIT);

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
            Start a brand-new scenario from scratch, or pick up one that's already been built below.
          </p>
          <button className="primaryButton homeCreateButton" type="button" onClick={onCreateNew}>
            <Plus size={18} />
            <span>Create New Scenario</span>
          </button>
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

        <section className="homeScenarios">
          <h2>Recent Scenarios</h2>
          {loading && <p className="homeEmptyState">Loading scenarios…</p>}
          {!loading && recents.length === 0 && <p className="homeEmptyState">No scenarios yet — create your first one above.</p>}
          {!loading && recents.length > 0 && (
            <div className="recentsTableWrap">
              <table className="recentsTable">
                <thead>
                  <tr>
                    <th>Scenario</th>
                    <th>Role</th>
                    <th>Last Run</th>
                    <th aria-hidden="true"></th>
                  </tr>
                </thead>
                <tbody>
                  {recents.map((item, index) => (
                    <tr key={item.scenario_id} onClick={() => onOpenScenario(item)}>
                      <td className="recentsTitleCell">{item.title}</td>
                      <td>{item.role || "—"}</td>
                      <td className="recentsLastRun">{dummyLastRun(index)}</td>
                      <td className="recentsOpenCell">
                        <ArrowUpRight size={16} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
