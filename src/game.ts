export type Islander = {
  id: string;
  name: string;
  charm: number;
  loyalty: number;
  drama: number;
  strategy: number;
  mood: number;
  relationships: Record<string, number>;
};

export type ActionType = "date" | "challenge" | "upgrade" | "stir";

export type LogEntry = {
  day: number;
  title: string;
  summary: string;
};

export type GameState = {
  day: number;
  ratings: number;
  money: number;
  villaLevel: number;
  publicApproval: number;
  drama: number;
  islanders: Islander[];
  log: LogEntry[];
  isComplete: boolean;
};

const MAX_DAY = 7;

const starterIslanders: Islander[] = [
  {
    id: "maya",
    name: "Maya",
    charm: 8,
    loyalty: 6,
    drama: 4,
    strategy: 5,
    mood: 7,
    relationships: {},
  },
  {
    id: "rio",
    name: "Rio",
    charm: 7,
    loyalty: 4,
    drama: 6,
    strategy: 8,
    mood: 6,
    relationships: {},
  },
  {
    id: "nina",
    name: "Nina",
    charm: 6,
    loyalty: 8,
    drama: 3,
    strategy: 6,
    mood: 7,
    relationships: {},
  },
  {
    id: "zane",
    name: "Zane",
    charm: 5,
    loyalty: 5,
    drama: 8,
    strategy: 7,
    mood: 5,
    relationships: {},
  },
];

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function createRelationshipMap(islanderId: string) {
  return starterIslanders.reduce<Record<string, number>>((relationships, target) => {
    if (target.id !== islanderId) {
      relationships[target.id] = 50;
    }

    return relationships;
  }, {});
}

export function createInitialGameState(): GameState {
  const islanders = starterIslanders.map((islander) => ({
    ...islander,
    relationships: createRelationshipMap(islander.id),
  }));

  return {
    day: 1,
    ratings: 50,
    money: 500,
    villaLevel: 1,
    publicApproval: 55,
    drama: 35,
    islanders,
    log: [
      {
        day: 0,
        title: "Season opens",
        summary: "Four fresh islanders enter the villa. The cameras are rolling and the audience wants chemistry.",
      },
    ],
    isComplete: false,
  };
}

function updateIslander(
  islanders: Islander[],
  id: string,
  updater: (islander: Islander) => Islander,
) {
  return islanders.map((islander) => (islander.id === id ? updater(islander) : islander));
}

function adjustRelationship(islanders: Islander[], firstId: string, secondId: string, amount: number) {
  return islanders.map((islander) => {
    if (islander.id !== firstId && islander.id !== secondId) {
      return islander;
    }

    const targetId = islander.id === firstId ? secondId : firstId;

    return {
      ...islander,
      relationships: {
        ...islander.relationships,
        [targetId]: clamp(islander.relationships[targetId] + amount),
      },
    };
  });
}

function getPairLabel(state: GameState, firstId?: string, secondId?: string) {
  const first = state.islanders.find((islander) => islander.id === firstId);
  const second = state.islanders.find((islander) => islander.id === secondId);

  return first && second ? `${first.name} and ${second.name}` : "Two islanders";
}

function finishDay(state: GameState, logEntry: LogEntry): GameState {
  const nextDay = state.day + 1;
  const isComplete = nextDay > MAX_DAY;

  return {
    ...state,
    day: nextDay,
    isComplete,
    log: [logEntry, ...state.log],
  };
}

