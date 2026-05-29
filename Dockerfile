# Runtime-only image — build happens in pipeline, not in Docker
FROM node:22-alpine
WORKDIR /app
COPY dist ./dist
COPY node_modules ./node_modules
COPY package.json ./
EXPOSE 4800
ENV PORT=4800
CMD ["node", "dist/mohawk-xchange/server/main.js"]
