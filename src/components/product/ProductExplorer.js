"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useId,
} from "react";
import { SearchIcon } from "@/components/ui/icons";
import ProductSkeleton from "./ProductSkeleton";
import { loadProducts } from "@/app/actions";
import { PAGE_SIZE } from "@/lib/pagination";
import styles from "./ProductExplorer.module.css";

// Ilha cliente: busca + filtro + carregamento incremental (infinite scroll).
// Os cards são Server Components: a primeira página chega já renderizada via
// props (ótimo para LCP/SEO) e as páginas seguintes chegam pela Server Action
// `loadProducts`, também renderizadas no servidor. A ilha só orquestra estado,
// observa o "sentinela" no fim da lista e cuida dos estados de carregamento.
export default function ProductExplorer({
  initialItems,
  initialTotal,
  initialHasMore,
  categories,
}) {
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  // "idle" | "loading" (append no fim) | "filtering" (troca a lista inteira)
  const [status, setStatus] = useState("idle");

  const searchId = useId();
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);
  // Identifica o filtro vigente para descartar respostas obsoletas (race).
  const filterKeyRef = useRef("Todos::");
  const isFirstRender = useRef(true);

  // Debounce da busca para não disparar uma Server Action a cada tecla.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(id);
  }, [query]);

  // Troca de filtro/busca: reinicia a lista a partir da primeira página.
  // Pula a primeira execução, pois a página inicial já veio via props.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const key = `${activeCategory}::${debouncedQuery}`;
    filterKeyRef.current = key;
    loadingRef.current = true;
    setStatus("filtering");

    let cancelled = false;
    (async () => {
      const res = await loadProducts({
        offset: 0,
        limit: PAGE_SIZE,
        category: activeCategory,
        query: debouncedQuery,
      });
      if (cancelled || filterKeyRef.current !== key) return;
      setItems(res.items);
      setTotal(res.total);
      setHasMore(res.hasMore);
      setStatus("idle");
      loadingRef.current = false;
    })();

    return () => {
      cancelled = true;
    };
  }, [activeCategory, debouncedQuery]);

  // Carrega a próxima página e anexa ao fim (chamado pelo IntersectionObserver).
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    const key = filterKeyRef.current;
    loadingRef.current = true;
    setStatus("loading");

    const res = await loadProducts({
      offset: items.length,
      limit: PAGE_SIZE,
      category: activeCategory,
      query: debouncedQuery,
    });

    if (filterKeyRef.current === key) {
      setItems((prev) => [...prev, ...res.items]);
      setTotal(res.total);
      setHasMore(res.hasMore);
      setStatus("idle");
      loadingRef.current = false;
    }
  }, [hasMore, items.length, activeCategory, debouncedQuery]);

  // Observa o sentinela: dispara o carregamento ~500px antes do fim para que os
  // novos produtos já estejam prontos quando o usuário chegar lá (sem "pulo").
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "500px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const isFiltering = status === "filtering";
  const isEmpty = !isFiltering && items.length === 0;

  return (
    <>
      <section className={styles.filters}>
        <div className={styles.searchWrapper}>
          <SearchIcon size={18} className={styles.searchIcon} />
          <input
            id={searchId}
            type="search"
            className={styles.searchInput}
            placeholder="Buscar produtos..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Buscar produtos"
          />
        </div>

        <div
          className={styles.categoryTabs}
          role="tablist"
          aria-label="Categorias"
        >
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.categoryTab} ${
                  isActive ? styles.categoryTabActive : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.productsSection} aria-busy={status !== "idle"}>
        {isEmpty ? (
          <div className={styles.noResults}>
            <p>Nenhum produto encontrado.</p>
            <span className={styles.noResultsHint}>
              Tente outra busca ou categoria.
            </span>
          </div>
        ) : (
          <>
            {!isFiltering && (
              <p className={styles.resultCount} aria-live="polite">
                Mostrando {items.length} de {total} produtos
              </p>
            )}

            {isFiltering ? (
              <div className={styles.productsGrid}>
                {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <ProductSkeleton key={`filter-skeleton-${index}`} />
                ))}
              </div>
            ) : (
              <div className={styles.productsGrid}>
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className={styles.cardReveal}
                    style={{
                      animationDelay: `${(index % PAGE_SIZE) * 0.05}s`,
                    }}
                  >
                    {item.card}
                  </div>
                ))}

                {status === "loading" &&
                  Array.from({ length: PAGE_SIZE }).map((_, index) => (
                    <ProductSkeleton key={`more-skeleton-${index}`} />
                  ))}
              </div>
            )}
          </>
        )}

        {/* Sentinela invisível: quando entra na viewport, carrega mais. */}
        {hasMore && !isFiltering && (
          <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
        )}

        {!hasMore && !isFiltering && items.length > 0 && (
          <p className={styles.endMessage}>
            Você viu todos os {total} produtos ✨
          </p>
        )}
      </section>
    </>
  );
}
