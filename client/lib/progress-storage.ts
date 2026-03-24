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

function saveToLocalStorage(session: ChildProgressSession) {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(LOCAL_KEY);
  const list = raw ? (JSON.parse(raw) as ChildProgressSession[]) : [];
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
    // Fallback for now: until dedicated backend endpoint exists.
    saveToLocalStorage(session);
  }
}
