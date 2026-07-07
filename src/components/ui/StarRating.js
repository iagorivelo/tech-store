import styles from "./StarRating.module.css";

export default function StarRating({ rating, reviews, size = "sm" }) {
  return (
    <div className={`${styles.rating} ${styles[size]}`}>
      <span className={styles.stars}>
        {"★".repeat(Math.floor(rating))}
        {rating % 1 >= 0.5 ? "★" : ""}
      </span>
      <span className={styles.value}>{rating}</span>
      {reviews !== undefined && (
        <span className={styles.reviews}>
          ({reviews}{size === "lg" ? " avaliações" : ""})
        </span>
      )}
    </div>
  );
}
