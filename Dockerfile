FROM node:12.13-alpine3.9

ENV NODE_ENV production
WORKDIR /usr/src/musicorum-api/app
COPY ["package.json", "package-lock.json", "./"]

RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 4500
CMD npm start

