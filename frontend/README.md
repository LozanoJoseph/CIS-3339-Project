# Data Platform Frontend

The frontend is a Vue 3 single-page application built with Vite and Tailwind CSS. It uses Vue Router for navigation, Pinia for application/session state, Axios for the backend REST API, Vuelidate for form validation, and Chart.js for dashboard charts.

## Prerequisites

- Node.js 22.14.0 or another version supported by the currently committed Vite release (22.14.0 was used for local verification)
- npm
- A running Data Platform backend

## Install

```bash
cd frontend
npm install
```

## Configure the backend URL

Vite reads the backend URL from `VITE_ROOT_API` at build time. A local grading/development configuration is committed in `frontend/.env`:

```env
VITE_ROOT_API=http://localhost:3000
```

`frontend/.env.example` is also included as a copyable template. For a deployed frontend, change `VITE_ROOT_API` to the deployed backend URL **before** running the production build. There is no hard-coded localhost API URL in the frontend source code.

## Development server

```bash
npm run dev
```

Vite will print the local development URL (normally `http://localhost:5173`).

## Production build

```bash
npm run build
```

Vite writes the deployable static files to `frontend/dist`.

## Preview the production build locally

```bash
npm run preview
```

`npm run serve` is kept as an equivalent alias for `vite preview`.

Use the preview server to verify the built application rather than the development server. In particular, verify login, the client/event/service lists, dashboard API requests, and direct refresh of a nested route such as `/clientdetails/<valid-id>`.

## Static hosting and Vue Router fallback

The repository is prepared for **Netlify** static hosting through the root `netlify.toml` file:

- base directory: `frontend`
- build command: `npm run build`
- publish directory: `frontend/dist`
- SPA fallback: every unknown path rewrites to `/index.html`

The fallback is required because Vue Router uses `createWebHistory()`. Without a rewrite, refreshing a nested URL can cause the static host to return a 404 instead of loading the Vue application.

### Netlify deployment steps

1. Connect the GitHub project repository to Netlify.
2. Netlify reads the committed root `netlify.toml` configuration.
3. In the Netlify site environment variables, set `VITE_ROOT_API` to the deployed backend origin (for example, `https://api.example.edu`; use the team's actual backend URL).
4. Trigger a deploy. Netlify runs `npm install` and `npm run build`, then serves `frontend/dist`.
5. Open the deployed application and refresh at least one nested Vue Router URL to verify the SPA fallback.
6. Verify an API-dependent page to confirm the frontend can reach the backend.

The backend CORS configuration must allow the exact deployed frontend origin through its `CORS_ORIGIN` setting. That backend security change is part of S1; D2 should be rechecked after S1 is merged.

## D2 verification checklist

- `npm run build` exits with code 0 and produces `dist/`.
- `npm run preview` serves the production build.
- A nested Vue Router route survives browser refresh.
- `VITE_ROOT_API` is supplied from Vite environment configuration, not a hard-coded source URL.
- The deployed frontend origin is allowed by backend `CORS_ORIGIN`.
- The final demo uses the production build, not `npm run dev`.
