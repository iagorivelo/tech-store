"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { CartIcon } from "@/components/ui/icons";
import styles from "./Header.module.css";

export default function Header() {
  const { toggleCart, totalItems } = useCart();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>TechStore</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            Produtos
          </Link>
        </nav>

        <button
          id="cart-toggle-btn"
          className={styles.cartButton}
          onClick={toggleCart}
          aria-label="Abrir carrinho"
        >
          <CartIcon className={styles.cartIcon} />
          {totalItems > 0 && (
            <span className={styles.cartBadge}>{totalItems}</span>
          )}
        </button>
      </div>
    </header>
  );
}
