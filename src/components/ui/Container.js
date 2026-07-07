import styles from "./Container.module.css";

// Primitivo de layout: centraliza o conteúdo com largura máxima e padding
// lateral consistentes. Reutilizado pela home, página de produto, header, etc.
export default function Container({
  as: Component = "div",
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={[styles.container, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </Component>
  );
}
