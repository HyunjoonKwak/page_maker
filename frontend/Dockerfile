FROM node:20-alpine AS builder

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 빌드 시 환경변수
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml ./

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY . .

# 빌드
RUN pnpm build

# 프로덕션 스테이지
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

# 프로덕션 의존성만 복사
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# 포트 노출
EXPOSE 3000

# 실행
CMD ["pnpm", "start"]
