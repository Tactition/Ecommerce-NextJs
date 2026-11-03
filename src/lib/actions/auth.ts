"use server";

import {
  loginCustomerAction,
  registerCustomerAction,
  logoutCustomerAction,
} from "./customerAuth";
import { loginAdminAction, logoutAdminAction } from "./adminAuth";

// Re-export for any remaining references
export const loginAction = loginCustomerAction;
export const registerAction = registerCustomerAction;
export const logoutAction = logoutCustomerAction;
export const adminLoginAction = loginAdminAction;
export const adminLogoutAction = logoutAdminAction;
