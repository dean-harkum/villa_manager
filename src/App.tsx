import { useEffect, useMemo, useState } from "react";
import {
  ActionType,
  GameState,
  calculateFinalScore,
  createInitialGameState,
  playAction,
} from "./game";

const SAVE_KEY = "villa-manager-save-v1";

const actionCopy: Record<ActionType, { label: string; detail: string }> = {
  date: {
    label: "Send on a date",
    detail: "Builds chemistry, calms drama, and earns steady ratings.",
  },
  challenge: {
    label: "Host a challenge",
    detail: "Boosts ratings and cash, but competitive energy can raise drama.",
  },
  upgrade: {
    label: "Upgrade the villa",
    detail: "Spend money to improve mood, approval, and the villa level.",
  },
  stir: {
    label: "Stir the pot",
    detail: "Creates drama for ratings and money, at the cost of approval.",
  },
};

export function App() {
  const [state, setState] = useState<GameState>(() => {
    const saved = window.localStorage.getItem(SAVE_KEY);
    return saved ? (JSON.parse(saved) as GameState) : createInitialGameState();
  });
  const [firstPick, setFirstPick] = useState("maya");
  const [secondPick, setSecondPick] = useState("rio");

  useEffect(() => {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }, [state]);

  const finalScore = useMemo(() => calculateFinalScore(state), [state]);
  const selectedPairIsValid = firstPick !== secondPick;

  function handleAction(action: ActionType) {
    setState((current) => playAction(current, action, firstPick, secondPick));
  }

  function restart() {
    const freshState = createInitialGameState();
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(freshState));
    setState(freshState);
    setFirstPick("maya");
    setSecondPick("rio");
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">7-day season prototype</p>
          <h1>Villa Manager</h1>
          <p className="intro">
            Balance chemistry, drama, cash, and audience approval as four fictional islanders chase a
            headline-worthy season.
          </p>
        </div>
        <button className="restart-button" onClick={restart}>
          Restart
        </button>
      </section>

      <section className="dashboard" aria-label="Season stats">
        <Stat label="Day" value={state.isComplete ? "Finale" : `${state.day} / 7`} />
        <Stat label="Ratings" value={state.ratings} />
        <Stat label="Money" value={`$${state.money}`} />
        <Stat label="Drama" value={state.drama} />
        <Stat label="Public approval" value={state.publicApproval} />
        <Stat label="Villa level" value={state.villaLevel} />
      </section>

      {state.isComplete ? (
        <section className="finale-panel">
          <p className="eyebrow">Season complete</p>
          <h2>Final score: {finalScore}</h2>
          <p>
            The season wrapped with ratings at {state.ratings}, public approval at {state.publicApproval},
            drama at {state.drama}, and a level {state.villaLevel} villa.
          </p>
        </section>
      ) : (
        <section className="control-panel">
          <div className="pair-picker">
            <label>
              Date pick one
              <select value={firstPick} onChange={(event) => setFirstPick(event.target.value)}>
                {state.islanders.map((islander) => (
                  <option key={islander.id} value={islander.id}>
                    {islander.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date pick two
              <select value={secondPick} onChange={(event) => setSecondPick(event.target.value)}>
                {state.islanders.map((islander) => (
                  <option key={islander.id} value={islander.id}>
                    {islander.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="action-grid">
            {(Object.keys(actionCopy) as ActionType[]).map((action) => (
              <button
                key={action}
                className="action-card"
                disabled={action === "date" && !selectedPairIsValid}
                onClick={() => handleAction(action)}
              >
                <strong>{actionCopy[action].label}</strong>
                <span>{actionCopy[action].detail}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="islander-grid" aria-label="Islanders">
        {state.islanders.map((islander) => (
          <article className="islander-card" key={islander.id}>
            <div className="card-topline">
              <h2>{islander.name}</h2>
              <span>Mood {islander.mood}</span>
            </div>
            <div className="trait-grid">
              <Trait label="Charm" value={islander.charm} />
              <Trait label="Loyalty" value={islander.loyalty} />
              <Trait label="Drama" value={islander.drama} />
              <Trait label="Strategy" value={islander.strategy} />
            </div>
            <div className="relationships">
              <h3>Relationships</h3>
              {Object.entries(islander.relationships).map(([targetId, value]) => {
                const target = state.islanders.find((item) => item.id === targetId);
                return (
                  <div className="relationship-row" key={targetId}>
                    <span>{target?.name}</span>
                    <meter min="0" max="100" value={value} />
                    <span>{value}</span>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>

      <section className="log-panel">
        <h2>Game log</h2>
        <div className="log-list">
          {state.log.map((entry, index) => (
            <article className="log-entry" key={`${entry.day}-${entry.title}-${index}`}>
              <span>{entry.day === 0 ? "Intro" : `Day ${entry.day}`}</span>
              <h3>{entry.title}</h3>
              <p>{entry.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Trait({ label, value }: { label: string; value: number }) {
  return (
    <div className="trait">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
