FROM node:24-alpine

LABEL version="1.0"
WORKDIR /app 
RUN apk add --no-cache postgresql-client

COPY package*.json .

RUN npm install

COPY prisma prisma
COPY prisma.config.ts .

COPY src src
COPY tsconfig.json .

RUN npx prisma generate
RUN npm run build

ARG PORT_ARG=3000
ENV PORT=$PORT_ARG

EXPOSE $PORT_ARG

ENTRYPOINT ["npm"]
CMD ["run", "start"]
