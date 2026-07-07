import styles from "./StatusMessage.module.css";

// Estado de página centralizado, reutilizado por 404, erro e telas vazias.
export default function StatusMessage({ code, title, description, children }) {
  return (
    <div className={styles.wrapper}>
      {code && <span className={styles.code}>{code}</span>}
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
