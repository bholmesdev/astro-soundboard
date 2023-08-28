import { sql } from "@vercel/postgres";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/vercel-postgres";

export const Board = pgTable("board", {
  id: uuid("id").primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const BoardItem = pgTable("board_item", {
  id: uuid("id").primaryKey(),
  url: text("url").unique().notNull(),
  boardId: uuid("board_id").references(() => Board.id),
});

export const db = drizzle(sql);
