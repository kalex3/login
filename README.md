# login

Simple script to automate captive portal logins using Playwright.

## Usage

1. Install the dependencies (only Playwright at the moment):

```sh
npm install
```

1. Install a browser for Playwright:

```sh
npx playwright install chromium
```

1. Configure:

```sh
cp .env.example .env # then edit .env with your own values
```

1. Run: 

```sh
node login.js
```
