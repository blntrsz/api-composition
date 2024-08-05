import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { articles } from "./db";

const app = new Hono();

app
  .get("/", (c) => {
    return c.json(articles);
  })
  .get("/:id", (c) => {
    const id = c.req.param("id");

    const article = articles.find((comment) => comment.id.toString() === id);

    if (!article) return c.json({ message: "Not found" }, 404);
    return c.json(article);
  });

export const handler = handle(app);
