import { OperationGame } from "@/components/operation-game";
import { SiteFrame } from "@/components/site-frame";

export default function DivisionPage() {
  return (
    <SiteFrame>
      <OperationGame
        operation="divide"
        title="Гра на ділення"
        description="Діли числа без залишку — і збирай цукерки за правильні відповіді!"
      />
    </SiteFrame>
  );
}
