"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";
import QuantitySelector from "@/components/ui/QuantitySelector";
import Button from "@/components/ui/Button";
import { CartIcon, CloseIcon, TrashIcon } from "@/components/ui/icons";
import { formatPrice } from "@/utils/format";
import styles from "./CartDrawer.module.css";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalPrice,
    totalItems,
  } = useCart();

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ""}`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        id="cart-drawer"
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}
        aria-label="Carrinho de compras"
        aria-hidden={!isOpen}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>
            <CartIcon size={20} />
            Carrinho
            {totalItems > 0 && (
              <span className={styles.itemCount}>{totalItems} itens</span>
            )}
          </h2>
          <Button
            id="close-cart-btn"
            variant="icon"
            size="sm"
            onClick={closeCart}
            aria-label="Fechar carrinho"
          >
            <CloseIcon size={20} />
          </Button>
        </div>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🛒</div>
              <p className={styles.emptyTitle}>Seu carrinho está vazio</p>
              <p className={styles.emptySubtitle}>
                Adicione produtos para começar
              </p>
            </div>
          ) : (
            <ul className={styles.itemList}>
              {items.map((item) => (
                <li key={item.id} className={styles.item}>
                  <div className={styles.itemImage}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={72}
                      height={72}
                    />
                  </div>
                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <span className={styles.itemPrice}>
                      {formatPrice(item.price)}
                    </span>
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(qty) => updateQuantity(item.id, qty)}
                      min={0}
                      size="sm"
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remover ${item.name} do carrinho`}
                  >
                    <TrashIcon size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalValue}>
                {formatPrice(totalPrice)}
              </span>
            </div>
            <Button id="checkout-btn" variant="primary" size="lg" fullWidth>
              Finalizar Compra
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
