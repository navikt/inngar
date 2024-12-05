FROM gcr.io/distroless/nodejs20-debian12 AS base

ENV NODE_ENV=production
ENV PORT="3000"

COPY ./build /app

WORKDIR /app

EXPOSE 3000

ENV NODE_ENV=production
CMD ["./server/index.js"]