FROM node:15.12.0 AS build

WORKDIR /lib
COPY ./lib/package.json ./lib/yarn.lock ./
RUN yarn
COPY ./lib ./
RUN yarn build

WORKDIR /server
COPY ./server/package.json ./server/yarn.lock ./
RUN yarn
COPY ./server ./
RUN yarn build

FROM node:15.12.0-alpine
COPY --from=build /server /app
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8022
EXPOSE 8022
CMD [ "node", "build/index.js" ]
