import { apiRequest } from "@/lib/api/client";

export type ChildProgressSession = {
  childName: string;
  operation: "add" | "subtract" | "multiply" | "divide";
  totalQuestions: number;
  answered: number;
  correct: number;
  completedAt: string;
};

const LOCAL_KEY = "math-paws-progress-sessions";

export function getLocalProgressSessions() {
  if (typeof window === "undefined") return [] as ChildProgressSession[];

  const raw = window.localStorage.getItem(LOCAL_KEY);

  try {
    return raw ? (JSON.parse(raw) as ChildProgressSession[]) : [];
  } catch {
    window.localStorage.removeItem(LOCAL_KEY);
    return [] as ChildProgressSession[];
  }
}

function saveToLocalStorage(session: ChildProgressSession) {
  if (typeof window === "undefined") return;
  const list = getLocalProgressSessions();
  list.unshift(session);
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 100)));
}

export async function saveChildProgress(session: ChildProgressSession) {
  try {
    await apiRequest<ChildProgressSession>("/api/progress", {
      method: "POST",
      body: JSON.stringify(session),
    });
  } catch {
    // Keep a browser-local history if the progress API is unavailable.
    saveToLocalStorage(session);
  }
}