export function playAction(state: GameState, action: ActionType, firstId?: string, secondId?: string): GameState {
  if (state.isComplete) {
    return state;
  }

  if (action === "date" && (!firstId || !secondId || firstId === secondId)) {
    return state;
  }

  if (action === "date") {
    const label = getPairLabel(state, firstId, secondId);
    let islanders = adjustRelationship(state.islanders, firstId as string, secondId as string, 12);
    islanders = updateIslander(islanders, firstId as string, (islander) => ({
      ...islander,
      mood: clamp(islander.mood + 8),
    }));
    islanders = updateIslander(islanders, secondId as string, (islander) => ({
      ...islander,
      mood: clamp(islander.mood + 8),
    }));

    const chemistryBoost =
      (islanders.find((islander) => islander.id === firstId)?.charm ?? 0) +
      (islanders.find((islander) => islander.id === secondId)?.charm ?? 0);

    return finishDay(
      {
        ...state,
        islanders,
        ratings: clamp(state.ratings + Math.round(chemistryBoost / 3)),
        publicApproval: clamp(state.publicApproval + 4),
        drama: clamp(state.drama - 3),
        money: state.money + 120,
      },
      {
        day: state.day,
        title: "Date night",
        summary: `${label} shared a spark-filled date. Viewers liked the softer side, and the villa tension cooled slightly.`,
      },
    );
  }

  if (action === "challenge") {
    const mostStrategic = [...state.islanders].sort((a, b) => b.strategy - a.strategy)[0];
    const islanders = state.islanders.map((islander) => ({
      ...islander,
      mood: clamp(islander.mood + (islander.id === mostStrategic.id ? 6 : 2)),
      drama: clamp(islander.drama + (islander.loyalty < 6 ? 2 : 0), 0, 10),
    }));

    return finishDay(
      {
        ...state,
        islanders,
        ratings: clamp(state.ratings + 8),
        drama: clamp(state.drama + 7),
        publicApproval: clamp(state.publicApproval + 1),
        money: state.money + 180,
      },
      {
        day: state.day,
        title: "Villa challenge",
        summary: `${mostStrategic.name} played the challenge beautifully. Ratings jumped, but a few competitive edges came out.`,
      },
    );
  }

  if (action === "upgrade") {
    const cost = 220 + state.villaLevel * 80;
    const canAfford = state.money >= cost;
    const islanders = state.islanders.map((islander) => ({
      ...islander,
      mood: clamp(islander.mood + (canAfford ? 7 : 1)),
    }));

    return finishDay(
      {
        ...state,
        islanders,
        villaLevel: canAfford ? state.villaLevel + 1 : state.villaLevel,
        money: canAfford ? state.money - cost : state.money + 60,
        ratings: clamp(state.ratings + (canAfford ? 4 : 1)),
        publicApproval: clamp(state.publicApproval + (canAfford ? 6 : -2)),
        drama: clamp(state.drama - (canAfford ? 4 : 0)),
      },
      {
        day: state.day,
        title: canAfford ? "Villa upgraded" : "Budget squeeze",
        summary: canAfford
          ? "Fresh lights, better food, softer loungers. Everyone relaxed and the audience noticed the glow-up."
          : "The budget was too tight for a real upgrade, so production settled for small comforts and saved cash.",
      },
    );
  }

  const highestDrama = [...state.islanders].sort((a, b) => b.drama - a.drama)[0];
  const target = state.islanders.find((islander) => islander.id !== highestDrama.id) ?? state.islanders[0];
  let islanders = adjustRelationship(state.islanders, highestDrama.id, target.id, -10);
  islanders = updateIslander(islanders, highestDrama.id, (islander) => ({
    ...islander,
    mood: clamp(islander.mood - 4),
    drama: clamp(islander.drama + 1, 0, 10),
  }));
  islanders = updateIslander(islanders, target.id, (islander) => ({
    ...islander,
    mood: clamp(islander.mood - 6),
  }));

  return finishDay(
    {
      ...state,
      islanders,
      ratings: clamp(state.ratings + 10),
      drama: clamp(state.drama + 12),
      publicApproval: clamp(state.publicApproval - 7),
      money: state.money + 220,
    },
    {
      day: state.day,
      title: "Pot stirred",
      summary: `${highestDrama.name} nudged a rumor toward ${target.name}. The audience watched closely, but approval took a hit.`,
    },
  );
}

export function calculateFinalScore(state: GameState) {
  const averageMood =
    state.islanders.reduce((total, islander) => total + islander.mood, 0) / state.islanders.length;
  const balanceBonus = Math.max(0, 30 - Math.abs(state.drama - 55));

  return Math.round(
    state.ratings * 2 +
      state.publicApproval * 2 +
      state.money / 15 +
      averageMood * 8 +
      state.villaLevel * 20 +
      balanceBonus,
  );
}
