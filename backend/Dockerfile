# Imagen de la API. Una sola etapa a propósito: al arrancar corre las migraciones
# y el seed (que usa ts-node), así que necesita también las dependencias de desarrollo.
FROM node:20-slim

# Prisma necesita OpenSSL para su motor de consultas.
RUN apt-get update && apt-get install -y --no-install-recommends openssl && apt-get clean

WORKDIR /app

# Primero solo los manifiestos: si no cambian, Docker reutiliza la capa de npm ci.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npx prisma generate && npm run build

EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/main"]
