import Image from "next/image";
import Link from "next/link";
import StarRating from "@/components/ui/StarRating";
import AddToCartButton from "./AddToCartButton";
import { formatPrice, formatInstallments } from "@/utils/format";
import styles from "./ProductCard.module.css";

// Server Component: todo o markup do card é renderizado no servidor. Apenas o
// botão de adicionar (AddToCartButton) é uma ilha cliente.
export default function ProductCard({ product, priority = false }) {
  return (
    <Link
      href={`/produto/${product.slug}`}
      className={styles.card}
      id={`product-card-${product.id}`}
    >
      <div className={styles.imageWrapper}>
        <span className={styles.categoryBadge}>{product.category}</span>
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          className={styles.image}
          sizes="(max-width: 680px) 100vw, (max-width: 1280px) 33vw, 400px"
          priority={priority}
        />
        <div className={styles.imageOverlay} />
      </div>

      <div className={styles.content}>
        <StarRating rating={product.rating} reviews={product.reviews} size="sm" />

        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>

        <div className={styles.footer}>
          <div className={styles.priceWrapper}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
            <span className={styles.installments}>
              {formatInstallments(product.price)}
            </span>
          </div>

          <AddToCartButton product={product} />
        </div>
      </div>
    </Link>
  );
}
