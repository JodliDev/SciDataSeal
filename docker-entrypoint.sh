#!/bin/sh

chown -R node:node ./config

#Run command as user node:
exec su node -c "$@"
