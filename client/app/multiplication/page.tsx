import { OperationGame } from "@/components/operation-game";
import { SiteFrame } from "@/components/site-frame";

export default function MultiplicationPage() {
  return (
    <SiteFrame>
      <OperationGame
        operation="multiply"
        title="Гра на множення"
        description="Практика таблиці множення у веселому форматі."
      />
    </SiteFrame>
  );
}
