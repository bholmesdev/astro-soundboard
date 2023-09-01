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
import { randomUUID } from "node:crypto";

const USER_ID_LEN = 15;

export const Board = pgTable("board", {
  id: uuid("id")
    .primaryKey()
    .$default(() => randomUUID()),
  name: text("name").notNull(),
  userId: varchar("user_id", { length: USER_ID_LEN })
    .notNull()
    .references(() => User.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const Sound = pgTable("sound", {
  id: uuid("id")
    .primaryKey()
    .$default(() => randomUUID()),
  name: text("name").notNull(),
  url: text("url"),
  boardId: uuid("board_id").references(() => Board.id),
});

/* LUCIA TABLES */

export const User = pgTable("auth_user", {
  id: varchar("id", { length: USER_ID_LEN }).primaryKey(),
  username: text("username").unique().notNull(),
});

export const Session = pgTable("user_session", {
  id: varchar("id", {
    length: 128,
  }).primaryKey(),
  userId: varchar("user_id", { length: USER_ID_LEN })
    .notNull()
    .references(() => User.id),
  activeExpires: bigint("active_expires", {
    mode: "number",
  }).notNull(),
  idleExpires: bigint("idle_expires", {
    mode: "number",
  }).notNull(),
});

export const Key = pgTable("user_key", {
  id: varchar("id", {
    length: 255,
  }).primaryKey(),
  userId: varchar("user_id", {
    length: 15,
  })
    .notNull()
    .references(() => User.id),
  hashedPassword: varchar("hashed_password", {
    length: 255,
  }),
});

export const db = drizzle(sql);
