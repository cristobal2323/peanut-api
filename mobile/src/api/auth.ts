import { http } from "./http";
import { AuthResponse, User } from "../types";

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  country?: string;
  city?: string;
  photo?: string;
  phone?: string;
};

export type RefreshResponse = {
  token: string;
  expiresIn: string | number;
  user: User;
};

export const authApi = {
  login: (payload: LoginPayload) =>
    http<AuthResponse>("/users/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  signup: (payload: SignupPayload) =>
    http<User>("/users/signup", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  recoverPassword: (email: string) =>
    http<{ message: string }>("/users/recover-password", {
      method: "POST",
      body: JSON.stringify({ email })
    }),
  refresh: (refreshToken: string) =>
    http<RefreshResponse>("/users/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      skipAuth: true
    })
};
