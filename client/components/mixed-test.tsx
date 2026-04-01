import { ApiTrainingSession } from "@/components/api-training-session";

export function MixedTest() {
  return (
    <ApiTrainingSession
      description="Змішана серія на додавання, віднімання, множення і ділення з реальним API-флоу."
      mode={{ kind: "mixed" }}
      showErrorLog
      title="Загальний тест"
    />
  );
}
