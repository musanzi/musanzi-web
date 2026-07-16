## Feature

When creating a UI element, make sure it uses Angular Material UI elements.

### Folder structure

- `data-access` for services: use `@Service()` and NgRx Signal Store for mutations (POST, PATCH, UPDATE and DELETE).
- `pages` for different displays and use httpRessource for data retrieval (GET).
- `interfaces` for types, starting with `I`, for example `ISignInPayload`. No type should be defined directly in components or services.
- `ui` for visual elements with no direct interaction with the store.
