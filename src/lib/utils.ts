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
  fileUrl: z.string().url().nullable(),
  fileName: z.string().nullable(),
  fileKey: z.string().nullable(),
  boardId: z.string().uuid(),
});

export const soundCompleteValidator = soundValidator.extend({
  fileUrl: z.string().url(),
  fileName: z.string(),
  fileKey: z.string(),
  name: z.string().nonempty(),
});

export const updateSoundValidator = zfd.formData({
  name: zfd.text(z.string().nonempty()),
  fileKey: zfd.text(z.string().nonempty()),
  fileName: zfd.text(z.string().nonempty()),
  fileUrl: zfd.text(z.string().url()),
});
