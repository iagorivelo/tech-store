import styles from "./Button.module.css";

// Botão reutilizável. Server-safe (sem hooks) — pode ser usado tanto em
// Server quanto em Client Components, e renderizado como qualquer elemento
// (`as={Link}`, `as="a"`, etc.).
//
//   <Button variant="primary" size="lg" onClick={...}>Comprar</Button>
//   <Button as={Link} href="/" variant="ghost">Voltar</Button>
//   <Button variant="icon" aria-label="Fechar"><CloseIcon size={20} /></Button>
export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type,
  children,
  ...props
}) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Evita submit acidental quando renderizado como <button> sem type explícito.
  const resolvedType =
    Component === "button" ? (type ?? "button") : type;

  return (
    <Component className={classes} type={resolvedType} {...props}>
      {children}
    </Component>
  );
}
