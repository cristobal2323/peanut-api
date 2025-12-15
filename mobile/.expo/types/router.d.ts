/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)` | `/(auth)/login` | `/(auth)/recover` | `/(auth)/signup` | `/(tabs)` | `/(tabs)/` | `/(tabs)/feed` | `/(tabs)/notifications` | `/(tabs)/profile` | `/(tabs)/scan` | `/_sitemap` | `/dog/new` | `/feed` | `/login` | `/notifications` | `/profile` | `/recover` | `/report-sighting` | `/scan` | `/signup`;
      DynamicRoutes: `/dog/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/dog/[id]`;
    }
  }
}
