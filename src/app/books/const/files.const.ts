export const getBooksFileName = (isProd: boolean): string =>
  isProd ? 'books.min.json' : 'books.json';
