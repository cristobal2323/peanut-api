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
        roleLabel: string;
        roleOwner: string;
        roleRescuer: string;
        roleVet: string;
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
    dogs: {
      form: {
        title: string;
        stepLabel: string;
        step1Title: string;
        step1Sub: string;
        step2Title: string;
        step2Sub: string;
        photoLabel: string;
        nameLabel: string;
        namePlaceholder: string;
        breedLabel: string;
        breedPlaceholder: string;
        breedSearchPlaceholder: string;
        mixedBreedLabel: string;
        sexLabel: string;
        sexMale: string;
        sexFemale: string;
        ageLabel: string;
        agePlaceholder: string;
        colorLabel: string;
        colorPlaceholder: string;
        colorSearchPlaceholder: string;
        sizeLabel: string;
        sizeSmall: string;
        sizeMedium: string;
        sizeLarge: string;
        notesLabel: string;
        notesPlaceholder: string;
        microchipLabel: string;
        microchipPlaceholder: string;
        passportLabel: string;
        passportPlaceholder: string;
        infoNextTitle: string;
        infoNextBody: string;
        back: string;
        continue: string;
        submit: string;
        submitting: string;
        sessionError: string;
        photoUploadErrorTitle: string;
        photoUploadErrorBody: string;
        saveErrorTitle: string;
        saveErrorDefault: string;
        emptySearch: string;
      };
      home: {
        emptyTitle: string;
        emptySubtitle: string;
        emptyCta: string;
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
        roleLabel: "I am signing up as",
        roleOwner: "Owner",
        roleRescuer: "Rescuer",
        roleVet: "Vet",
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
    },
    dogs: {
      form: {
        title: "Register Dog",
        stepLabel: "Step {current} of {total}",
        step1Title: "Basic information",
        step1Sub: "Tell us the essentials about your best friend",
        step2Title: "Traits and details",
        step2Sub: "Extra info that helps identify them",
        photoLabel: "Upload photo",
        nameLabel: "Name",
        namePlaceholder: "E.g. Peanut",
        breedLabel: "Breed",
        breedPlaceholder: "Select a breed",
        breedSearchPlaceholder: "Search breed...",
        mixedBreedLabel: "Mixed breed (unidentified)",
        sexLabel: "Sex",
        sexMale: "Male",
        sexFemale: "Female",
        ageLabel: "Age (years)",
        agePlaceholder: "E.g. 4",
        colorLabel: "Color",
        colorPlaceholder: "Select a color",
        colorSearchPlaceholder: "Search color...",
        sizeLabel: "Size",
        sizeSmall: "Small",
        sizeMedium: "Medium",
        sizeLarge: "Large",
        notesLabel: "Distinctive traits",
        notesPlaceholder: "Scars, unique spots, behavior...",
        microchipLabel: "Has microchip",
        microchipPlaceholder: "Microchip number",
        passportLabel: "Passport (optional)",
        passportPlaceholder: "Passport number",
        infoNextTitle: "Next step: scan the nose",
        infoNextBody: "We'll take you to the camera to capture your dog's unique nose pattern.",
        back: "Back",
        continue: "Continue",
        submit: "Scan nose",
        submitting: "Saving...",
        sessionError: "You must log in to register a dog",
        photoUploadErrorTitle: "Photo",
        photoUploadErrorBody: "We couldn't upload the photo. Continuing without it.",
        saveErrorTitle: "Error",
        saveErrorDefault: "We couldn't save the dog",
        emptySearch: "No results"
      },
      home: {
        emptyTitle: "Register your first dog",
        emptySubtitle: "Protect them with their unique digital fingerprint: the nose",
        emptyCta: "Start registration"
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
        roleLabel: "Me registro como",
        roleOwner: "Dueño",
        roleRescuer: "Rescatista",
        roleVet: "Veterinario",
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
    },
    dogs: {
      form: {
        title: "Registrar Perro",
        stepLabel: "Paso {current} de {total}",
        step1Title: "Información básica",
        step1Sub: "Cuéntanos lo esencial sobre tu mejor amigo",
        step2Title: "Rasgos y detalles",
        step2Sub: "Más información que ayuda a identificarlo",
        photoLabel: "Subir foto",
        nameLabel: "Nombre",
        namePlaceholder: "Ej. Peanut",
        breedLabel: "Raza",
        breedPlaceholder: "Selecciona una raza",
        breedSearchPlaceholder: "Buscar raza...",
        mixedBreedLabel: "Es mestizo (raza no identificada)",
        sexLabel: "Sexo",
        sexMale: "Macho",
        sexFemale: "Hembra",
        ageLabel: "Edad (años)",
        agePlaceholder: "Ej. 4",
        colorLabel: "Color",
        colorPlaceholder: "Selecciona un color",
        colorSearchPlaceholder: "Buscar color...",
        sizeLabel: "Tamaño",
        sizeSmall: "Pequeño",
        sizeMedium: "Mediano",
        sizeLarge: "Grande",
        notesLabel: "Rasgos distintivos",
        notesPlaceholder: "Cicatrices, manchas únicas, comportamiento...",
        microchipLabel: "Tiene microchip",
        microchipPlaceholder: "Número de microchip",
        passportLabel: "Pasaporte (opcional)",
        passportPlaceholder: "Número de pasaporte",
        infoNextTitle: "Próximo paso: escanear la trufa",
        infoNextBody: "Te llevaremos a la cámara para capturar el patrón único de la nariz de tu perro.",
        back: "Atrás",
        continue: "Continuar",
        submit: "Escanear trufa",
        submitting: "Guardando...",
        sessionError: "Debes iniciar sesión para registrar un perro",
        photoUploadErrorTitle: "Foto",
        photoUploadErrorBody: "No pudimos subir la foto. Continuamos sin ella.",
        saveErrorTitle: "Error",
        saveErrorDefault: "No pudimos guardar el perro",
        emptySearch: "Sin resultados"
      },
      home: {
        emptyTitle: "Registra a tu primer perro",
        emptySubtitle: "Protegelo con su huella digital única: la trufa",
        emptyCta: "Comenzar registro"
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
