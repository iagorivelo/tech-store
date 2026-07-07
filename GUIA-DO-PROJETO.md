# 📖 Guia do Projeto TechStore — passo a passo para iniciantes

Este documento explica **como o projeto funciona por dentro**: o que cada arquivo faz, por que cada estrutura foi escolhida e o que acontece nos bastidores quando alguém usa a loja. A ideia é que, ao final, você consiga ler qualquer arquivo do projeto e entender o papel dele.

> **Pré-requisito:** noções básicas de JavaScript e HTML. Conceitos de React e Next.js são explicados ao longo do texto.

---

## Índice

1. [O que é este projeto](#1-o-que-é-este-projeto)
2. [A stack: o que foi usado e por quê](#2-a-stack-o-que-foi-usado-e-por-quê)
3. [O mapa de pastas](#3-o-mapa-de-pastas)
4. [Conceito central: Server Components vs Client Components](#4-conceito-central-server-components-vs-client-components)
5. [A camada de dados: `data/` e `lib/`](#5-a-camada-de-dados-data-e-lib)
6. [O cache: `use cache`, `cacheLife` e `cacheTag`](#6-o-cache-use-cache-cachelife-e-cachetag)
7. [As rotas: arquivos especiais do App Router](#7-as-rotas-arquivos-especiais-do-app-router)
8. [A home (`page.js`) e o padrão "ilha cliente"](#8-a-home-pagejs-e-o-padrão-ilha-cliente)
9. [A página de produto: rota dinâmica `[slug]`](#9-a-página-de-produto-rota-dinâmica-slug)
10. [O carrinho: Context API + localStorage](#10-o-carrinho-context-api--localstorage)
11. [Os componentes reutilizáveis (`components/ui`)](#11-os-componentes-reutilizáveis-componentsui)
12. [O estilo: CSS Modules + design tokens](#12-o-estilo-css-modules--design-tokens)
13. [Performance e SEO](#13-performance-e-seo)
14. [Acessibilidade](#14-acessibilidade)
15. [Fluxos completos, do clique ao resultado](#15-fluxos-completos-do-clique-ao-resultado)
16. [Como evoluir o projeto](#16-como-evoluir-o-projeto)
17. [Glossário](#17-glossário)

---

## 1. O que é este projeto

A **TechStore** é uma loja virtual de produtos de tecnologia com:

- **Catálogo** na home, com busca em tempo real e filtro por categoria;
- **Página de detalhe** para cada produto (`/produto/headphone-pro-max`, etc.);
- **Carrinho lateral** (drawer) que persiste entre visitas usando `localStorage`.

Não há backend real: os produtos vivem em um array JavaScript. Mas a arquitetura foi montada **como se houvesse um banco de dados**, de propósito — assim o projeto ensina os padrões que você usaria num sistema de verdade, e trocar o array por uma API exige mudar pouquíssimo código (veja a [seção 16](#16-como-evoluir-o-projeto)).

---

## 2. A stack: o que foi usado e por quê

| Tecnologia | O que faz | Por que foi escolhida |
|---|---|---|
| **Next.js 16** | Framework React: roteamento por arquivos, renderização no servidor, otimização de imagens/fontes | Permite gerar páginas **estáticas e rápidas** sem abrir mão de interatividade. A versão 16 traz o **Cache Components** (`use cache`), usado na camada de dados |
| **React 19** | Biblioteca de componentes de interface | Base do Next.js; traz os Server Components usados em todo o projeto |
| **CSS Modules** | Um arquivo `.module.css` por componente, com classes de escopo local | Zero dependências extras, zero conflito de nomes de classe, e o estilo fica sempre ao lado do componente que ele estiliza |
| **Context API** | Estado global do carrinho | Nativa do React. Para um único estado global pequeno (o carrinho), instalar Redux/Zustand seria complexidade desnecessária |
| **`localStorage`** | Persistência do carrinho no navegador | O carrinho sobrevive a refresh e a fechar a aba, sem precisar de backend nem login |

**Decisão de fundo:** o projeto evita bibliotecas externas sempre que o próprio React/Next.js resolve. Repare no `package.json`: as únicas dependências são `next`, `react` e `react-dom`. Isso torna o projeto mais leve, mais fácil de manter e melhor para aprender — tudo que você vê é React "puro" ou recurso do framework.

---

## 3. O mapa de pastas

```
src/
├── app/                    # ROTAS. Cada pasta = uma URL (App Router)
│   ├── layout.js           # Casca comum a todas as páginas (header, providers)
│   ├── page.js             # A home (rota "/")
│   ├── loading.js          # Tela de carregamento da home (skeletons)
│   ├── error.js            # Tela de erro inesperado
│   ├── not-found.js        # Tela 404 global
│   ├── sitemap.js          # Gera /sitemap.xml para buscadores
│   ├── globals.css         # Reset CSS + variáveis de design (cores, raios)
│   └── produto/[slug]/     # Rota dinâmica: /produto/qualquer-coisa
│       ├── page.js         # Página de detalhe do produto
│       └── not-found.js    # 404 específico ("produto não encontrado")
│
├── components/             # COMPONENTES visuais, organizados por domínio
│   ├── ui/                 # Genéricos: Button, Container, StarRating, ícones…
│   ├── product/            # Do domínio "produto": ProductCard, ProductExplorer…
│   ├── cart/               # Do domínio "carrinho": CartDrawer
│   └── layout/             # Estruturais: Header
│
├── context/                # ESTADO GLOBAL
│   └── CartContext.js      # Toda a lógica do carrinho
│
├── data/                   # DADOS brutos
│   └── products.js         # O "banco de dados" (array de produtos)
│
├── lib/                    # ACESSO A DADOS (a "API interna")
│   └── products.js         # getProducts(), getProductBySlug()… com cache
│
└── utils/                  # FUNÇÕES PURAS auxiliares
    └── format.js           # formatPrice(), formatInstallments()
```

### Por que separar assim?

O princípio é **separação por responsabilidade**. Cada pasta responde uma pergunta diferente:

- `data/` → *"quais são os dados?"* — só o array, sem lógica nenhuma.
- `lib/` → *"como eu obtenho os dados?"* — funções de acesso, com cache. As páginas **nunca** importam de `data/` diretamente; sempre passam por `lib/`. Assim, quando os dados migrarem para um banco, só `lib/` muda.
- `context/` → *"qual o estado compartilhado da aplicação?"* — o carrinho, que várias partes da tela precisam ler e alterar.
- `components/` → *"como as coisas aparecem na tela?"* — subdividido por domínio (`ui`, `product`, `cart`, `layout`) para você achar as coisas pelo assunto, não por ordem alfabética numa pasta gigante.
- `utils/` → *"funções pequenas e puras"* — recebem valor, devolvem valor, sem estado nem efeito colateral.
- `app/` → *"quais URLs existem?"* — só orquestra: busca dados via `lib/` e monta a tela com `components/`.

### O atalho `@/`

No `jsconfig.json` existe:

```json
{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }
```

Isso permite escrever `import Button from "@/components/ui/Button"` em vez de `../../../components/ui/Button`. Além de mais legível, o import não quebra quando você move um arquivo de pasta.

---

## 4. Conceito central: Server Components vs Client Components

Este é **o conceito mais importante do projeto**. No App Router do Next.js, todo componente é, por padrão, um **Server Component**:

- Ele roda **no servidor** (ou no build) e vira HTML pronto.
- O JavaScript dele **nunca é enviado ao navegador**.
- Por isso, ele **não pode** usar `useState`, `onClick`, `localStorage` — coisas que só existem no navegador.

Quando um componente precisa de interatividade, ele declara `"use client"` na primeira linha e vira um **Client Component**:

- O JavaScript dele **é enviado ao navegador** e "hidratado" (ativado) lá.
- Pode usar `useState`, `useEffect`, eventos de clique, `localStorage`.
- **Custo:** mais JS baixado = página mais lenta. Então a regra do projeto é: *o mínimo possível de componentes cliente, e os menores possíveis*.

### Quem é o quê neste projeto

| Server Components (HTML puro, zero JS no navegador) | Client Components (`"use client"`) | Por quê |
|---|---|---|
| `page.js` (home), `produto/[slug]/page.js` | — | Só montam a tela com dados; nada interativo |
| `ProductCard`, `StarRating`, `Container`, `StatusMessage`, `ProductSkeleton`, `icons.js`, `Button` | — | Apenas exibem coisas |
| — | `ProductExplorer` | Guarda o texto da busca e a categoria ativa (`useState`) |
| — | `AddToCartButton`, `ProductPurchase` | Reagem a cliques e falam com o carrinho |
| — | `Header`, `CartDrawer` | Leem o estado do carrinho (contador, itens) |
| — | `CartContext` | É o próprio estado (usa hooks e `localStorage`) |
| — | `error.js` | O Next.js **exige** que error boundaries sejam client components |

Esse padrão tem nome: **arquitetura de ilhas**. A página é um oceano de HTML estático com pequenas "ilhas" de interatividade. Veja na [seção 8](#8-a-home-pagejs-e-o-padrão-ilha-cliente) o truque que este projeto usa para levar isso ao extremo.

> **Detalhe fino:** `Button` e `Container` não têm `"use client"`, mas são usados dentro de componentes cliente. Isso funciona porque um componente **sem hooks** pode ser renderizado dos dois lados — ele "herda" o ambiente de quem o usa. O comentário no topo de `Button.js` chama isso de *server-safe*.

---

## 5. A camada de dados: `data/` e `lib/`

### `src/data/products.js` — o "banco de dados"

Um array de 6 objetos. Cada produto tem:

```js
{
  id: 1,                          // identificador único (usado como key e no carrinho)
  slug: "headphone-pro-max",      // versão do nome para URL: /produto/headphone-pro-max
  name, description, price,
  image: "/images/headphone.png", // arquivos em public/ são servidos na raiz do site
  category: "Áudio",              // usada no filtro da home
  rating: 4.8, reviews: 234,      // exibidos no StarRating
  features: [...]                 // lista de destaques na página de detalhe
}
```

**Por que `slug` além de `id`?** URLs com texto (`/produto/headphone-pro-max`) são legíveis para humanos e melhores para SEO do que `/produto/1`. O `id` continua existindo para operações internas (comparar itens no carrinho).

### `src/lib/products.js` — os acessores

Quatro funções `async`: `getProducts()`, `getProductBySlug(slug)`, `getCategories()` e `getRelatedProducts(slug)`.

**Por que `async`, se o array é local e síncrono?** Porque a **interface** (o "contrato") dessas funções já imita um acesso a banco/API, que é sempre assíncrono. Quem chama já usa `await`. No dia em que você trocar `return products` por `return db.query(...)`, **nenhuma página precisa mudar**. Isso se chama *programar para a interface, não para a implementação*.

Repare também nos detalhes defensivos:

- `getProductBySlug` devolve `null` (e não `undefined`) quando não acha — quem chama testa `if (!product)` e mostra o 404.
- `getRelatedProducts` filtra produtos da **mesma categoria**, exclui o próprio produto (`p.id !== product.id`) e limita a 2 (`slice(0, limit)`).
- `getCategories` monta `["Todos", ...new Set(...)]` — o `Set` elimina categorias duplicadas, e `"Todos"` é adicionado na frente porque a interface de filtro precisa dessa opção.

---

## 6. O cache: `use cache`, `cacheLife` e `cacheTag`

No `next.config.mjs` há uma única opção:

```js
const nextConfig = {
  cacheComponents: true,
};
```

Isso habilita o **Cache Components**, o modelo de cache do Next.js 16. Com ele, cada função da `lib/` começa assim:

```js
export async function getProducts() {
  "use cache";           // 1. cacheia o valor de retorno desta função
  cacheLife("days");     // 2. o cache vale por dias (revalida a cada 1 dia)
  cacheTag("products");  // 3. etiqueta o cache para invalidação manual futura
  return products;
}
```

Explicando cada linha:

1. **`"use cache"`** é uma diretiva (como `"use client"`): marca a função para o Next.js **guardar o resultado** e servir a versão guardada nas próximas chamadas, sem executar de novo. Os **argumentos viram a chave do cache**: `getProductBySlug("mouse-wireless-pro")` e `getProductBySlug("earbuds-pro-anc")` geram entradas separadas.

2. **`cacheLife("days")`** define a validade usando um perfil pronto (`seconds`, `minutes`, `hours`, `days`, `weeks`, `max`). O perfil `days` significa: revalidar após 1 dia, expirar após 1 semana. Para um catálogo que muda raramente, é o perfil natural.

3. **`cacheTag(...)`** dá **etiquetas** ao cache. O projeto usa duas granularidades, e o comentário no topo de `lib/products.js` explica a intenção:
   - `"products"` — etiqueta **geral**: invalidar tudo do catálogo de uma vez;
   - `` `product-${slug}` `` — etiqueta **individual**: invalidar só um produto.

   Hoje ninguém invalida nada (os dados são estáticos), mas quando houver um painel administrativo, salvar a edição de um produto chamaria `updateTag("product-headphone-pro-max")` e **só aquela página** seria regenerada. Preparar as tags agora custa uma linha; adicioná-las depois exigiria revisitar toda a camada de dados.

**Por que cachear um array local, que já é instantâneo?** Pelo mesmo motivo do `async`: a camada de dados **modela o caso real**. Com o cache configurado, o Next.js consegue **pré-renderizar** as páginas no build (elas ficam 100% estáticas) e o projeto já ensina o padrão correto para quando os dados vierem de longe.

---

## 7. As rotas: arquivos especiais do App Router

No App Router, **você não configura rotas — você cria arquivos com nomes especiais**, e a estrutura de pastas vira o mapa de URLs:

| Arquivo | Vira o quê |
|---|---|
| `app/page.js` | O conteúdo da URL `/` |
| `app/produto/[slug]/page.js` | O conteúdo de `/produto/<qualquer-valor>` |
| `app/layout.js` | A "casca" que envolve **todas** as páginas |
| `app/loading.js` | Exibido automaticamente **enquanto** a página carrega |
| `app/error.js` | Exibido se a página **lançar um erro** |
| `app/not-found.js` | Exibido para URLs que não existem (404) |
| `app/sitemap.js` | Gera o arquivo `/sitemap.xml` |

### `layout.js` — a casca de tudo

```jsx
<html lang="pt-BR" className={inter.variable}>
  <body>
    <CartProvider>        {/* estado do carrinho disponível para todos */}
      <Header />          {/* aparece em todas as páginas */}
      <main>{children}</main>  {/* aqui entra a página atual */}
      <CartDrawer />      {/* o drawer existe sempre, escondido por CSS */}
    </CartProvider>
  </body>
</html>
```

Três decisões importantes aqui:

1. **`CartProvider` no layout raiz** — o Context do React só é visível para componentes *descendentes* do Provider. Colocando-o no layout, **qualquer** componente de **qualquer** página pode usar `useCart()`. Além disso, o layout **não desmonta** ao navegar entre páginas, então o carrinho não se perde na navegação.

2. **`CartDrawer` fora de `<main>`** — o drawer não pertence a nenhuma página; ele é um painel global que desliza sobre qualquer tela. Ele está **sempre montado** e o CSS decide se está visível (classe `drawerOpen`). Isso permite a animação de deslizar — um componente que é montado/desmontado não consegue animar a entrada tão facilmente.

3. **Um layout com `children`** — `children` é a página atual. Ao navegar de `/` para `/produto/x`, o Next.js troca só o `children`; Header e Drawer nem re-renderizam.

### `loading.js` — carregamento com skeletons

Quando uma página `async` demora, o Next.js mostra `loading.js` automaticamente (por baixo dos panos é o `<Suspense>` do React). Em vez de um spinner genérico, o projeto renderiza **6 `ProductSkeleton`** — retângulos cinza pulsantes com o mesmo formato dos cards reais. Isso evita o "pulo" do layout quando o conteúdo chega e dá sensação de velocidade (o usuário já vê a estrutura da página).

### `error.js` — a rede de segurança

```jsx
"use client";  // obrigatório: error boundaries precisam ser client components

export default function Error({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <StatusMessage title="Algo deu errado" ...>
      <Button onClick={reset}>Tentar novamente</Button>
    </StatusMessage>
  );
}
```

Se qualquer componente da página lançar um erro, em vez da tela branca o usuário vê uma mensagem amigável com botão de retry — a função `reset` que o Next.js injeta tenta re-renderizar a página.

### Dois `not-found.js`?

- `app/not-found.js` → 404 **global** ("Página não encontrada"), para URLs aleatórias.
- `app/produto/[slug]/not-found.js` → 404 **contextual** ("Produto não encontrado"), disparado quando `page.js` chama `notFound()`. A mensagem específica ajuda mais o usuário do que um 404 genérico.

Ambos reutilizam o mesmo componente `StatusMessage`, mudando só os textos — nada de duplicar layout de tela de erro.

### `sitemap.js` — SEO

Exporta uma função que lista todas as URLs do site (home + uma por produto, via `getProducts()`). O Next.js transforma isso em `/sitemap.xml`, o arquivo que o Google usa para descobrir as páginas. Como usa a mesma `lib/`, um produto novo entra no sitemap automaticamente.

---

## 8. A home (`page.js`) e o padrão "ilha cliente"

A home tem um problema interessante: o catálogo precisa de **busca e filtro** (interativo → client) mas os cards deveriam ser **estáticos** (server). A solução do projeto é o padrão mais sofisticado do código:

```jsx
export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const items = products.map((product, index) => ({
    id: ..., name: ..., description: ..., category: ...,   // dados para filtrar
    card: <ProductCard product={product} priority={index < 3} />,  // 👈 JSX pronto!
  }));

  return (
    ...
    <ProductExplorer items={items} categories={categories} />
  );
}
```

**O truque:** o servidor renderiza cada `<ProductCard>` (Server Component) e o entrega **já pronto, como propriedade** para a ilha cliente `ProductExplorer`. O Explorer nunca renderiza um card — ele só decide **quais** dos cards prontos exibir:

```jsx
// Dentro do ProductExplorer (client):
const filtered = useMemo(() => {
  return items.filter((item) => {
    const matchesCategory = activeCategory === "Todos" || item.category === activeCategory;
    const matchesQuery = q === "" || item.name.toLowerCase().includes(q) || ...;
    return matchesCategory && matchesQuery;
  });
}, [items, activeCategory, query]);

// ...
{filtered.map((item) => <div key={item.id}>{item.card}</div>)}
```

**Por que fazer assim, em vez de passar os produtos e deixar o Explorer renderizar os cards?**

- Se `ProductCard` fosse importado por um componente cliente, ele viraria cliente também ("use client" contamina tudo que o arquivo importa), e todo o markup do card (imagem, preço, estrelas…) entraria no bundle JavaScript do navegador.
- Do jeito atual, o JS enviado ao navegador é só a lógica de filtro — os cards são HTML que já veio pronto do servidor.

Outros detalhes da home:

- **`Promise.all`** busca produtos e categorias **em paralelo** em vez de um `await` após o outro. Com dados locais tanto faz, mas com uma API real cortaria o tempo de espera pela metade — de novo, o projeto ensina o padrão certo.
- **`priority={index < 3}`** marca as 3 primeiras imagens (as visíveis sem rolar) para carregarem imediatamente; as demais fazem lazy loading. Isso melhora o LCP (a métrica de "quando o conteúdo principal apareceu").
- **`useMemo` no filtro** evita refiltrar a lista a cada re-render que não mudou busca/categoria.
- **Animação escalonada**: cada card entra com `animationDelay: index * 0.05s` (limitado a 0.4s) — efeito cascata barato, feito só com CSS.

---

## 9. A página de produto: rota dinâmica `[slug]`

A pasta `app/produto/[slug]/` tem colchetes no nome: isso é um **segmento dinâmico**. `params.slug` recebe o valor da URL (`/produto/mouse-wireless-pro` → `slug = "mouse-wireless-pro"`).

O `page.js` exporta três coisas:

### 1. `generateStaticParams` — páginas estáticas no build

```js
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}
```

Isso diz ao Next.js: *"estas são todas as variações possíveis desta rota — gere todas no build"*. Resultado: as 6 páginas de produto viram **HTML estático**, servido instantaneamente, sem renderizar nada por requisição. E como o `<Link>` do Next.js pré-carrega páginas estáticas quando o link aparece na tela, clicar num card abre o produto quase instantaneamente.

### 2. `generateMetadata` — SEO por página

```js
export async function generateMetadata({ params }) {
  const { slug } = await params;       // no Next.js 16, params é uma Promise
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,               // vira "Mouse Wireless Pro · TechStore"
    description: product.description,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: { ... images: [{ url: product.image, ... }] },
  };
}
```

Cada produto ganha `<title>`, descrição e imagem de preview próprios (o card bonito que aparece ao compartilhar o link no WhatsApp/Twitter vem do `openGraph`). O `title` se encaixa no **template** definido no layout (`"%s · TechStore"`).

> **Nota de versão:** `const { slug } = await params` — nesta versão do Next.js, `params` é uma **Promise** e precisa de `await`. Em versões antigas era um objeto direto; código antigo quebra aqui.

### 3. O componente da página

```js
const product = await getProductBySlug(slug);
if (!product) notFound();   // interrompe e renderiza o not-found.js da pasta
```

`notFound()` não retorna — ele **lança** internamente e o Next.js assume, exibindo o 404 contextual e enviando o status HTTP correto.

O restante é composição: imagem grande com `priority` (é o elemento principal da página), `StarRating` em tamanho grande, preço formatado, lista de features com ícone de check, a ilha cliente `ProductPurchase` (quantidade + adicionar ao carrinho) e a seção de relacionados — que só aparece se houver algum (`related.length > 0 &&`).

---

## 10. O carrinho: Context API + localStorage

`src/context/CartContext.js` é o arquivo mais denso do projeto. Vamos por partes.

### O problema que o Context resolve

O carrinho é usado pelo `Header` (contador), pelo `CartDrawer` (lista), pelo `AddToCartButton` (adicionar) e pelo `ProductPurchase` (adicionar N). Sem Context, você teria que passar o estado por props através de todos os níveis intermediários (*prop drilling*). Com Context:

```jsx
// Um provider no layout raiz...
<CartProvider>{...toda a aplicação...}</CartProvider>

// ...e qualquer componente descendente acessa direto:
const { addToCart, totalItems } = useCart();
```

### O estado

```js
const [items, setItems] = useState([]);   // [{...produto, quantity: 2}, ...]
const [isOpen, setIsOpen] = useState(false);  // drawer aberto?
```

O item do carrinho é o produto inteiro + `quantity`. Guardar o produto completo (e não só o id) simplifica: o drawer mostra nome/preço/imagem sem precisar buscar de novo.

### As operações — sempre imutáveis

```js
const addToCart = useCallback((product, quantity = 1) => {
  setItems((prev) => {
    const existing = prev.find((item) => item.id === product.id);
    if (existing) {
      return prev.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }  // soma quantidade
          : item
      );
    }
    return [...prev, { ...product, quantity }];  // novo array, nunca push!
  });
  setIsOpen(true);  // feedback: abre o drawer para o usuário ver o que entrou
}, []);
```

Três padrões de React para aprender aqui:

1. **Imutabilidade** — nunca `items.push(...)`; sempre criar um array novo (`map`, `filter`, spread). O React detecta mudança comparando referências: se você mutar o array antigo, a referência não muda e a tela não atualiza.
2. **Updater function** — `setItems((prev) => ...)` em vez de `setItems(novoValor)`. Usar o `prev` garantido pelo React evita bugs quando duas atualizações acontecem em sequência rápida.
3. **`useCallback`** — memoriza a função para que ela não seja recriada a cada render. Sem isso, todo componente que consome o contexto re-renderizaria sempre, porque receberia "funções novas" a cada vez.

As outras operações seguem a mesma lógica: `removeFromCart` filtra fora; `updateQuantity` com valor `<= 0` **remove** o item (por isso o drawer usa `min={0}` no seletor — diminuir até zero remove); `toggleCart`/`closeCart` controlam o drawer.

### Valores derivados — calcule, não armazene

```js
const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
```

Total de itens e preço total **não são estados separados** — são calculados a partir de `items`. Se fossem estados próprios, poderiam sair de sincronia (esquecer de atualizar o total ao remover um item). *Estado mínimo, resto derivado* é uma das regras de ouro do React. O `useMemo` só evita recalcular quando `items` não mudou.

### Persistência e o problema da hidratação

```js
// Estado inicia como [] — IGUAL ao que o servidor renderizou.
useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) setItems(JSON.parse(saved));   // só preenche APÓS montar
}, []);

useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));  // salva a cada mudança
}, [items]);
```

Por que não iniciar direto com `useState(JSON.parse(localStorage.getItem(...)))`? Por causa da **hidratação**: o servidor renderiza o HTML primeiro, e lá **não existe `localStorage`** — o servidor renderizaria carrinho vazio. Se o navegador iniciasse com carrinho cheio, o HTML do servidor e o primeiro render do cliente seriam **diferentes**, e o React acusa erro de *hydration mismatch*. A solução: começar vazio dos dois lados e carregar o carrinho salvo **depois** da montagem, num `useEffect`.

Repare também nos `try/catch` em volta de tudo que toca `localStorage`: ele pode estar indisponível (modo privado, cota cheia) ou conter JSON corrompido. Em todos os casos o app continua funcionando com carrinho vazio, em vez de quebrar.

### O hook `useCart`

```js
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
```

Dois motivos para esse wrapper: (1) os consumidores importam só `useCart`, sem conhecer o objeto `CartContext`; (2) se alguém usar o hook fora do Provider, recebe um **erro claro na hora**, em vez de um `undefined` misterioso que quebra em outro lugar.

---

## 11. Os componentes reutilizáveis (`components/ui`)

### `Button` — o componente polimórfico

```jsx
<Button variant="primary" size="lg" onClick={...}>Comprar</Button>
<Button as={Link} href="/" variant="ghost">Voltar</Button>
```

O padrão **`as` prop**: por padrão renderiza `<button>`, mas `as={Link}` faz o **mesmo visual** virar um link de navegação. Sem isso, você duplicaria os estilos num componente `ButtonLink`. Outros detalhes:

- `variant` e `size` viram classes CSS (`styles[variant]`) — variações de aparência sem duplicar componente;
- `...props` repassa qualquer atributo extra (`aria-label`, `id`, `disabled`) para o elemento final;
- `type ?? "button"`: um `<button>` sem `type` dentro de um `<form>` faz submit por padrão — um bug clássico do HTML que o componente previne por default.

### `Container` — o primitivo de layout

Centraliza o conteúdo com largura máxima e padding lateral. Home, página de produto e header usam o mesmo `Container`, então o alinhamento é idêntico em todo o site — se a largura máxima mudar, muda num lugar só. Também aceita `as` (`<Container as="article">` na página de produto, por semântica).

### `StarRating`, `QuantitySelector`, `StatusMessage`, `ProductSkeleton`

Cada um aparece em **2+ lugares** com pequenas variações controladas por props:

- `StarRating` — `size="sm"` nos cards, `size="lg"` na página de produto.
- `QuantitySelector` — no drawer (`min={0}`, diminuir até remover) e na página de produto (`min={1}`). É um **componente controlado**: não guarda o valor, recebe `value` e avisa via `onChange` — quem decide o que fazer é o pai.
- `StatusMessage` — a tela centralizada de 404/erro/vazio. Três telas diferentes, um componente.

**A regra que esses componentes ensinam:** apareceu igual em dois lugares → vira componente com props para as diferenças.

### `icons.js` — ícones sem biblioteca

Em vez de instalar `react-icons` (megabytes de ícones não usados), o projeto define ~7 SVGs à mão, todos construídos sobre um componente base `Svg` que fixa os padrões (`stroke="currentColor"`, `viewBox`, `aria-hidden`). O `currentColor` faz o ícone **herdar a cor do texto** ao redor — um ícone dentro de um botão roxo fica roxo, sem CSS extra.

---

## 12. O estilo: CSS Modules + design tokens

### CSS Modules

Cada componente tem seu par: `Button.js` + `Button.module.css`. Ao importar:

```js
import styles from "./Button.module.css";
// styles.button → "Button_button__x7Kd2" (nome único gerado no build)
```

O build renomeia cada classe com um hash. Consequência: a classe `.card` do `ProductCard.module.css` e uma eventual `.card` de outro arquivo **nunca colidem**. Você ganha escopo local sem convenções manuais (tipo BEM) e sem instalar nada — CSS Modules já vem no Next.js.

**Por que não Tailwind?** Escolha declarada no README: manter CSS de verdade, colado no componente que estiliza, sem uma camada extra de abstração para o iniciante aprender. Ambos são escolhas válidas; esta prioriza legibilidade didática.

### Design tokens em `globals.css`

```css
:root {
  --bg-primary: #0a0a0f;
  --accent-primary: #7c3aed;
  --radius-md: 14px;
  ...
}
```

O `globals.css` (único CSS global, importado no layout) define: um **reset** (`box-sizing: border-box`, margens zeradas), as **variáveis de design** (cores, bordas, raios) e efeitos de fundo. Todos os `.module.css` consomem essas variáveis (`background: var(--accent-primary)`). Para mudar a cor de destaque do site inteiro, você edita **uma linha**. Isso é um "design system" em miniatura.

---

## 13. Performance e SEO

Resumo do que o projeto faz e por quê:

| Técnica | Onde | O que ganha |
|---|---|---|
| **Páginas estáticas** (`generateStaticParams` + cache) | produto/[slug] | HTML pronto no build; servir é instantâneo |
| **`next/font`** com `Inter` | `layout.js` | A fonte é baixada **no build** e servida do próprio site: sem request ao Google Fonts em runtime, sem "pulo" de layout quando a fonte carrega (`display: "swap"` + métricas ajustadas). Exposta como variável CSS `--font-inter` |
| **`next/image`** | cards, produto, drawer | Redimensiona/otimiza imagens automaticamente, lazy loading por padrão; `width`/`height` obrigatórios reservam o espaço e evitam layout shift; `sizes` informa o tamanho real em cada breakpoint para baixar a menor imagem possível |
| **`priority`** nas imagens above-the-fold | 3 primeiros cards, imagem do produto | Carrega antes o que o usuário vê primeiro (melhora LCP) |
| **`<Link>`** em vez de `<a>` | header, cards, relacionados | Navegação SPA (sem recarregar a página) + prefetch automático das rotas estáticas quando o link entra na viewport |
| **Metadata API** | `layout.js` (global) + `generateMetadata` (por produto) | Title/description/OpenGraph corretos por página; `metadataBase` resolve URLs relativas das imagens de preview |
| **`sitemap.js`** | raiz do app | Buscadores descobrem todas as páginas |
| **Ilhas cliente mínimas** | toda a arquitetura | Menos JavaScript no navegador = carregamento e interação mais rápidos |

---

## 14. Acessibilidade

Detalhes espalhados pelo código que fazem o site funcionar com leitores de tela e teclado:

- **`aria-label` em botões só-ícone** — "Abrir carrinho", "Remover Headphone Pro Max do carrinho": sem texto visível, o leitor de tela precisa do rótulo.
- **`aria-hidden` + `focusable="false"` nos SVGs** — ícones são decorativos; o rótulo está no botão.
- **`role="tablist"` / `role="tab"` / `aria-selected`** nos filtros de categoria — anuncia a semântica de abas.
- **`aria-live="polite"`** na grade de resultados — quando a busca filtra, o leitor de tela anuncia a mudança.
- **`aria-hidden={!isOpen}`** no drawer — quando fechado, o conteúdo dele fica invisível para tecnologia assistiva (ele existe no DOM o tempo todo, lembra?).
- **`disabled`** no botão de diminuir quantidade quando está no mínimo.

---

## 15. Fluxos completos, do clique ao resultado

### Fluxo A — usuário abre a home

1. O servidor (ou o CDN, pois a página foi pré-renderizada no build) entrega o HTML pronto: hero, filtros e todos os cards já visíveis.
2. Enquanto isso o navegador baixa o JS das ilhas (`ProductExplorer`, `Header`, `CartDrawer`, contexto) e as **hidrata** — a página "liga".
3. `CartProvider` monta, o `useEffect` lê o `localStorage` e, se havia carrinho salvo, o badge do header atualiza.

### Fluxo B — usuário digita "mouse" na busca

1. `onChange` do input chama `setQuery("mouse")`.
2. O `ProductExplorer` re-renderiza; `useMemo` refiltra os `items` comparando nome/descrição em minúsculas.
3. Só os cards correspondentes são exibidos — **sem nenhuma requisição à rede**: os cards de todos os produtos já estavam na página, renderizados pelo servidor.

### Fluxo C — usuário clica no "+" de um card

1. `AddToCartButton.handleClick` roda `event.preventDefault()` e `stopPropagation()` — **detalhe crucial**: o botão está *dentro* do `<Link>` que envolve o card; sem isso, o clique também navegaria para a página do produto.
2. `addToCart(product, 1)`: o updater verifica se o produto já está no carrinho (soma quantidade) ou o adiciona com `quantity: 1`.
3. `setIsOpen(true)` abre o drawer — feedback imediato do que aconteceu.
4. O `useEffect` de persistência salva o novo carrinho no `localStorage`.
5. Header (badge) e drawer re-renderizam sozinhos, pois consomem o mesmo contexto.

### Fluxo D — usuário clica no card e vai para a página do produto

1. O `<Link>` provavelmente já **pré-carregou** a rota (ela é estática); a navegação é instantânea, sem reload — só o `children` do layout troca.
2. A página foi gerada no build: `getProductBySlug(slug)` veio do cache, `generateMetadata` definiu title/OG.
3. Na página, `ProductPurchase` mantém a quantidade local (`useState(1)`) e "Adicionar ao Carrinho" chama `addToCart(product, quantity)` — mesmo fluxo C a partir do passo 2.
4. Se o slug não existir (URL digitada errada), `notFound()` renderiza o 404 contextual.

---

## 16. Como evoluir o projeto

**Adicionar um produto** — adicione um objeto em `src/data/products.js` (com `slug` único) e a imagem em `public/images/`. Tudo o mais é automático: card na home, página de detalhe, sitemap, categoria no filtro.

**Trocar o array por uma API/banco** — altere **somente** `src/lib/products.js`:

```js
export async function getProducts() {
  "use cache";
  cacheLife("days");
  cacheTag("products");
  const res = await fetch("https://api.minhaloja.com/products");
  return res.json();
}
```

Nenhuma página muda — essa é a recompensa da camada `lib/`.

**Invalidar o cache após uma edição** — numa Server Action do futuro painel admin:

```js
import { updateTag } from "next/cache";
await updateTag(`product-${slug}`);  // regenera só a página daquele produto
```

As tags já estão prontas esperando por isso.

**Checkout real** — o botão "Finalizar Compra" (`CartDrawer`) hoje não faz nada. O caminho natural: uma rota `/checkout` + uma Server Action que recebe os itens e cria o pedido.

> **Consulte os docs da versão certa:** este projeto usa Next.js 16 com Cache Components — várias APIs mudaram em relação a versões anteriores (ex.: `params` é Promise, `use cache` substitui as opções antigas de fetch). Os docs desta versão estão em `node_modules/next/dist/docs/`. O `AGENTS.md` na raiz existe exatamente para avisar isso a assistentes de IA.

---

## 17. Glossário

| Termo | Significado |
|---|---|
| **App Router** | Sistema de rotas do Next.js baseado na pasta `app/`, onde nomes de arquivo têm significado (`page`, `layout`, `loading`…) |
| **Server Component** | Componente que roda no servidor e vira HTML; seu JS não vai ao navegador. É o padrão |
| **Client Component** | Componente com `"use client"`; roda no navegador e pode usar estado e eventos |
| **Ilha (island)** | Pequeno componente cliente interativo dentro de uma página majoritariamente estática |
| **Hidratação** | Processo em que o React "liga" o HTML vindo do servidor, anexando os eventos e estado |
| **Hydration mismatch** | Erro que ocorre quando o HTML do servidor difere do primeiro render do cliente |
| **Prerender / build estático** | Gerar o HTML das páginas no momento do build, não a cada visita |
| **`use cache` / Cache Components** | Diretiva do Next.js 16 que guarda o retorno de funções/componentes async |
| **`cacheLife` / `cacheTag`** | Definem a validade do cache e etiquetas para invalidá-lo sob demanda |
| **Slug** | Versão de um nome própria para URL: `"Headphone Pro Max"` → `headphone-pro-max` |
| **Segmento dinâmico** | Pasta com colchetes (`[slug]`) que casa com qualquer valor na URL |
| **Context API** | Mecanismo do React para compartilhar estado sem passar props em cadeia |
| **Prop drilling** | Antipadrão de passar props por vários níveis só para chegar a um componente fundo |
| **Componente controlado** | Componente que não guarda seu valor; recebe `value` e emite `onChange` |
| **Imutabilidade** | Nunca modificar objetos/arrays de estado; sempre criar cópias novas |
| **Design tokens** | Variáveis centrais de design (cores, raios, espaçamentos) reutilizadas em todo o CSS |
| **CSS Modules** | CSS com escopo local por arquivo; classes recebem nomes únicos no build |
| **LCP** | Largest Contentful Paint: métrica de quando o maior conteúdo visível terminou de carregar |
| **Skeleton** | Placeholder cinza no formato do conteúdo real, exibido durante o carregamento |
| **Drawer** | Painel lateral que desliza sobre a página (o carrinho) |

---

*Documento gerado a partir da análise do código em julho de 2026. Se o código mudar, confira as seções afetadas.*
