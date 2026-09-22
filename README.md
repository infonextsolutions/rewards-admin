# Jackson Admin

Administration interface for the Jackson rewards platform. It manages users,
games and offers, reward rules, challenges, surveys, wallets, redemptions, and
platform settings.

This repository contains the Next.js frontend and an image proxy route. The
business API and database are maintained separately.

## Local setup

Use Node.js 24 and npm. Install the versions recorded in the lockfile:

```sh
npm ci
cp .env.example .env.local
```

Set `NEXT_PUBLIC_API_BASE` to the intended backend URL, including `/api`, then run:

```sh
npm run dev
```

Open `http://localhost:3000` and sign in with an admin account provided by the
backend administrator. No default login credentials are included.

## Configuration

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE` | Backend API URL, including `/api`. Set explicitly for each environment. |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional browser error-reporting DSN. Leave empty to disable reporting. |
| `NEXT_PUBLIC_SENTRY_ENV` | Optional environment label, such as `uat` or `production`. |

`NEXT_PUBLIC_*` values are included in the browser bundle. They must not contain
private keys, backend credentials, or service tokens. Supply those to the backend
through its deployment configuration.

The API client retains a UAT fallback for local development. Do not rely on that
fallback for deployments. Public environment variables must be set before the
build; changing them requires rebuilding the application.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run lint` | Check source code with ESLint. |
| `npm run build` | Build the production application, including lint checks. |
| `npm start` | Serve the completed production build. |

`dev:webpack` and `build:webpack` are compatibility aliases for the corresponding
development and build commands. There is currently no automated test suite.

## Code organization

```text
src/app/         Page routes, root layout, and image proxy
src/components/  Feature screens and shared UI
src/hooks/       Feature state and API orchestration
src/data/        API services, transformations, and configuration data
src/contexts/    Authentication and shared search state
src/lib/         HTTP client and error reporting
src/utils/       Validation, date filters, and exports
public/         Static assets
```

Most screens use a custom hook and a service from `src/data`. The shared Axios
client in `src/lib/apiClient.js` attaches the admin bearer token and handles API
failures. Authentication state is restored from browser local storage. The
backend must enforce authorization for every protected operation; the frontend
route guard only controls navigation.

## Feature status

The main administration screens call backend APIs. Some retained modules are
prototypes: remote configuration and push notifications use local mock data,
and challenge pause rules and multiplier deletion still use in-memory data.
Some user actions and segment controls also lack persistence. Do not treat a
simulated success message as confirmation of a backend update.

Several routes are intentionally absent from the sidebar. Hiding a navigation
item does not disable its route or restrict access to backend data.

## Deployment

The repository includes a Vercel configuration. For a Node.js deployment, run
`npm ci`, `npm run build`, and `npm start`. The build currently downloads Geist
fonts through `next/font/google`, so it requires access to Google Fonts.

Set the target API URL and optional Sentry values in the deployment environment.
The backend must allow requests from the deployed frontend origin. If image
hosts change, review both `next.config.mjs` and
`src/app/api/proxy-image/route.js`.

Before release, review dependency advisories with `npm audit` and verify login,
user management, game editing, reward settings, redemptions, and exports against
the intended test backend. Passing lint and build does not verify those API
workflows.

Commit source, configuration templates, and `package-lock.json`. Keep local
environment files, credentials, editor settings, dependency directories, build
output, logs, and test artifacts out of version control.
