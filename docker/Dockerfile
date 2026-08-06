FROM node:22 AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json .
RUN npm install --force
COPY frontend/ ./
RUN npm run build && ls -la


FROM node:22 AS backend
WORKDIR /app/backend
COPY backend/package*.json .
RUN npm install --force
COPY backend/ ./
COPY --from=frontend /app/frontend/dist ../frontend/dist


EXPOSE 5000
CMD ["node", "server.js"]