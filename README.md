# Data Platform Project Setup

This project has been developed over time by students in the CIS 4339 course.

The current iteration is based on development done by:
* Jeremy Griffith and Edwin Charly in Spring of 2023
* Elliot Farmer Garcia, Agatha	Molski and Chris Blanco in Fall of 2022.

## Requirements

This project uses NodeJS, VUEJS and MongoDB.

## Backend Node Application
```
cd backend
```
Follow instructions in backend README for setup and running as a local instance.

## Frontend Vue 3 Application
```
cd frontend
```
Follow instructions in frontend README for setup and running as a local instance.

## Production frontend build and deployment (D2)

The Vue frontend reads the backend REST API origin from `frontend/.env` through `VITE_ROOT_API`. The committed local/course configuration is:

```env
VITE_ROOT_API=http://localhost:3000
```

For a deployed build, set `VITE_ROOT_API` to the deployed backend origin in the hosting environment before Vite runs the production build. The frontend source does not hard-code the API origin.

Build and preview the deployable frontend with:

```bash
cd frontend
npm install
npm run build
npm run preview
```

`npm run serve` is an equivalent preview command. Vite writes the static production output to `frontend/dist`.

This repository includes `netlify.toml` for Netlify deployment. It builds from `frontend`, publishes `frontend/dist`, and rewrites unknown paths to `/index.html` so Vue Router history-mode URLs (for example `/clientdetails/<id>`) can be refreshed directly without a static-host 404.

Deployment procedure:

1. Connect the GitHub repository to Netlify.
2. Set the Netlify environment variable `VITE_ROOT_API` to the deployed backend origin.
3. Deploy using the committed `netlify.toml`.
4. Refresh a nested Vue Router route to verify the SPA fallback.
5. Verify an API-dependent view can reach the deployed backend.
6. Ensure the backend CORS configuration allows the exact deployed frontend origin.
7. Run the final demo against the production build/deployment rather than `npm run dev`.

See `frontend/README.md` for the detailed D2 verification checklist.
