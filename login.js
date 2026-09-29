#!/usr/bin/env node

if (require("fs").existsSync(".env")) process.loadEnvFile();
const requiredEnv = v => process.env[v] ?? (() => { throw new Error(`Missing required environment variable: ${v}`) })();
const fallbackEnv = (v, fallback) => process.env[v] ?? fallback;

(async () => {
  const url = requiredEnv("URL"), username = requiredEnv("PORTAL_USER"), password = requiredEnv("PORTAL_PASSWORD");
  const insecure = ["true", "yes", "on", "1"].includes(fallbackEnv("IGNORE_HTTPS_ERRORS","").toLowerCase());
  if (insecure) console.warn("WARNING: TLS certificate verification is disabled.")
  const browser = await require("playwright").chromium.launch();
  const context = await browser.newContext({ignoreHTTPSErrors: insecure});
  context.setDefaultTimeout(fallbackEnv("DEFAULT_TIMEOUT", 5) * 1000);
  context.setDefaultNavigationTimeout(fallbackEnv("NAVIGATION_TIMEOUT", 10) * 1000);
  const page = await context.newPage();
  try {
    console.log(`Opening ${url}`);
    await page.goto(url, {waitUntil: "domcontentloaded"});
    console.log(`Trying to login at ${page.url()}`);
    await page.locator('input[type="text"]').first().fill(username);
    await page.locator('input[type="password"]').first().fill(password);
    await page.locator('button[type="submit"], input[type="submit"]').click();
    await page.waitForLoadState("domcontentloaded");
    console.log(`Login successful: ${page.url()}`);
  } catch (error) {
    console.error("Captive portal login failed:", error.message)
  } finally {
    try {
      if ((await context.request.get(url, {failOnStatusCode: true})).ok()) console.log("Connectivity check successful");
    } catch (error) {
      console.error("Connectivity check failed:", error.message);
    }
    await browser.close();
  }
})();
