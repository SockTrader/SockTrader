FROM node:18-alpine

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
ENV NX_DAEMON=false

WORKDIR /app

COPY . /app

RUN apk add --no-cache --virtual .build-deps alpine-sdk python3 && \
    apk add --no-cache libc6-compat && \
    npm install && \
    apk del .build-deps && \
    npm run build:all && \
    # Re-link workspace packages to compiled dist output
    rm -rf node_modules/@socktrader && \
    mkdir -p node_modules/@socktrader && \
    ln -s /app/dist/packages/core node_modules/@socktrader/core && \
    ln -s /app/dist/packages/indicators node_modules/@socktrader/indicators && \
    ln -s /app/dist/packages/web node_modules/@socktrader/web && \
    ln -s /app/dist/packages/cli node_modules/@socktrader/cli

ENTRYPOINT ["node", "./dist/apps/demo/main.js"]
