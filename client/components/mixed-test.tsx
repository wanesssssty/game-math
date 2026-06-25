import { ApiTrainingSession } from "@/components/api-training-session";

export function MixedTest() {
  return (
    <ApiTrainingSession
      description="Усі чотири дії в одній веселій місії — заробляй цукерки за правильні відповіді!"
      mode={{ kind: "mixed" }}
      showErrorLog
      title="Змішаний тест"
    />
  );
}
