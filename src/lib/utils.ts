import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { zfd } from "zod-form-data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type VercelPostgresError = {
  code: string;
  detail: string;
  schema?: string;
  table?: string;
  column?: string;
  dataType?: string;
  constraint?: "auth_user_username_key";
};

export function isVercelUniqueConstraintViolation(
  e: unknown
): e is VercelPostgresError & { code: "23505" } {
  return e != null && typeof e === "object" && (e as any).code === "23505";
}

export const soundValidator = z.object({
  id: z.string().uuid(),
  name: z.string(),
  url: z.string().url().nullable(),
});

export const soundCompleteValidator = soundValidator.extend({
  url: z.string().url(),
  name: z.string().nonempty(),
});

export const updateSoundValidator = zfd.formData({
  name: zfd.text(z.string().nonempty()),
  url: zfd.text(z.string().url()),
});
