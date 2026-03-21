import { OperationGame } from "@/components/operation-game";
import { SiteFrame } from "@/components/site-frame";

export default function AdditionPage() {
  return (
    <SiteFrame>
      <OperationGame
        operation="add"
        title="Гра на додавання"
        description="Складай числа і отримуй миттєвий фідбек."
      />
    </SiteFrame>
  );
}
