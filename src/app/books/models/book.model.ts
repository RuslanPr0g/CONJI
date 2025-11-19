export interface Book {
  id: string;
  title: string;
  description: string;
  content_length: number;
}

export interface BookContents {
  content: BookContent[];
}

export interface BookContent {
  page: number;
  text: string;
}
