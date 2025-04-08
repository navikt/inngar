FROM node:lts-alpine AS base

ENV NODE_ENV=production
ENV PORT="3000"

COPY ./node_modules /app/node_modules
COPY ./package.json /app/package.json
COPY ./build /app/build
COPY ./server /app/server

WORKDIR /app

EXPOSE 3000

ENV NODE_ENV=production
CMD ["npm", "run", "start"]
