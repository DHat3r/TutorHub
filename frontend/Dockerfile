# Imagen del frontend en dos etapas: se compila con todas las dependencias
# y se ejecuta solo con lo necesario.
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Next.js incrusta las variables NEXT_PUBLIC_* al compilar, por eso van como build arg.
ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
RUN npm run build

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
