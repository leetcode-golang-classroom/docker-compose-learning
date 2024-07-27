FROM node:20.10.0 AS base
RUN mkdir /app
WORKDIR /app
COPY ./app /app
RUN npm i -g pnpm
RUN pnpm install --prod --frozen-lockfile
FROM node:20.10.0-alpine AS prod
RUN mkdir /app
RUN mkdir -p /app/node_modules
WORKDIR /app
USER node
COPY --from=base /app/server.js /app/index.html /app/
COPY --from=base /app/node_modules /app/node_modules
ENTRYPOINT [ "node", "server.js" ]