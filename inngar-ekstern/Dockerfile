FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:24-slim AS base

ENV NODE_ENV=production
ENV PORT="3000"

# Bun workspaces hoister avhengigheter til rot node_modules/.bun/
# og lager symlinker i inngar-ekstern/node_modules/ som peker dit.
# Vi må bevare mappestrukturen slik at symlinkene resolver korrekt.

# Rot node_modules (inneholder faktiske pakker i .bun/)
COPY ./node_modules /app/node_modules
# common workspace-pakke (symlinket fra inngar-ekstern/node_modules/common -> ../../common)
COPY ./common /app/common
# Inngar-ekstern filer
COPY ./inngar-ekstern/node_modules /app/inngar-ekstern/node_modules
COPY ./inngar-ekstern/package.json /app/inngar-ekstern/package.json
COPY ./inngar-ekstern/build /app/inngar-ekstern/build
COPY ./inngar-ekstern/server /app/inngar-ekstern/server

WORKDIR /app/inngar-ekstern

EXPOSE 3000

CMD ["/usr/local/bin/node", "server/server.ts", "./build/server/index.js"]
