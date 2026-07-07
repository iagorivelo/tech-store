"use client";

import styles from "./QuantitySelector.module.css";

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  size = "md",
}) {
  function handleDecrement() {
    if (value > min) onChange(value - 1);
  }

  function handleIncrement() {
    onChange(value + 1);
  }

  return (
    <div className={`${styles.selector} ${styles[size]}`}>
      <button
        className={styles.btn}
        onClick={handleDecrement}
        aria-label="Diminuir quantidade"
        disabled={value <= min}
      >
        −
      </button>
      <span className={styles.value}>{value}</span>
      <button
        className={styles.btn}
        onClick={handleIncrement}
        aria-label="Aumentar quantidade"
      >
        +
      </button>
    </div>
  );
}
