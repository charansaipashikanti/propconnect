FROM node:22 AS frontend
WORKDIR /app
COPY frontend/package*.json .
RUN npm install --force
COPY frontend/ ./
RUN npm run build && ls -la

FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY --from=frontend /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]