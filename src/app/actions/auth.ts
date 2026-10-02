"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import {
  LoginSchema,
  SignUpSchema,
  type LoginFormState,
  type SignUpFormState,
} from "@/app/lib/definitions";

export async function signIn(
  _state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const validated = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  let user: { id: string; role: "BUYER" | "PRODUCER" | "ADMIN" } | null = null;
  try {
    const found = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true, passwordHash: true },
    });
    if (found && (await bcrypt.compare(password, found.passwordHash))) {
      user = { id: found.id, role: found.role };
    }
  } catch {
    return { message: "Algo deu errado. Por favor, tente novamente." };
  }

  if (!user) return { message: "E-mail ou senha incorretos." };

  await createSession(user.id, user.role);
  redirect("/dashboard");
}

export async function signUp(
  _state: SignUpFormState,
  formData: FormData,
): Promise<SignUpFormState> {
  const validated = SignUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { fullName, email, password } = validated.data;
  const passwordHash = await bcrypt.hash(password, 12);

  let userId: string;
  let userRole: "BUYER" | "PRODUCER" | "ADMIN";

  try {
    const user = await prisma.user.create({
      data: { fullName, email, passwordHash },
      select: { id: true, role: true },
    });
    userId = user.id;
    userRole = user.role;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("Unique constraint") && msg.includes("email")) {
      return {
        errors: { email: ["Já existe uma conta com este e-mail."] },
      };
    }
    return { message: "Algo deu errado. Por favor, tente novamente." };
  }

  await createSession(userId, userRole);
  redirect("/dashboard");
}
