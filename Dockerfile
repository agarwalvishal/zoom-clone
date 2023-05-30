FROM node:18-slim as base

WORKDIR /app
COPY package*.json ./
# Expose is not supoprted by Heroku. For dev env, docker-compose.yml has the port mapping.
# EXPOSE $PORT

FROM base as production
ENV NODE_ENV=production
# npm ci just installs existing dependencies, in contrast to npm install,
# which attempts to update current dependencies if possible. This ensures
# that the builds in continuous integration are reliable. It’s better to
# use npm i in development and npm ci for production.
RUN npm ci
COPY . .
CMD ["npm", "start"]

FROM base as develpoment
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install
COPY . .
CMD ["npm", "run", "dev"]
