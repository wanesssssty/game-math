import { OperationGame } from "@/components/operation-game";
import { SiteFrame } from "@/components/site-frame";

export default function MultiplicationPage() {
  return (
    <SiteFrame>
      <OperationGame
        operation="multiply"
        title="Гра на множення"
        description="Вчи таблицю множення — заробляй цукерки за кожну правильну відповідь!"
      />
    </SiteFrame>
  );
}
