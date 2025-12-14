import * as Sentry from "sentry-expo";
import Constants from "expo-constants";

let initialized = false;

export const initSentry = () => {
  if (initialized) return;
  const dsn = Constants.expoConfig?.extra?.sentryDsn;
  if (!dsn) return; // No DSN configured; keep Sentry disabled silently.
  initialized = true;

  Sentry.init({
    dsn,
    enableInExpoDevelopment: true,
    debug: __DEV__,
    tracesSampleRate: 0.2
  });
};

export const captureError = (error: unknown, context?: Record<string, any>) => {
  if (!initialized) return;
  Sentry.Native.captureException(error, (scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, { value });
      });
    }
    return scope;
  });
};
