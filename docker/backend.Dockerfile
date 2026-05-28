FROM node:22 AS backend
WORKDIR /app/backend
COPY backend/package*.json .
RUN npm install --force
COPY backend/ ./

EXPOSE 5000
CMD ["node", "server.js"]