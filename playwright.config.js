import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

const chromePaths = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
];

const executablePath = chromePaths.find((candidate) => existsSync(candidate));

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    headless: true,
    launchOptions: executablePath ? { executablePath } : {}
  },
  webServer: [
    {
      command: "npm run dev:server",
      port: 3101,
      reuseExistingServer: false,
      timeout: 60_000
    },
    {
      command: "npm run dev:client",
      port: 4173,
      reuseExistingServer: false,
      timeout: 60_000
    }
  ]
});
