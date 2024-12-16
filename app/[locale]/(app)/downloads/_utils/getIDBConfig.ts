export const getIDBConfig = (userID: string) => ({
  databaseName: `zeal-articles-db-${userID}`,
  version: 1,
  stores: [
    {
      name: "posts",
      id: { keyPath: "id", autoIncrement: true },
      //    indexes: ["title", "author_id", "category", "description", "image", "published_at", "ttr", "content", "source"],
      indices: [
        { name: "_id", keyPath: "_id", options: { unique: true } },
        { name: "title", keyPath: "title", options: { unique: false } },
        { name: "author_id", keyPath: "author_id" },
        { name: "category", keyPath: "category", options: { unique: false } },
        {
          name: "description",
          keyPath: "description",
          options: { unique: false },
        },
        { name: "image", keyPath: "image", options: { unique: false } },
        {
          name: "published_at",
          keyPath: "published_at",
          options: { unique: false },
        },
        { name: "ttr", keyPath: "ttr" },
        { name: "content", keyPath: "content", options: { unique: false } },
        { name: "source", keyPath: "source", options: { unique: false } },
      ],
    },
  ],
});
