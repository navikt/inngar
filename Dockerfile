FROM oven/bun:1 AS base

ENV NODE_ENV=production
ENV PORT="3000"

COPY ./node_modules /app/node_modules
COPY ./package.json /app/package.json
COPY ./bun.lockb /app/bun.lockb
COPY ./build /app/build

WORKDIR /app

RUN bun i @react-router/serve

EXPOSE 3000

ENV NODE_ENV=production
CMD ["bun", "run", "start"]
