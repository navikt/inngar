FROM node:24-alpine AS base

ENV NODE_ENV=production
ENV PORT="3000"

# Bun workspaces hoister avhengigheter til rot node_modules/.bun/
# og lager symlinker i inngar-intern/node_modules/ som peker dit.
# Vi må bevare mappestrukturen slik at symlinkene resolver korrekt.

# Rot node_modules (inneholder faktiske pakker i .bun/)
COPY ./node_modules /app/node_modules
# common workspace-pakke (symlinket fra inngar-intern/node_modules/common -> ../../common)
COPY ./common /app/common
# Inngar-intern filer
COPY ./inngar-intern/node_modules /app/inngar-intern/node_modules
COPY ./inngar-intern/package.json /app/inngar-intern/package.json
COPY ./inngar-intern/build /app/inngar-intern/build
COPY ./inngar-intern/server /app/inngar-intern/server

WORKDIR /app/inngar-intern

EXPOSE 3000

CMD ["npm", "run", "start"]
