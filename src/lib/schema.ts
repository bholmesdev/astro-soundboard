import { sql } from "@vercel/postgres";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { v4 as uuidv4 } from "uuid";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const Board = pgTable("board", {
  id: uuid("id")
    .primaryKey()
    .$default(() => uuidv4()),
  name: text("name").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const Sound = pgTable("sound", {
  id: uuid("id")
    .primaryKey()
    .$default(() => uuidv4()),
  name: text("name").notNull(),
  url: text("url"),
  boardId: uuid("board_id").references(() => Board.id),
});

export const soundValidator = createSelectSchema(Sound);

export const soundCompleteValidator = createSelectSchema(Sound).extend({
  url: z.string().url(),
  name: z.string().nonempty(),
});

export const db = drizzle(sql);
