import { sql } from "@vercel/postgres";
import {
  pgTable,
  bigint,
  varchar,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
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

/* LUCIA TABLES */

export const user = pgTable("auth_user", {
  id: varchar("id", {
    length: 15, // change this when using custom user ids
  }).primaryKey(),
  username: text("username").unique().notNull(),
});

export const session = pgTable("user_session", {
  id: varchar("id", {
    length: 128,
  }).primaryKey(),
  userId: varchar("user_id", {
    length: 15,
  })
    .notNull()
    .references(() => user.id),
  activeExpires: bigint("active_expires", {
    mode: "number",
  }).notNull(),
  idleExpires: bigint("idle_expires", {
    mode: "number",
  }).notNull(),
});

export const key = pgTable("user_key", {
  id: varchar("id", {
    length: 255,
  }).primaryKey(),
  userId: varchar("user_id", {
    length: 15,
  })
    .notNull()
    .references(() => user.id),
  hashedPassword: varchar("hashed_password", {
    length: 255,
  }),
});

export const soundValidator = createSelectSchema(Sound);

export const soundCompleteValidator = createSelectSchema(Sound).extend({
  url: z.string().url(),
  name: z.string().nonempty(),
});

export const db = drizzle(sql);
