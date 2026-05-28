FROM node:22 AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json .
RUN npm install --force
COPY frontend .
RUN npm run build && ls -la