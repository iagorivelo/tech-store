import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import StarRating from "@/components/ui/StarRating";
import ProductPurchase from "@/components/product/ProductPurchase";
import { ArrowLeftIcon, CheckIcon } from "@/components/ui/icons";
import {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products";
import { formatPrice, formatInstallments } from "@/utils/format";
import styles from "./page.module.css";

// generateStaticParams gera todas as páginas no build → 100% estáticas e
// pré-carregadas pelo <Link>. (unstable_instant é experimental e exige
// `samples` para rotas com param dinâmico; reativar quando estabilizar.)
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.description,
      images: [
        { url: product.image, width: 600, height: 600, alt: product.name },
      ],
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(slug);

  return (
    <Container as="article" className={styles.page}>
      <Link href="/" className={styles.backLink}>
        <ArrowLeftIcon size={16} />
        Voltar para produtos
      </Link>

      <div className={styles.productGrid}>
        <div className={styles.imageSection}>
          <div className={styles.imageWrapper}>
            <Image
              src={product.image}
              alt={product.name}
              width={600}
              height={600}
              className={styles.productImage}
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
          </div>
        </div>

        <div className={styles.infoSection}>
          <span className={styles.category}>{product.category}</span>
          <h1 className={styles.productName}>{product.name}</h1>

          <StarRating
            rating={product.rating}
            reviews={product.reviews}
            size="lg"
          />

          <p className={styles.description}>{product.description}</p>

          <div className={styles.priceSection}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
            <span className={styles.installments}>
              {formatInstallments(product.price)} sem juros
            </span>
          </div>

          <div className={styles.features}>
            <h2 className={styles.featuresTitle}>Destaques</h2>
            <ul className={styles.featureList}>
              {product.features.map((feature) => (
                <li key={feature} className={styles.featureItem}>
                  <CheckIcon
                    size={16}
                    strokeWidth={2.5}
                    className={styles.featureIcon}
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <ProductPurchase product={product} />
        </div>
      </div>

      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>Produtos Relacionados</h2>
          <div className={styles.relatedGrid}>
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/produto/${item.slug}`}
                className={styles.relatedCard}
              >
                <div className={styles.relatedImage}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={160}
                    height={160}
                  />
                </div>
                <div className={styles.relatedInfo}>
                  <h3>{item.name}</h3>
                  <span>{formatPrice(item.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
