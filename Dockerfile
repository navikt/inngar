FROM node:alpine AS base

ENV NODE_ENV=production
ENV PORT="3000"

COPY ./node_modules /app/node_modules
COPY ./package.json /app/package.json
COPY ./bun.lockb /app/bun.lockb
COPY ./build /app/build
COPY bunfig.toml /app/bunfig.toml
COPY ./server /app/server
# COPY server/onlyServerOtelUtils.ts /app/app/util/onlyServerOtelUtils.ts
# COPY app/loggerOld.ts /app/app/loggerOld.ts
# COPY server/server.ts /app/server.ts

WORKDIR /app

EXPOSE 3000

ENV NODE_ENV=production
CMD ["npm", "run", "start"]
