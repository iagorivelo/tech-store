"use server";

import ProductCard from "@/components/product/ProductCard";
import { getProductsPage } from "@/lib/products";
import { PAGE_SIZE } from "@/lib/pagination";

// Server Action de paginação. É chamada pela ilha cliente (infinite scroll e
// mudança de filtro/busca) e devolve os próximos ProductCards JÁ renderizados
// como Server Components — o JS do card nunca vai para o bundle do cliente.
export async function loadProducts({
  offset = 0,
  limit = PAGE_SIZE,
  category = "Todos",
  query = "",
} = {}) {
  const { products, total, hasMore } = await getProductsPage({
    offset,
    limit,
    category,
    query,
  });

  // Latência simulada: com dados locais a resposta seria instantânea e o
  // skeleton nem apareceria. Este atraso modela um banco/API real e deixa a
  // transição de carregamento visível e suave. Remova em produção real.
  await new Promise((resolve) => setTimeout(resolve, 500));

  const items = products.map((product) => ({
    id: product.id,
    card: <ProductCard product={product} />,
  }));

  return { items, total, hasMore };
}
