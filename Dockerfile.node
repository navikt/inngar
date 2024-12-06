FROM node:22-alpine  AS base

ENV NODE_ENV=production
ENV PORT="3000"

COPY ./node_modules /app/node_modules
COPY ./package.json /app/package.json
COPY ./build /app/build

WORKDIR /app

RUN npm i @react-router/serve

EXPOSE 3000

ENV NODE_ENV=production
CMD ["npm", "run", "start"]
