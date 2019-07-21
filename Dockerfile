FROM node:10.16-alpine

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app
COPY tsconfig.json /app
COPY src ./src

RUN apk add --no-cache --virtual .build-deps alpine-sdk python && \
    apk add --no-cache libc6-compat && \
    npm install --production --silent && \
    apk del .build-deps && \
    npm run build

ENTRYPOINT ["node", "./build/index.js"]
