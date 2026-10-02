import { z } from "zod";

export const SignUpSchema = z.object({
  fullName: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(120, "O nome deve ter no máximo 120 caracteres")
    .trim(),
  email: z
    .string()
    .email("Informe um endereço de e-mail válido")
    .max(254, "Endereço de e-mail muito longo")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .regex(/[a-zA-Z]/, "A senha deve conter pelo menos uma letra")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
});

export const LoginSchema = z.object({
  email: z
    .string()
    .email("Informe um endereço de e-mail válido")
    .max(254)
    .trim()
    .toLowerCase(),
  password: z.string().min(1, "Informe sua senha").max(200),
});

export type LoginFormState =
  | {
      errors?: { email?: string[]; password?: string[] };
      message?: string;
    }
  | undefined;

export type SignUpFormState =
  | {
      errors?: {
        fullName?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
