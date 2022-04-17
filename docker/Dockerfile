FROM node:lts-alpine

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
ENV NX_DAEMON=false

WORKDIR /app

COPY ../ /app

RUN apk add --no-cache --virtual .build-deps alpine-sdk python3 && \
    apk add --no-cache libc6-compat && \
    npm install && \
    apk del .build-deps && \
    npm run build:all

ENTRYPOINT ["node", "./dist/apps/demo/main.js"]
