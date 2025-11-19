export const getBooksFileName = (isProd: boolean): string =>
  isProd ? 'books.min.json' : 'books.json';

export const getWordsFileName = (isProd: boolean): string =>
  isProd ? 'words.min.json' : 'words.json';

export const getGroupFileNames = (
  isProd: boolean
): { order: number; file: string }[] => [
  { order: 1, file: isProd ? 'group-1.min.json' : 'group-1.json' },
  { order: 2, file: isProd ? 'group-2.min.json' : 'group-2.json' },
  { order: 3, file: isProd ? 'group-3.min.json' : 'group-3.json' },
  { order: 4, file: isProd ? 'group-4.min.json' : 'group-4.json' },
];

export const getGroupInformationFileName = (isProd: boolean): string =>
  isProd ? 'group-information.min.json' : 'group-information.json';
