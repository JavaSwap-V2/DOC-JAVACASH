# Etapa 1: Construcción de la app Angular
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Etapa 2: Servir con nginx
FROM nginx:alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/tupay-api-docs /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]