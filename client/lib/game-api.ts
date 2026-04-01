"use client";

import { apiRequest } from "@/lib/api/client";

export type ClientOperation = "add" | "subtract" | "multiply" | "divide";
export type ApiOperation = "ADD" | "SUB" | "MUL" | "DIV";

export type ProblemData = {
  problemToken: string;
  number1: number;
  number2: number;
  operationType: ApiOperation;
  level: number;
  display: string;
};

export type AnswerData = {
  correct: boolean;
  message: string;
  candyEarned?: number;
  candyBalance?: number;
};

export type HintData = {
  hint: string;
};

const clientToApiMap: Record<ClientOperation, ApiOperation> = {
  add: "ADD",
  subtract: "SUB",
  multiply: "MUL",
  divide: "DIV",
};

const apiToClientMap: Record<ApiOperation, ClientOperation> = {
  ADD: "add",
  SUB: "subtract",
  MUL: "multiply",
  DIV: "divide",
};

const operationLabels: Record<ClientOperation, string> = {
  add: "Додавання",
  subtract: "Віднімання",
  multiply: "Множення",
  divide: "Ділення",
};

export function toApiOperation(operation: ClientOperation): ApiOperation {
  return clientToApiMap[operation];
}

export function toClientOperation(operation: ApiOperation): ClientOperation {
  return apiToClientMap[operation];
}

export function getOperationLabel(operation: ClientOperation) {
  return operationLabels[operation];
}

export async function fetchProblem(operationType: ApiOperation, level: number) {
  const query = new URLSearchParams({
    operationType,
    level: String(level),
  });

  return apiRequest<ProblemData>(`/api/problem?${query.toString()}`);
}

export async function submitProblemAnswer(problemToken: string, answer: number) {
  return apiRequest<AnswerData>("/api/problem/answer", {
    method: "POST",
    body: JSON.stringify({ problemToken, answer }),
  });
}

export async function fetchHint(problemToken: string) {
  const query = new URLSearchParams({ problemToken });
  return apiRequest<HintData>(`/api/hint?${query.toString()}`);
}
