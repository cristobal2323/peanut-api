import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Ingresa tu nombre"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  country: z.string().min(2, "Requerido"),
  city: z.string().min(2, "Requerido"),
  photo: z.string().optional()
});

export const dogSchema = z.object({
  name: z.string().min(1, "Requerido"),
  breed: z.string().min(2, "Requerido"),
  age: z.number().int().nonnegative().optional(),
  sex: z.enum(["male", "female"]),
  color: z.string().min(2, "Requerido"),
  size: z.enum(["small", "medium", "large"]),
  microchip: z.string().optional(),
  photo: z.string().optional(),
  nosePhoto: z.string().optional()
});

export const sightingSchema = z.object({
  dogId: z.string().optional(),
  comment: z.string().min(4, "Comparte más detalles"),
  image: z.string().optional(),
  latitude: z.number(),
  longitude: z.number()
});
