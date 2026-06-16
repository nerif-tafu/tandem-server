FROM node:22-alpine AS web-build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @tandem/shared build
RUN pnpm --filter @tandem/web build

FROM node:22-alpine AS server-build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @tandem/shared build
RUN pnpm --filter @tandem/server build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3841
ENV STATIC_WEB_DIR=/app/web-dist
RUN corepack enable
COPY package.json pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
RUN pnpm install --prod --frozen-lockfile=false --filter @tandem/server...
COPY --from=server-build /app/apps/server/dist ./apps/server/dist
COPY --from=server-build /app/packages/shared/dist ./packages/shared/dist
COPY --from=web-build /app/apps/web/dist ./web-dist
EXPOSE 3841
CMD ["node", "apps/server/dist/index.js"]
