import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests", testMatch: ["whop-payment.spec.mjs", "freemium.spec.mjs", "icons-experiment.spec.mjs"], timeout: 25_000,
  use: { baseURL: "http://127.0.0.1:4325", viewport: { width: 390, height: 844 }, reducedMotion: "reduce" },
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4325",
    url: "http://127.0.0.1:4325/onboarding", reuseExistingServer: false,
  },
});
