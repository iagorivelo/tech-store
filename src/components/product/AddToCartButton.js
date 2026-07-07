"use client";

import { useCart } from "@/context/CartContext";
import { PlusIcon } from "@/components/ui/icons";
import styles from "./AddToCartButton.module.css";

// Ilha cliente: o único trecho interativo dentro do ProductCard (Server).
// preventDefault/stopPropagation evitam acionar o <Link> que envolve o card.
export default function AddToCartButton({ product }) {
  const { addToCart } = useCart();

  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    addToCart(product, 1);
  }

  return (
    <button
      id={`add-to-cart-${product.id}`}
      className={styles.addButton}
      onClick={handleClick}
      aria-label={`Adicionar ${product.name} ao carrinho`}
    >
      <PlusIcon size={18} strokeWidth={2.5} />
    </button>
  );
}
