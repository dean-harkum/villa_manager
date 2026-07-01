export type Islander = {
  id: string;
  name: string;
  charm: number;
  loyalty: number;
  drama: number;
  strategy: number;
  mood: number;
  look: IslanderLook;
  relationships: Record<string, number>;
};

export type HairStyle = "short" | "bob" | "waves" | "coils";

export type IslanderLook = {
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  outfit: string;
  vibe: string;
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

export type PerfectRelationship = {
  firstName: string;
  secondName: string;
};

export type SeasonRecap = {
  happiestMood: number;
  happiestIslanders: string[];
  bestStrategy: number;
  bestStrategists: string[];
  highestDrama: number;
  highestDramaIslanders: string[];
  perfectRelationships: PerfectRelationship[];
};

export const SEASON_LENGTH = 14;

export const hairStyles: HairStyle[] = ["short", "bob", "waves", "coils"];

export const outfitColors = ["#ff6f61", "#315f7d", "#9be7c1", "#ffd86f", "#b89cff", "#f78fb3"];

export const hairColors = ["#2f1f1a", "#6f4424", "#d9a441", "#111827", "#8a4f35", "#f2f0e6"];

export const skinTones = ["#8d5524", "#c68642", "#e0ac69", "#f1c27d", "#ffdbac", "#6b3f2a"];

const dateSummaries = [
  "{pair} found an easy rhythm on their date. Viewers liked the softer side, and the villa tension cooled slightly.",
  "{pair} traded stories under the lights and came back smiling. The audience bought into the chemistry.",
  "{pair} had a slow-burn date that felt surprisingly sincere. The villa felt calmer when they returned.",
  "{pair} turned a simple date into a headline moment. Their connection gave ratings a tidy lift.",
];

const challengeSummaries = [
  "{lead} read the room perfectly during the challenge. Everyone got screen time, but {lead} owned the final beat.",
  "The whole villa threw themselves into the challenge. {lead} played the sharpest game and left the others buzzing.",
  "{lead} turned the challenge into a showcase while the rest of the islanders fought for attention.",
  "It was messy, loud, and very watchable. {lead} came out looking like the one to beat.",
];

const upgradeSummaries = [
  "Fresh lights, better food, softer loungers. Everyone relaxed and the audience noticed the glow-up.",
  "The villa got a slick refresh, and the islanders immediately acted like they had earned a luxury holiday.",
  "Production spent wisely. Better comforts lifted the mood and made the whole place feel more premium.",
];

const budgetSummaries = [
  "The budget was too tight for a real upgrade, so production settled for small comforts and saved cash.",
  "The upgrade plan hit a money wall. A few tiny improvements landed, but nobody called it glamorous.",
  "The villa wishlist stayed mostly theoretical today. The team banked a little cash and hoped for better timing.",
];

const stirSummaries = [
  "{instigator} nudged a rumor toward {target}. The audience watched closely, but approval took a hit.",
  "{instigator} chose chaos and pulled {target} into the center of it. Ratings climbed while goodwill dipped.",
  "{instigator} dropped a pointed comment near {target}, and the villa temperature changed fast.",
  "{instigator} found the soft spot in {target}'s day and poked it. Messy television, risky management.",
];

const starterLooks: Record<string, IslanderLook> = {
  maya: {
    skin: "#c68642",
    hair: "#2f1f1a",
    hairStyle: "waves",
    outfit: "#ff6f61",
    vibe: "Sunlit charmer",
  },
  rio: {
    skin: "#8d5524",
    hair: "#111827",
    hairStyle: "short",
    outfit: "#315f7d",
    vibe: "Cool tactician",
  },
  nina: {
    skin: "#f1c27d",
    hair: "#d9a441",
    hairStyle: "bob",
    outfit: "#9be7c1",
    vibe: "Sweet strategist",
  },
  zane: {
    skin: "#e0ac69",
    hair: "#6f4424",
    hairStyle: "coils",
    outfit: "#ffd86f",
    vibe: "Chaos magnet",
  },
};

const starterIslanders: Islander[] = [
  {
    id: "maya",
    name: "Maya",
    charm: 8,
    loyalty: 6,
    drama: 4,
    strategy: 5,
    mood: 7,
    look: starterLooks.maya,
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
    look: starterLooks.rio,
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
    look: starterLooks.nina,
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
    look: starterLooks.zane,
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
    look: { ...islander.look },
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

export function hydrateGameState(saved: GameState): GameState {
  const fresh = createInitialGameState();
  const islanders = fresh.islanders.map((freshIslander) => {
    const savedIslander = saved.islanders.find((islander) => islander.id === freshIslander.id);

    if (!savedIslander) {
      return freshIslander;
    }

    return {
      ...freshIslander,
      ...savedIslander,
      look: {
        ...freshIslander.look,
        ...savedIslander.look,
      },
      relationships: {
        ...freshIslander.relationships,
        ...savedIslander.relationships,
      },
    };
  });

  return {
    ...fresh,
    ...saved,
    isComplete: saved.day > SEASON_LENGTH,
    islanders,
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
  const isComplete = nextDay > SEASON_LENGTH;

  return {
    ...state,
    day: nextDay,
    isComplete,
    log: [logEntry, ...state.log],
  };
}

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function fillTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (summary, [key, value]) => summary.split(`{${key}}`).join(value),
    template,
  );
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
        summary: fillTemplate(pickRandom(dateSummaries), { pair: label }),
      },
    );
  }

  if (action === "challenge") {
    const lead = [...state.islanders].sort((a, b) => b.strategy - a.strategy)[0];
    const islanders = state.islanders.map((islander) => ({
      ...islander,
      mood: clamp(islander.mood + (islander.id === lead.id ? 7 : 2)),
      drama: clamp(islander.drama + (islander.loyalty < 6 ? 2 : 1), 0, 10),
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
        summary: fillTemplate(pickRandom(challengeSummaries), { lead: lead.name }),
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
        summary: pickRandom(canAfford ? upgradeSummaries : budgetSummaries),
      },
    );
  }

  const instigator = [...state.islanders].sort((a, b) => b.drama - a.drama)[0];
  const target = pickRandom(state.islanders.filter((islander) => islander.id !== instigator.id));
  let islanders = adjustRelationship(state.islanders, instigator.id, target.id, -10);
  islanders = updateIslander(islanders, instigator.id, (islander) => ({
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
      summary: fillTemplate(pickRandom(stirSummaries), {
        instigator: instigator.name,
        target: target.name,
      }),
    },
  );
}

export function updateIslanderLook(
  state: GameState,
  islanderId: string,
  lookUpdate: Partial<IslanderLook>,
): GameState {
  return {
    ...state,
    islanders: state.islanders.map((islander) =>
      islander.id === islanderId
        ? {
            ...islander,
            look: {
              ...islander.look,
              ...lookUpdate,
            },
          }
        : islander,
    ),
  };
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

export function createSeasonRecap(state: GameState): SeasonRecap {
  const happiestMood = Math.max(...state.islanders.map((islander) => islander.mood));
  const happiestIslanders = state.islanders
    .filter((islander) => islander.mood === happiestMood)
    .map((islander) => islander.name);
  const bestStrategy = Math.max(...state.islanders.map((islander) => islander.strategy));
  const bestStrategists = state.islanders
    .filter((islander) => islander.strategy === bestStrategy)
    .map((islander) => islander.name);
  const highestDrama = Math.max(...state.islanders.map((islander) => islander.drama));
  const highestDramaIslanders = state.islanders
    .filter((islander) => islander.drama === highestDrama)
    .map((islander) => islander.name);
  const seenPairs = new Set<string>();
  const perfectRelationships: PerfectRelationship[] = [];

  state.islanders.forEach((islander) => {
    Object.entries(islander.relationships).forEach(([targetId, value]) => {
      if (value < 100) {
        return;
      }

      const target = state.islanders.find((item) => item.id === targetId);

      if (!target) {
        return;
      }

      const pairKey = [islander.id, target.id].sort().join("-");

      if (seenPairs.has(pairKey)) {
        return;
      }

      seenPairs.add(pairKey);
      perfectRelationships.push({
        firstName: islander.name,
        secondName: target.name,
      });
    });
  });

  return {
    happiestMood,
    happiestIslanders,
    bestStrategy,
    bestStrategists,
    highestDrama,
    highestDramaIslanders,
    perfectRelationships,
  };
}
