"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import StatusMessage from "@/components/ui/StatusMessage";

// Error boundaries em Next.js precisam ser Client Components.
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusMessage
      title="Algo deu errado"
      description="Não foi possível carregar esta página. Tente novamente."
    >
      <Button variant="primary" onClick={reset}>
        Tentar novamente
      </Button>
    </StatusMessage>
  );
}
