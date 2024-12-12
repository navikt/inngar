FROM oven/bun:1 AS base

ENV NODE_ENV=production
ENV PORT="3000"

COPY ./node_modules /app/node_modules
COPY ./package.json /app/package.json
COPY ./bun.lockb /app/bun.lockb
COPY ./build /app/build
COPY ./server.ts /app/server.ts

WORKDIR /app

EXPOSE 3000

ENV NODE_ENV=production
CMD ["bun", "run", "start"]
