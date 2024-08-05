import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { comments } from "./db";

const app = new Hono();

app
  .get("/", (c) => {
    return c.json(comments);
  })
  .get("/:id", (c) => {
    const id = c.req.param("id");

    const comment = comments.find((comment) => comment.id.toString() === id);

    if (!comment) return c.json({ message: "Not found" }, 404);
    return c.json(comment);
  });

export const handler = handle(app);
