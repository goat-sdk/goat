// typescript/packages/plugins/ionic/src/index.ts
export * from "./config";
export * from "./types";
export { IonicPlugin, ionic } from "./ionic.plugin"; // Explicitly re-export from ionic.plugin.ts
export { IonicTools } from "./ionic.service";       // Explicitly re-export from ionic.service.ts