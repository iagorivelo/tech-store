import Link from "next/link";
import Button from "@/components/ui/Button";
import StatusMessage from "@/components/ui/StatusMessage";

export const metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <StatusMessage
      code="404"
      title="Página não encontrada"
      description="O conteúdo que você procura não existe ou foi movido."
    >
      <Button as={Link} href="/" variant="primary">
        Voltar para a loja
      </Button>
    </StatusMessage>
  );
}
