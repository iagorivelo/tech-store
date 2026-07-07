import styles from "./ProductSkeleton.module.css";

export default function ProductSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.imagePlaceholder}>
        <div className={styles.shimmer} />
      </div>
      <div className={styles.content}>
        <div className={styles.line} style={{ width: "40%" }} />
        <div className={styles.line} style={{ width: "75%" }} />
        <div className={styles.line} style={{ width: "90%" }} />
        <div className={styles.footer}>
          <div className={styles.line} style={{ width: "50%" }} />
          <div className={styles.circle} />
        </div>
      </div>
    </div>
  );
}
