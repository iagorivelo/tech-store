import Link from "next/link";
import Button from "@/components/ui/Button";
import StatusMessage from "@/components/ui/StatusMessage";
import { ArrowLeftIcon } from "@/components/ui/icons";

export const metadata = {
  title: "Produto não encontrado",
};

export default function ProductNotFound() {
  return (
    <StatusMessage
      title="Produto não encontrado"
      description="Este produto não está mais disponível ou o endereço está incorreto."
    >
      <Button as={Link} href="/" variant="primary">
        <ArrowLeftIcon size={16} />
        Voltar para produtos
      </Button>
    </StatusMessage>
  );
}
