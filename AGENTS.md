## Setup
- This app has two main apps and one shared dependency using workpaces (like in npm, but also supported by bun)
- This project uses bun and workspaces
- run `bun run --workspaces build` in root folder to build all projects
- The app uses react-router which has loaders and actions which can run on both client and serverside depending on context
  - Code imported from *.server.ts files are automatically removed from loaders and actions if (and only if) its a route which means its referenced directly in the routes.ts file (not imported, but referenced)

### The apps
- inngar-ekstern
  - For external users
  - idporten auth but implemented via the Nav made library OASIS
  - Uses nav-dekoratoren for a common header and footer for all outside facing pages. Supports server-side rendering
- inngar-intern
  - For internal users (employees)
  - Uses the `internarbeidsflatedekorator` for common header and search-bar (and holding the person in context) for many different internal apps. Loaded runtime after the app is loaded in the browser because it does not support server-side rendering
  - Uses EntraAD auth but implemented via the Nav made library OASIS
- common
  - A collection of everything that can be reused between the two apps. Some utilities can only be used server-side while other can be used both server-side and client-side