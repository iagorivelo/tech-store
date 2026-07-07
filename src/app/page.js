import Container from "@/components/ui/Container";
import ProductCard from "@/components/product/ProductCard";
import ProductExplorer from "@/components/product/ProductExplorer";
import { getProductsPage, getCategories } from "@/lib/products";
import styles from "./page.module.css";

// Server Component. Apenas a PRIMEIRA página do catálogo é renderizada no shell
// estático (ótimo para LCP/SEO); as páginas seguintes são carregadas sob
// demanda pela ilha cliente via Server Action conforme o usuário rola a tela.
export default async function HomePage() {
  const [firstPage, categories] = await Promise.all([
    getProductsPage({ offset: 0 }),
    getCategories(),
  ]);

  const initialItems = firstPage.products.map((product, index) => ({
    id: product.id,
    card: <ProductCard product={product} priority={index < 3} />,
  }));

  return (
    <Container className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <span className={styles.heroBadge}>🔥 Novidades 2026</span>
        <h1 className={styles.heroTitle}>
          Tecnologia que <span className={styles.heroGradient}>inspira</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Descubra nossa seleção premium de produtos que transformam sua
          experiência digital.
        </p>
      </section>

      <ProductExplorer
        initialItems={initialItems}
        initialTotal={firstPage.total}
        initialHasMore={firstPage.hasMore}
        categories={categories}
      />
    </Container>
  );
}
