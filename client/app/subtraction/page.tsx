import { OperationGame } from "@/components/operation-game";
import { SiteFrame } from "@/components/site-frame";

export default function SubtractionPage() {
  return (
    <SiteFrame>
      <OperationGame
        operation="subtract"
        title="Гра на віднімання"
        description="Розв'язуй приклади на віднімання крок за кроком."
      />
    </SiteFrame>
  );
}
