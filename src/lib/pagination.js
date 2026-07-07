// Constante compartilhada entre a Home (Server Component), a Server Action de
// paginação e a ilha cliente. Mora num módulo sem diretivas ("use cache"/
// "use server") para poder ser importada tanto no servidor quanto no cliente.
export const PAGE_SIZE = 8;
