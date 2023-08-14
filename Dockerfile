FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn build

FROM node:18-alpine
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production && \
    yarn cache clean

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
