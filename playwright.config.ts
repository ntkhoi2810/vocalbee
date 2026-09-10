import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: { baseURL: "http://localhost:3100", headless: true, trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: {
    command: "npm run start -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 60000,
    env: { VOCALBEE_DEMO: "true", VOCALBEE_DATA_DIR: `./data/e2e-${Date.now()}`, VOCALBEE_SECURE_COOKIE: "false" },
  },
});
