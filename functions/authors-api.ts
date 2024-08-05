import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { authors } from "./db";

const app = new Hono();

app
  .get("/", (c) => {
    return c.json(authors);
  })
  .get("/:id", (c) => {
    const id = c.req.param("id");

    const author = authors.find((comment) => comment.id.toString() === id);

    if (!author) return c.json({ message: "Not found" }, 404);
    return c.json(author);
  });

export const handler = handle(app);
