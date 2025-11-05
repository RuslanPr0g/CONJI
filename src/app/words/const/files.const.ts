export const getWordsFileName = (isProd: boolean): string =>
  isProd ? 'words.min.json' : 'words.json';
