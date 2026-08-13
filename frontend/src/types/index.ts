export type SkillLevel = "beginner" | "intermediate" | "advanced";

export type Language = "python" | "java" | "cpp" | "c" | "javascript" | "typescript";

export type Severity = "critical" | "warning" | "improvement" | "suggestion";

export interface ChatMessageIn {
  role: "user" | "assistant";
  content: string;
}

export interface TutorRequest {
  session_id?: string | null;
  message: string;
  skill_level: SkillLevel;
  history: ChatMessageIn[];
}

export interface TutorResponse {
  session_id: string;
  reply: string;
  concepts: string[];
  follow_up_suggestions: string[];
}

export interface DebugRequest {
  language: Language;
  code: string;
  error_message?: string | null;
  expected_behavior?: string | null;
  reveal_fix: boolean;
}

export interface Complexity {
  time: string;
  space: string;
}

export interface DebugResponse {
  id: string;
  problem: string;
  why_it_happens: string;
  hint: string;
  suggested_fix: string | null;
  explanation: string | null;
  concepts: string[];
  complexity: Complexity | null;
}

export interface ReviewRequest {
  language: Language;
  code: string;
}

export interface ReviewFinding {
  severity: Severity;
  location: string;
  problem: string;
  explanation: string;
  suggestion: string;
}

export interface ReviewResponse {
  id: string;
  summary: string;
  findings: ReviewFinding[];
  strengths: string[];
}

// --- Hint Mode ---

export interface HintRequest {
  problem: string;
  code?: string | null;
  language?: Language | null;
  skill_level: SkillLevel;
  reveal_solution: boolean;
}

export interface HintResponse {
  id: string;
  hint_1: string;
  hint_2: string;
  hint_3: string;
  solution: string | null;
  concepts: string[];
}

// --- Explain Code ---

export type ExplainDetail = "quick" | "detailed";

export interface ExplainRequest {
  language: Language;
  code: string;
  detail: ExplainDetail;
}

export interface LineExplanation {
  lines: string;
  explanation: string;
}

export interface ExplainResponse {
  id: string;
  high_level: string;
  line_by_line: LineExplanation[];
  concepts: string[];
  inputs_outputs: string;
  edge_cases: string[];
  complexity: Complexity;
}

// --- Practice Generator ---

export type Difficulty = "easy" | "medium" | "hard";

export interface PracticeRequest {
  language: Language;
  topic: string;
  difficulty: Difficulty;
  count: number;
}

export interface PracticeQuestion {
  title: string;
  problem_statement: string;
  example_input: string;
  example_output: string;
  constraints: string[];
  hints: string[];
  solution: string;
}

export interface PracticeResponse {
  id: string;
  language: Language;
  topic: string;
  difficulty: Difficulty;
  questions: PracticeQuestion[];
}

// --- Chat history ---

export interface ChatSessionSummary {
  id: string;
  title: string;
  skill_level: string;
  message_count: number;
  updated_at: string;
}

export interface ChatMessageOut {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatSessionDetail {
  id: string;
  title: string;
  skill_level: string;
  messages: ChatMessageOut[];
}
