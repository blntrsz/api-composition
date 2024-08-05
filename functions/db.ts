export const articles = [
  {
    id: 1,
    name: "Article 1",
  },
  {
    id: 2,
    name: "Article 2",
  },
  {
    id: 3,
    name: "Article 3",
  },
];

export const authors = [
  {
    id: 1,
    name: "Author 1",
  },
  {
    id: 2,
    name: "Author 2",
  },
  {
    id: 3,
    name: "Author 3",
  },
];

export const comments = [
  {
    id: 1,
    name: "Comment 1",
  },
  {
    id: 2,
    name: "Comment 2",
  },
  {
    id: 3,
    name: "Comment 3",
  },
];

export const connections = {
  ["article-to-comment"]: [
    {
      comment_id: 1,
      article_id: 2,
    },
    {
      comment_id: 2,
      article_id: 2,
    },
    {
      comment_id: 3,
      article_id: 3,
    },
  ],
  ["author-to-comment"]: [
    {
      comment_id: 1,
      author_id: 2,
    },
    {
      comment_id: 2,
      author_id: 2,
    },
    {
      comment_id: 3,
      author_id: 1,
    },
  ],
  ["article-to-author"]: [
    {
      article_id: 1,
      author_id: 1,
    },
    {
      article_id: 2,
      author_id: 1,
    },
    {
      article_id: 3,
      author_id: 3,
    },
  ],
};
