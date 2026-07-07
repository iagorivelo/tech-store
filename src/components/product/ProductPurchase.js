"use client";

import { useState } from "react";
import QuantitySelector from "@/components/ui/QuantitySelector";
import Button from "@/components/ui/Button";
import { CartIcon } from "@/components/ui/icons";
import { useCart } from "@/context/CartContext";
import styles from "./ProductPurchase.module.css";

// Ilha cliente: seletor de quantidade + adicionar ao carrinho na página de
// produto. O restante da página é renderizado no servidor.
export default function ProductPurchase({ product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  return (
    <div className={styles.actions}>
      <QuantitySelector
        value={quantity}
        onChange={setQuantity}
        min={1}
        size="md"
      />
      <Button
        id="product-add-to-cart"
        variant="primary"
        size="lg"
        fullWidth
        className={styles.addButton}
        onClick={() => addToCart(product, quantity)}
      >
        <CartIcon size={20} />
        Adicionar ao Carrinho
      </Button>
    </div>
  );
}
