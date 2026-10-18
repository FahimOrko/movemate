FROM node:24-bookworm-slim
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /app

# Manifests first so the install layer is cached until dependencies change.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/contracts/package.json packages/contracts/
# shortcut: dev dependencies stay in the image because tsx and drizzle-kit are devDependencies; upgrade to `pnpm deploy --prod` if the image size matters.
RUN pnpm install --frozen-lockfile --filter @movemate/api...

COPY packages/contracts packages/contracts
COPY apps/api apps/api
# No emitted build (the API runs under tsx); this fails the image build on type errors.
RUN pnpm --filter @movemate/contracts --filter @movemate/api typecheck

RUN mkdir -p /data/uploads && chown -R node:node /data /app/apps/api
USER node
ENV NODE_ENV=production PORT=3000 UPLOAD_DIR=/data/uploads
EXPOSE 3000
WORKDIR /app/apps/api
CMD ["sh", "-c", "node_modules/.bin/drizzle-kit migrate && exec node_modules/.bin/tsx src/server.ts"]
