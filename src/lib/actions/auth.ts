"use server";

import { loginSchema, registerSchema } from "@/lib/validations";
import {
  verifyUserCredentials,
  registerUser,
  createSession,
  destroySession,
  getSession,
} from "@/lib/auth";
import { getRolePermissions } from "@/lib/rbac";
import { redirect } from "next/navigation";

export async function loginAction(prevState: unknown, formData: FormData) {
  try {
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const validated = loginSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid input data.",
      };
    }

    const user = await verifyUserCredentials(validated.data.email, validated.data.password);
    if (!user) {
      return {
        success: false,
        error: "Invalid email or password. Please verify your credentials.",
      };
    }

    const permissions = await getRolePermissions(user.role);

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions,
    });

    const targetRedirect = formData.get("redirectTo");
    const isStaff = user.role === "admin" || user.role === "editor" || user.role === "manager";
    let safeRedirect = isStaff ? "/dashboard" : "/profile";

    if (
      typeof targetRedirect === "string" &&
      targetRedirect.trim() !== "" &&
      targetRedirect.startsWith("/") &&
      !targetRedirect.startsWith("//")
    ) {
      // If customer attempted to redirect to admin dashboard, send to profile instead
      if (!isStaff && targetRedirect.startsWith("/dashboard")) {
        safeRedirect = "/profile";
      } else {
        safeRedirect = targetRedirect;
      }
    }

    return {
      success: true,
      redirectTo: safeRedirect,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication failed.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function adminLoginAction(prevState: unknown, formData: FormData) {
  try {
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const validated = loginSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid input data.",
      };
    }

    const user = await verifyUserCredentials(validated.data.email, validated.data.password);
    if (!user) {
      return {
        success: false,
        error: "Invalid administrator credentials. Access denied.",
      };
    }

    const isStaff = user.role === "admin" || user.role === "editor" || user.role === "manager";
    if (!isStaff) {
      return {
        success: false,
        error: "Access Denied: You do not have staff or administrator privileges to access this console.",
      };
    }

    const permissions = await getRolePermissions(user.role);

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions,
    });

    const targetRedirect = formData.get("redirectTo");
    let safeRedirect = "/dashboard";
    if (
      typeof targetRedirect === "string" &&
      targetRedirect.startsWith("/dashboard") &&
      !targetRedirect.startsWith("//")
    ) {
      safeRedirect = targetRedirect;
    }

    return {
      success: true,
      redirectTo: safeRedirect,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication failed.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function registerAction(prevState: unknown, formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") ? String(formData.get("phone")) : undefined,
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    const validated = registerSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid registration details.",
      };
    }

    const regResult = await registerUser({
      name: validated.data.name,
      email: validated.data.email,
      phone: validated.data.phone,
      passwordPlain: validated.data.password,
    });

    if (!regResult.success || !regResult.user) {
      return {
        success: false,
        error: regResult.error || "Failed to create account.",
      };
    }

    // Automatically authenticate the customer upon successful registration
    await createSession({
      userId: regResult.user.id,
      email: regResult.user.email,
      name: regResult.user.name,
      role: "customer",
      permissions: [],
    });

    const targetRedirect = formData.get("redirectTo");
    let safeRedirect = "/profile";
    if (
      typeof targetRedirect === "string" &&
      targetRedirect.trim() !== "" &&
      targetRedirect.startsWith("/") &&
      !targetRedirect.startsWith("//")
    ) {
      safeRedirect = targetRedirect.startsWith("/dashboard") ? "/profile" : targetRedirect;
    }

    return {
      success: true,
      redirectTo: safeRedirect,
      user: regResult.user,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function logoutAction(redirectTo?: string | FormData) {
  const target = typeof redirectTo === "string" ? redirectTo : "/login";
  await destroySession();
  redirect(target);
}

export async function checkSessionAction() {
  return await getSession();
}
