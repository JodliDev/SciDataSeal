# syntax=docker/dockerfile:1
ARG NODE_VERSION=20.17.0


FROM node:${NODE_VERSION}-alpine as build

RUN mkdir -p /SciDataSeal
WORKDIR /SciDataSeal

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
RUN npm run build


FROM node:${NODE_VERSION}-alpine as main
ENV NODE_ENV production

COPY --from=build /SciDataSeal/dist /SciDataSeal
COPY --from=build /SciDataSeal/docker-entrypoint.sh /SciDataSeal/docker-entrypoint.sh


WORKDIR /SciDataSeal


RUN --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev && chown -R node:node ./config

#USER node

VOLUME ./SciDataSeal/config/
EXPOSE 1304

# Run the application.
#CMD npm run run_production
ENTRYPOINT ["/bin/sh", "docker-entrypoint.sh"]
CMD ["npm run run_production"]
