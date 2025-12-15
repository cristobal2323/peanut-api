import { useMemo } from "react";
import { usePreferencesStore, Locale } from "./store/preferences";

type Translations = Record<
  Locale,
  {
    auth: {
      login: {
        title: string;
        subtitle: string;
        emailLabel: string;
        emailPlaceholder: string;
        passwordLabel: string;
        passwordPlaceholder: string;
        forgot: string;
        submit: string;
        divider: string;
        footerText: string;
        footerLink: string;
        defaultError: string;
        errorRequiredEmail: string;
        errorInvalidEmail: string;
        errorRequiredPassword: string;
      };
      signup: {
        title: string;
        subtitle: string;
        nameLabel: string;
        namePlaceholder: string;
        emailLabel: string;
        emailPlaceholder: string;
        passwordLabel: string;
        passwordPlaceholder: string;
        phoneLabel: string;
        phonePlaceholder: string;
        termsLabel: string;
        submit: string;
        divider: string;
        footerText: string;
        footerLink: string;
        defaultError: string;
        errorRequiredName: string;
        errorMinName: string;
        errorRequiredEmail: string;
        errorInvalidEmail: string;
        errorRequiredPassword: string;
        errorMinPassword: string;
        errorRequiredPhone: string;
        errorInvalidPhone: string;
      };
      recover: {
        title: string;
        subtitle: string;
        emailLabel: string;
        emailPlaceholder: string;
        submit: string;
        footerText: string;
        footerLink: string;
        success: string;
        error: string;
        errorRequiredEmail: string;
        errorInvalidEmail: string;
      };
    };
    common: {
      languageToggle: {
        es: string;
        en: string;
        tooltip: string;
      };
    };
  }
>;

const translations: Translations = {
  en: {
    auth: {
      login: {
        title: "Sign In",
        subtitle: "Hi! Welcome back, you've been missed",
        emailLabel: "Email",
        emailPlaceholder: "example@gmail.com",
        passwordLabel: "Password",
        passwordPlaceholder: "••••••••••",
        forgot: "Forgot Password?",
        submit: "Sign In",
        divider: "Or sign in with",
        footerText: "Don't have an account?",
        footerLink: "Sign Up",
        defaultError: "Authentication error",
        errorRequiredEmail: "Email is required",
        errorInvalidEmail: "Invalid email",
        errorRequiredPassword: "Password required"
      },
      signup: {
        title: "Create Account",
        subtitle: "Fill your information below or register with your social account.",
        nameLabel: "Name",
        namePlaceholder: "John Doe",
        emailLabel: "Email",
        emailPlaceholder: "example@gmail.com",
        passwordLabel: "Password",
        passwordPlaceholder: "••••••••••",
        phoneLabel: "Phone (include country code)",
        phonePlaceholder: "+569XXXXXXXX",
        termsLabel: "Agree with Terms & Condition",
        submit: "Sign Up",
        divider: "Or sign up with",
        footerText: "Already have an account?",
        footerLink: "Sign in",
        defaultError: "We couldn't create your account",
        errorRequiredName: "Name is required",
        errorMinName: "Please enter at least 2 characters",
        errorRequiredEmail: "Email is required",
        errorInvalidEmail: "Invalid email",
        errorRequiredPassword: "Password required",
        errorMinPassword: "At least 8 characters",
        errorRequiredPhone: "Phone is required",
        errorInvalidPhone: "Include country code, digits only"
      },
      recover: {
        title: "Forgot Password",
        subtitle:
          "Enter your email address and we'll send you instructions to reset it.",
        emailLabel: "Email",
        emailPlaceholder: "example@gmail.com",
        submit: "Send Instructions",
        footerText: "Remember your password?",
        footerLink: "Sign in",
        success: "We sent you an email with the steps",
        error: "We couldn't send the email",
        errorRequiredEmail: "Email is required",
        errorInvalidEmail: "Invalid email"
      }
    },
    common: {
      languageToggle: {
        es: "ES",
        en: "EN",
        tooltip: "Change language"
      }
    }
  },
  es: {
    auth: {
      login: {
        title: "Inicia sesión",
        subtitle: "¡Hola! Te hemos echado de menos",
        emailLabel: "Correo",
        emailPlaceholder: "ejemplo@gmail.com",
        passwordLabel: "Contraseña",
        passwordPlaceholder: "••••••••••",
        forgot: "¿Olvidaste tu contraseña?",
        submit: "Iniciar sesión",
        divider: "O inicia sesión con",
        footerText: "¿No tienes una cuenta?",
        footerLink: "Crear una",
        defaultError: "Error de autenticación",
        errorRequiredEmail: "El correo es requerido",
        errorInvalidEmail: "Correo inválido",
        errorRequiredPassword: "Contraseña requerida"
      },
      signup: {
        title: "Crea tu cuenta",
        subtitle: "Completa tu información o regístrate con tu cuenta social.",
        nameLabel: "Nombre",
        namePlaceholder: "Juan Pérez",
        emailLabel: "Correo",
        emailPlaceholder: "ejemplo@gmail.com",
        passwordLabel: "Contraseña",
        passwordPlaceholder: "••••••••••",
        phoneLabel: "Teléfono (incluye código de país)",
        phonePlaceholder: "+569XXXXXXXX",
        termsLabel: "Acepto Términos y Condiciones",
        submit: "Registrarme",
        divider: "O regístrate con",
        footerText: "¿Ya tienes cuenta?",
        footerLink: "Inicia sesión",
        defaultError: "No pudimos crear tu cuenta",
        errorRequiredName: "Nombre requerido",
        errorMinName: "Mínimo 2 caracteres",
        errorRequiredEmail: "El correo es requerido",
        errorInvalidEmail: "Correo inválido",
        errorRequiredPassword: "Contraseña requerida",
        errorMinPassword: "Mínimo 8 caracteres",
        errorRequiredPhone: "Teléfono requerido",
        errorInvalidPhone: "Incluye código de país, solo dígitos"
      },
      recover: {
        title: "Recupera tu contraseña",
        subtitle:
          "Ingresa tu correo y te enviaremos instrucciones para restablecerla.",
        emailLabel: "Correo",
        emailPlaceholder: "ejemplo@gmail.com",
        submit: "Enviar instrucciones",
        footerText: "¿Recordaste tu contraseña?",
        footerLink: "Inicia sesión",
        success: "Te enviamos un correo con los pasos",
        error: "No pudimos enviar el correo",
        errorRequiredEmail: "El correo es requerido",
        errorInvalidEmail: "Correo inválido"
      }
    },
    common: {
      languageToggle: {
        es: "ES",
        en: "EN",
        tooltip: "Cambiar idioma"
      }
    }
  }
};

const resolvePath = (obj: any, path: string) => {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

export const useTranslation = () => {
  const locale = usePreferencesStore((state) => state.locale);

  const t = useMemo(() => {
    return (path: string): string => {
      const value = resolvePath(translations[locale], path);
      return typeof value === "string" ? value : path;
    };
  }, [locale]);

  return { t, locale };
};
