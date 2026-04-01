import { ApiTrainingSession } from "@/components/api-training-session";
import type { ClientOperation } from "@/lib/game-api";

export function OperationGame({
  title,
  description,
  operation,
}: {
  title: string;
  description: string;
  operation: ClientOperation;
}) {
  return <ApiTrainingSession description={description} mode={{ kind: "single", operation }} title={title} />;
}
