/**
 * Coach agent types — Prompt → Context → RAG → Tools → MCP → ReAct.
 *
 * Vendor Collections / Files / stateful Responses are forbidden under ZDR
 * (see src/lib/coach/INDEX.md). Retrieval and tools run in-process against
 * a world the chat route already holds: catalog text, compact log facts,
 * the week snapshot. Nothing here reads rewards, rank, or social standing.
 */

export type CoachKnowledgeKind = 'exercise' | 'guide' | 'form' | 'log' | 'plan';

export type CoachKnowledgeDoc = {
  id: string;
  kind: CoachKnowledgeKind;
  title: string;
  text: string;
  /** Optional exercise id when the chunk is about one movement. */
  exerciseId?: string;
};

export type CoachRetrievalHit = CoachKnowledgeDoc & {
  score: number;
};

export type CoachLogFact = {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  at: string;
};

export type CoachWeekSessionFact = {
  name: string;
  kind: string;
  status: string;
  exerciseIds: string[];
};

export type CoachLoadZoneFact = 'unknown' | 'light' | 'steady' | 'high';

export type CoachAgentWorld = {
  logFacts: CoachLogFact[];
  weekSessions: CoachWeekSessionFact[];
  loadZone: CoachLoadZoneFact;
  trainDays14: number;
  todaySession?: {
    name: string;
    kind: string;
    estMinutes: number;
    exercises: { id: string; name: string }[];
  };
  /** Knowledge corpus for search_knowledge. Omit in unit tests that inject hits. */
  documents?: CoachKnowledgeDoc[];
};

export type CoachToolJsonSchema = {
  type: 'object';
  properties: Record<
    string,
    {
      type: 'string' | 'number';
      description: string;
    }
  >;
  required: string[];
  additionalProperties: false;
};

/** MCP `tools/list` item + OpenAI-compatible function parameters. */
export type CoachToolSpec = {
  name: string;
  description: string;
  inputSchema: CoachToolJsonSchema;
};

export type CoachToolResult = {
  ok: boolean;
  /** Compact observation text the ReAct loop feeds back. */
  observation: string;
};

export type CoachReactAction = {
  kind: 'action';
  thought?: string;
  name: string;
  input: Record<string, unknown>;
};

export type CoachReactFinal = {
  kind: 'final';
  thought?: string;
  text: string;
};

export type CoachReactParse = CoachReactAction | CoachReactFinal;

export type CoachReactStep = {
  thought?: string;
  action?: string;
  input?: Record<string, unknown>;
  observation?: string;
};

export type CoachCompleteOk = {
  ok: true;
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimated: boolean;
  };
};

export type CoachCompleteFail = {
  ok: false;
  reason: string;
};

export type CoachCompleteFn = (req: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}) => Promise<CoachCompleteOk | CoachCompleteFail>;
