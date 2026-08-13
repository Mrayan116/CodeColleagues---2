import type {
  ChatSessionDetail,
  ChatSessionSummary,
  DebugRequest,
  DebugResponse,
  ExplainRequest,
  ExplainResponse,
  HintRequest,
  HintResponse,
  PracticeRequest,
  PracticeResponse,
  ReviewRequest,
  ReviewResponse,
  TutorRequest,
  TutorResponse,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<TResponse>(path: string, options: RequestInit): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new ApiError(
      "Couldn't reach the Code Colleague backend. Is it running on " + API_BASE_URL + "?",
      0
    );
  }

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = body.detail ?? detail;
    } catch {
      // response body wasn't JSON — fall back to statusText
    }
    throw new ApiError(detail, response.status);
  }

  return response.json() as Promise<TResponse>;
}

export const api = {
  askTutor: (payload: TutorRequest) =>
    request<TutorResponse>("/tutor", { method: "POST", body: JSON.stringify(payload) }),

  debugCode: (payload: DebugRequest) =>
    request<DebugResponse>("/debugger", { method: "POST", body: JSON.stringify(payload) }),

  reviewCode: (payload: ReviewRequest) =>
    request<ReviewResponse>("/review", { method: "POST", body: JSON.stringify(payload) }),

  getHints: (payload: HintRequest) =>
    request<HintResponse>("/hint", { method: "POST", body: JSON.stringify(payload) }),

  explainCode: (payload: ExplainRequest) =>
    request<ExplainResponse>("/explain", { method: "POST", body: JSON.stringify(payload) }),

  generatePractice: (payload: PracticeRequest) =>
    request<PracticeResponse>("/practice", { method: "POST", body: JSON.stringify(payload) }),

  listChatSessions: () => request<ChatSessionSummary[]>("/tutor/sessions", { method: "GET" }),

  getChatSession: (sessionId: string) =>
    request<ChatSessionDetail>(`/tutor/sessions/${sessionId}`, { method: "GET" }),
};
