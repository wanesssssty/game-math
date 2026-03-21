import { OperationGame } from "@/components/operation-game";
import { SiteFrame } from "@/components/site-frame";

export default function DivisionPage() {
  return (
    <SiteFrame>
      <OperationGame
        operation="divide"
        title="Гра на ділення"
        description="Діли числа правильно та перевіряй свої навички."
      />
    </SiteFrame>
  );
}
