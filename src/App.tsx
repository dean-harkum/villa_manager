import { CSSProperties, useEffect, useMemo, useState } from "react";
import {
  ActionType,
  GameState,
  SEASON_LENGTH,
  calculateFinalScore,
  createSeasonRecap,
  createInitialGameState,
  hairColors,
  hairStyles,
  hydrateGameState,
  outfitColors,
  playAction,
  skinTones,
  updateIslanderLook,
} from "./game";

const SAVE_KEY = "villa-manager-save-v1";

const actionCopy: Record<ActionType, { label: string; detail: string }> = {
  date: {
    label: "Send on a date",
    detail: "Builds chemistry, calms drama, and earns steady ratings.",
  },
  challenge: {
    label: "Host a challenge",
    detail: "The top strategist leads, while every islander gets pulled into the spectacle.",
  },
  upgrade: {
    label: "Upgrade the villa",
    detail: "Spend money to improve mood, approval, and the villa level.",
  },
  stir: {
    label: "Stir the pot",
    detail: "The highest-drama islander targets someone unpredictable.",
  },
};

export function App() {
  const [state, setState] = useState<GameState>(() => {
    const saved = window.localStorage.getItem(SAVE_KEY);
    return saved ? hydrateGameState(JSON.parse(saved) as GameState) : createInitialGameState();
  });
  const [firstPick, setFirstPick] = useState("maya");
  const [secondPick, setSecondPick] = useState("rio");

  useEffect(() => {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }, [state]);

  const finalScore = useMemo(() => calculateFinalScore(state), [state]);
  const seasonRecap = useMemo(() => createSeasonRecap(state), [state]);
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
          <p className="eyebrow">{SEASON_LENGTH}-day season prototype</p>
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
        <Stat label="Day" value={state.isComplete ? "Finale" : `${state.day} / ${SEASON_LENGTH}`} />
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
          <div className="recap-grid">
            <article>
              <span>Happiest islander{seasonRecap.happiestIslanders.length > 1 ? "s" : ""}</span>
              <strong>{seasonRecap.happiestIslanders.join(", ")}</strong>
              <p>Mood finished at {seasonRecap.happiestMood}.</p>
            </article>
            <article>
              <span>Best strategist{seasonRecap.bestStrategists.length > 1 ? "s" : ""}</span>
              <strong>{seasonRecap.bestStrategists.join(", ")}</strong>
              <p>Strategy rating: {seasonRecap.bestStrategy}.</p>
            </article>
            <article>
              <span>Most drama-riddled</span>
              <strong>{seasonRecap.highestDramaIslanders.join(", ")}</strong>
              <p>Drama rating: {seasonRecap.highestDrama}.</p>
            </article>
            <article>
              <span>Perfect relationships</span>
              {seasonRecap.perfectRelationships.length > 0 ? (
                <ul>
                  {seasonRecap.perfectRelationships.map((relationship) => (
                    <li key={`${relationship.firstName}-${relationship.secondName}`}>
                      {relationship.firstName} and {relationship.secondName}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No relationships reached 100 this season.</p>
              )}
            </article>
          </div>
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
            <div
              className={`avatar-scene hair-${islander.look.hairStyle} ${
                isFeminineIslander(islander.id) ? "is-feminine" : ""
              }`}
              style={
                {
                  "--skin": islander.look.skin,
                  "--hair": islander.look.hair,
                  "--outfit": islander.look.outfit,
                } as CSSProperties
              }
            >
              <div className="mood-bubble" aria-label={`Mood ${islander.mood}`}>
                {getMoodEmoji(islander.mood)}
              </div>
              <div className="avatar">
                <div className="avatar-hair" />
                <div className="avatar-head">
                  <div className="avatar-eyes" />
                  <div className={`avatar-mouth ${getMoodClass(islander.mood)}`} />
                </div>
                <div className="avatar-neck" />
                <div className="avatar-body" />
              </div>
            </div>
            <div className="card-topline">
              <div>
                <h2>{islander.name}</h2>
                <p>{islander.look.vibe}</p>
              </div>
              <span>{getMoodLabel(islander.mood)} {islander.mood}</span>
            </div>
            <div className="look-editor" aria-label={`${islander.name} appearance controls`}>
              <label>
                Hair
                <select
                  value={islander.look.hairStyle}
                  onChange={(event) =>
                    setState((current) =>
                      updateIslanderLook(current, islander.id, {
                        hairStyle: event.target.value as typeof islander.look.hairStyle,
                      }),
                    )
                  }
                >
                  {hairStyles.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </label>
              <Swatches
                label="Outfit"
                colors={outfitColors}
                selected={islander.look.outfit}
                onPick={(outfit) => setState((current) => updateIslanderLook(current, islander.id, { outfit }))}
              />
              <Swatches
                label="Hair color"
                colors={hairColors}
                selected={islander.look.hair}
                onPick={(hair) => setState((current) => updateIslanderLook(current, islander.id, { hair }))}
              />
              <Swatches
                label="Skin tone"
                colors={skinTones}
                selected={islander.look.skin}
                onPick={(skin) => setState((current) => updateIslanderLook(current, islander.id, { skin }))}
              />
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

function Swatches({
  label,
  colors,
  selected,
  onPick,
}: {
  label: string;
  colors: string[];
  selected: string;
  onPick: (color: string) => void;
}) {
  return (
    <div className="swatch-field">
      <span>{label}</span>
      <div className="swatch-row">
        {colors.map((color) => (
          <button
            key={color}
            className={color === selected ? "swatch selected" : "swatch"}
            style={{ background: color }}
            aria-label={`${label} ${color}`}
            onClick={() => onPick(color)}
          />
        ))}
      </div>
    </div>
  );
}

function getMoodEmoji(mood: number) {
  if (mood >= 80) {
    return "🤩";
  }

  if (mood >= 60) {
    return "😊";
  }

  if (mood >= 40) {
    return "😐";
  }

  if (mood >= 20) {
    return "😟";
  }

  return "😭";
}

function getMoodLabel(mood: number) {
  if (mood >= 80) {
    return "Delighted";
  }

  if (mood >= 60) {
    return "Happy";
  }

  if (mood >= 40) {
    return "Fine";
  }

  if (mood >= 20) {
    return "Stressed";
  }

  return "Crushed";
}

function getMoodClass(mood: number) {
  if (mood >= 60) {
    return "happy";
  }

  if (mood >= 40) {
    return "neutral";
  }

  return "sad";
}

function isFeminineIslander(islanderId: string) {
  return islanderId === "maya" || islanderId === "nina";
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
