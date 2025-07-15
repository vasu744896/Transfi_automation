# 🎭 Playwright + TypeScript Setup

End-to-end testing setup using Playwright and TypeScript.

---

## ✅ Step 1 – Install Playwright

```bash
npm init -y
npm install -D playwright @playwright/test typescript ts-node
npx playwright install
```

---

## ▶️ Step 2 – Run Your Test File

```bash
npx playwright test ./foldername/filename.spec.ts --headed
```

> Replace `foldername/filename.spec.ts` with the actual path of your test file.

---

## 📊 Step 3 – View Test Report (Optional)

```bash
npx playwright show-report
```

---

## ⚙️ (Optional) Initialize Default Config

```bash
npx playwright test ./tests/foldername/filename --headed
```

Creates:
- `playwright.config.ts`
- `tests/` folder
- Example test file

---