const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatPrice(value) {
  return priceFormatter.format(value);
}

export function formatInstallments(value, installments = 12) {
  return `ou ${installments}x de ${formatPrice(value / installments)}`;
}
