import { getProducts } from "@/lib/products";

const BASE_URL = "https://techstore.example.com";

export default async function sitemap() {
  const products = await getProducts();

  const productRoutes = products.map((product) => ({
    url: `${BASE_URL}/produto/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    ...productRoutes,
  ];
}
