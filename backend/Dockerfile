FROM node:24-alpine

LABEL version="1.0"
WORKDIR /app 

COPY package*.json .

RUN npm install

COPY src src
COPY tsconfig.json .

RUN npm run build

ARG PORT_ARG=3000
ENV PORT=$PORT_ARG

EXPOSE $PORT_ARG

ENTRYPOINT ["npm"]
CMD ["run", "start"]
