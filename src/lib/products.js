import { cacheLife, cacheTag } from "next/cache";
import { products } from "@/data/products";
import { PAGE_SIZE } from "@/lib/pagination";

// Camada de acesso aos dados. Hoje a fonte é um array local, mas estes
// acessores são cacheados com `use cache` para modelar acesso real a um
// banco/API e habilitar revalidação por tag no futuro. Há duas granularidades:
// a tag "products" invalida todo o catálogo, e a tag `product-${slug}` permite
// revalidar um único produto (ex.: updateTag(`product-${slug}`) ao editá-lo).

export async function getProducts() {
  "use cache";
  cacheLife("days");
  cacheTag("products");
  return products;
}

// Página do catálogo com filtro por categoria e busca aplicados no servidor.
// Assim a busca/filtro cobrem TODO o catálogo — não apenas o que já foi
// carregado no cliente — o que é o comportamento correto para paginação real.
export async function getProductsPage({
  offset = 0,
  limit = PAGE_SIZE,
  category = "Todos",
  query = "",
} = {}) {
  "use cache";
  cacheLife("days");
  cacheTag("products");

  const q = query.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesCategory =
      category === "Todos" || product.category === category;
    const matchesQuery =
      q === "" ||
      product.name.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const page = filtered.slice(offset, offset + limit);
  return {
    products: page,
    total: filtered.length,
    hasMore: offset + limit < filtered.length,
  };
}

export async function getProductBySlug(slug) {
  "use cache";
  cacheLife("days");
  cacheTag("products", `product-${slug}`);
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getCategories() {
  "use cache";
  cacheLife("days");
  cacheTag("products");
  return ["Todos", ...new Set(products.map((p) => p.category))];
}

export async function getRelatedProducts(slug, limit = 2) {
  "use cache";
  cacheLife("days");
  cacheTag("products", `product-${slug}`);
  const product = products.find((p) => p.slug === slug);
  if (!product) return [];
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}
