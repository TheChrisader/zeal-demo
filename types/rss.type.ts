export interface RSSItem {
  title: string;
  description: string;
  link: string;
  guid: string;
  pubDate: Date;
  author?: string;
  image?: {
    url: string;
    title?: string;
  };
}

export interface RSSFeed {
  title: string;
  description: string;
  link: string;
  language: string;
  lastBuildDate: Date;
  generator: string;
  items: RSSItem[];
}