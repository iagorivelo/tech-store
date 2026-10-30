import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p>TechStore · Loja de demonstração</p>
        <p>
          Site por{" "}
          <a
            href="https://www.iagorivelo.com.br"
            target="_blank"
            rel="noopener"
            className={styles.link}
          >
            Iago Rivelo
            <span className={styles.srOnly}> (abre em nova aba)</span>
          </a>
        </p>
      </div>
    </footer>
  );
}
