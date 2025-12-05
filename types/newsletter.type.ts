export interface EmailArticle {
  title: string;
  excerpt: string;
  category: string;
  url: string; // Fully qualified (e.g., https://domain.com/post/slug)
  thumbnailUrl: string;
  dateStr: string; // Formatted (e.g., "Feb 14")
}
export interface IDataSnapshot {
  articles?: EmailArticle[];
  bodyContent?: string;
  meta: {
    subject: string;
    preheader: string;
    unsubscribeUrl: string;
  };
}
export type StandardDataSnapshot = Required<Omit<IDataSnapshot, "bodyContent">>;
export type CustomDataSnapshot = Required<Omit<IDataSnapshot, "articles">>;
