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
    COLOR_NOT_FOUND: "Color not found",
    NOTIF_NEW_SIGHTING_TITLE: "New sighting near your dog",
    NOTIF_NEW_SIGHTING_BODY: "Someone reported a sighting that may be related to your lost report.",
    NOTIF_LOST_REPORT_RESOLVED_TITLE: "Lost report resolved",
    NOTIF_LOST_REPORT_RESOLVED_BODY: "A lost report you contributed to has been resolved.",
    NOTIF_LOST_REPORT_CANCELLED_TITLE: "Lost report cancelled",
    NOTIF_LOST_REPORT_CANCELLED_BODY: "A lost report you contributed to has been cancelled."
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
    COLOR_NOT_FOUND: "Color no encontrado",
    NOTIF_NEW_SIGHTING_TITLE: "Nuevo avistamiento cerca de tu perro",
    NOTIF_NEW_SIGHTING_BODY: "Alguien reportó un avistamiento que puede estar relacionado con tu reporte.",
    NOTIF_LOST_REPORT_RESOLVED_TITLE: "Reporte de pérdida resuelto",
    NOTIF_LOST_REPORT_RESOLVED_BODY: "Un reporte de pérdida al que contribuiste ha sido resuelto.",
    NOTIF_LOST_REPORT_CANCELLED_TITLE: "Reporte de pérdida cancelado",
    NOTIF_LOST_REPORT_CANCELLED_BODY: "Un reporte de pérdida al que contribuiste ha sido cancelado."
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
  | "COLOR_NOT_FOUND"
  | "NOTIF_NEW_SIGHTING_TITLE"
  | "NOTIF_NEW_SIGHTING_BODY"
  | "NOTIF_LOST_REPORT_RESOLVED_TITLE"
  | "NOTIF_LOST_REPORT_RESOLVED_BODY"
  | "NOTIF_LOST_REPORT_CANCELLED_TITLE"
  | "NOTIF_LOST_REPORT_CANCELLED_BODY";

export const t = (lang: string | undefined, key: MessageKey): string => {
  const locale = normalizeLang(lang);
  return messages[locale][key] || messages.es[key];
};
