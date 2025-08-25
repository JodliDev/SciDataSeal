# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.17.0


FROM node:${NODE_VERSION}-alpine AS build

RUN mkdir -p /SciDataSeal
WORKDIR /SciDataSeal

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
RUN npm run build


FROM node:${NODE_VERSION}-alpine AS main
ENV NODE_ENV=production

COPY --from=build /SciDataSeal/dist /SciDataSeal
COPY --from=build /SciDataSeal/docker-entrypoint.sh /SciDataSeal/docker-entrypoint.sh


WORKDIR /SciDataSeal


RUN --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev && chown -R node:node ./config

#USER node

VOLUME ./SciDataSeal/config/
EXPOSE 19419

# Run the application.
ENTRYPOINT ["/bin/sh", "docker-entrypoint.sh"]
CMD ["npm run server"]
