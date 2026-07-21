# Musanzi Web Apps

Nx monorepo for Wilfried Musanzi's portfolio website and its administration dashboard. Both applications are built with Angular, rendered on the server, and share common UI, utilities, styles, and static assets.

## Applications

| Application | Description                                                                     | Development URL         |
| ----------- | ------------------------------------------------------------------------------- | ----------------------- |
| `website`   | Public portfolio, projects, services, contact information, and blog             | `http://localhost:4200` |
| `admin`     | Authenticated dashboard for managing articles, projects, tags, users, and roles | `http://localhost:4300` |

The applications expect the backend API at `http://localhost:8000` in development. This value is configured in each application's `src/environments/environment.development.ts` file.

## Tech stack

- Angular 22 with standalone components and server-side rendering
- Nx 23
- Angular Material and Angular CDK
- NgRx Signal Store
- Tailwind CSS 4
- TipTap rich-text editor
- pnpm and Node.js 24+
- Vitest, ESLint, Prettier, Husky, and commitlint

## Getting started

### Prerequisites

- Node.js 24 or later
- A compatible API running on port `8000`

Enable pnpm and install the dependencies:

```bash
pnpm install --frozen-lockfile
```

## Workspace structure

```text
apps/
  website/       Public portfolio and blog
  admin/         Administration dashboard
libs/
  core/          Application-wide providers, icons, and media helpers
  ui/            Reusable visual components
  utils/         Shared interfaces, HTTP helpers, errors, and pagination
public/          Shared static assets
styles/          Global, Material, Tailwind, and third-party styles
```

The configured import aliases are:

- `@website/app/*`
- `@admin/app/*`
- `@libs/core`
- `@libs/ui`
- `@libs/utils`

## Feature conventions

Features live under an application's `src/app/features` directory. Keep each feature organized by responsibility:

- `pages/` contains routed displays and uses Angular `httpResource` for GET requests.
- `data-access/` contains injectable services. Mutations such as POST, PATCH, PUT, and DELETE are managed with NgRx Signal Store.
- `interfaces/` contains all feature types. Interface names start with `I`; do not define types directly in components or services.
- `ui/` contains presentational components with no direct store interaction.
- New UI elements use Angular Material components.

Shared code should move into the appropriate library only when it is useful to more than one application or feature.

## Docker

Run both development servers with bind mounts and hot reload:

```bash
docker compose -f compose.dev.yml -p musanzi-wb up --build
```

Build and run both SSR applications in production mode:

```bash
docker compose -f compose.prod.yml -p musanzi-wb up --build
```

The website remains available on port `4200` and the admin dashboard on port `4300` in either mode.

## Code quality

Husky runs linting before each commit, and commitlint enforces conventional commit messages.
