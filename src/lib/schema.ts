import { sql } from "@vercel/postgres";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { v4 as uuidv4 } from "uuid";

export const Board = pgTable("board", {
  id: uuid("id")
    .primaryKey()
    .$default(() => uuidv4()),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const Sound = pgTable("sound", {
  id: uuid("id")
    .primaryKey()
    .$default(() => uuidv4()),
  url: text("url").unique().notNull(),
  boardId: uuid("board_id").references(() => Board.id),
});

export const db = drizzle(sql);
