export type Lang = "en" | "es";

const normalizeLang = (lang?: string): Lang =>
  lang?.toLowerCase().startsWith("en") ? "en" : "es";

const messages: Record<Lang, Record<MessageKey, string>> = {
  en: {
    EMAIL_REGISTERED: "Email already registered",
    INVALID_CREDENTIALS: "Invalid credentials",
    USER_NOT_FOUND: "User not found",
    PASSWORD_RESET_SENT: "Password reset email sent",
    OWNER_NOT_FOUND: "Owner not found",
    DOG_NOT_FOUND: "Dog not found",
    OWNER_MISMATCH_FOR_DOG: "Owner mismatch for dog",
    LOST_REPORT_NOT_FOUND: "Lost report not found",
    LOST_REPORT_ALREADY_ACTIVE: "Dog already has an active lost report",
    LOST_REPORT_NOT_ACTIVE: "Lost report is not active",
    BREED_NOT_FOUND: "Breed not found",
    COLOR_NOT_FOUND: "Color not found"
  },
  es: {
    EMAIL_REGISTERED: "Correo ya registrado",
    INVALID_CREDENTIALS: "Credenciales inválidas",
    USER_NOT_FOUND: "Usuario no encontrado",
    PASSWORD_RESET_SENT: "Correo de restablecimiento enviado",
    OWNER_NOT_FOUND: "Dueño no encontrado",
    DOG_NOT_FOUND: "Perro no encontrado",
    OWNER_MISMATCH_FOR_DOG: "El dueño no coincide con el perro",
    LOST_REPORT_NOT_FOUND: "Reporte de pérdida no encontrado",
    LOST_REPORT_ALREADY_ACTIVE: "El perro ya tiene un reporte de pérdida activo",
    LOST_REPORT_NOT_ACTIVE: "El reporte no está activo",
    BREED_NOT_FOUND: "Raza no encontrada",
    COLOR_NOT_FOUND: "Color no encontrado"
  }
};

export type MessageKey =
  | "EMAIL_REGISTERED"
  | "INVALID_CREDENTIALS"
  | "USER_NOT_FOUND"
  | "PASSWORD_RESET_SENT"
  | "OWNER_NOT_FOUND"
  | "DOG_NOT_FOUND"
  | "OWNER_MISMATCH_FOR_DOG"
  | "LOST_REPORT_NOT_FOUND"
  | "LOST_REPORT_ALREADY_ACTIVE"
  | "LOST_REPORT_NOT_ACTIVE"
  | "BREED_NOT_FOUND"
  | "COLOR_NOT_FOUND";

export const t = (lang: string | undefined, key: MessageKey): string => {
  const locale = normalizeLang(lang);
  return messages[locale][key] || messages.es[key];
};
