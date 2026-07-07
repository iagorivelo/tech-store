import Container from "@/components/ui/Container";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import styles from "./loading.module.css";

// Fallback de carregamento (Suspense/streaming) da home.
export default function Loading() {
  return (
    <Container className={styles.page}>
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    </Container>
  );
}
