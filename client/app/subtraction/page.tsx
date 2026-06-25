import { OperationGame } from "@/components/operation-game";
import { SiteFrame } from "@/components/site-frame";

export default function SubtractionPage() {
  return (
    <SiteFrame>
      <OperationGame
        operation="subtract"
        title="Гра на віднімання"
        description="Віднімай числа — заробляй цукерки за правильні відповіді!"
      />
    </SiteFrame>
  );
}
