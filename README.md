# inngar
App for å starte arbeidsoppfølging

### Troubleshooting

<details>
  <summary>Error when evaluating SSR module virtual:react-router/server-build: Unexpected token 'export'</summary>
  (node:98469) Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension.
(Use `node --trace-warnings ...` to show where the warning was created)
15:43:25 [vite] (ssr) Error when evaluating SSR module virtual:react-router/server-build: Unexpected token 'export'
      at internalCompileFunction (node:internal/vm:73:18)
      at wrapSafe (node:internal/modules/cjs/loader:1153:20)
      at Module._compile (node:internal/modules/cjs/loader:1205:27)
      at Object.Module._extensions..js (node:internal/modules/cjs/loader:1295:10)
      at Module.load (node:internal/modules/cjs/loader:1091:32)
      at Function.Module._load (node:internal/modules/cjs/loader:938:12)
      at cjsLoader (node:internal/modules/esm/translators:284:17)
      at ModuleWrap.<anonymous> (node:internal/modules/esm/translators:234:7)
      at ModuleJob.run (node:internal/modules/esm/module_job:217:25)
      at ModuleLoader.import (node:internal/modules/esm/loader:316:24)
15:43:25 [vite] Internal server error: Unexpected token 'export'
      at internalCompileFunction (node:internal/vm:73:18)
      at wrapSafe (node:internal/modules/cjs/loader:1153:20)
      at Module._compile (node:internal/modules/cjs/loader:1205:27)
      at Object.Module._extensions..js (node:internal/modules/cjs/loader:1295:10)
      at Module.load (node:internal/modules/cjs/loader:1091:32)
      at Function.Module._load (node:internal/modules/cjs/loader:938:12)
      at cjsLoader (node:internal/modules/esm/translators:284:17)
      at ModuleWrap.<anonymous> (node:internal/modules/esm/translators:234:7)
      at ModuleJob.run (node:internal/modules/esm/module_job:217:25)
      at ModuleLoader.import (node:internal/modules/esm/loader:316:24)
</details>

Løsning: Bruk node 22