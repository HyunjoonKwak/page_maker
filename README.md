# 네이버 스마트스토어 상세페이지 자동화 도구

소크라테스식 문답을 통해 상품 정보를 수집하고, AI로 네이버 스마트스토어 상세페이지를 자동 생성하는 도구입니다.

## 주요 기능

- **AI 문답 인터뷰**: 채팅형 UI로 상품 정보를 자연스럽게 수집
- **참고 페이지 분석**: Claude Vision으로 기존 상세페이지 분석
- **AI 카피라이팅**: 상품 특성에 맞는 마케팅 문구 자동 생성
- **이미지 생성**: DALL-E 3로 배경 이미지 생성
- **템플릿 갤러리**: 다양한 카테고리별 HTML 템플릿 제공
- **HTML/이미지 출력**: 완성된 상세페이지 코드 복사 및 다운로드

## 기술 스택

### Frontend
- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Zustand (상태 관리)
- React Query (API 캐싱)

### Backend
- FastAPI (Python)
- Claude API (문답 + Vision)
- OpenAI DALL-E 3 (이미지 생성)
- Playwright (HTML → 이미지)
- PostgreSQL / SQLite

## 프로젝트 구조

```
detailpage_maker/
├── frontend/               # Next.js 웹 앱
│   ├── src/
│   │   ├── app/           # 페이지 (App Router)
│   │   ├── components/    # React 컴포넌트
│   │   ├── hooks/         # React Query 훅
│   │   ├── store/         # Zustand 스토어
│   │   └── lib/           # API 클라이언트
│   └── Dockerfile
├── backend/                # FastAPI 서버
│   ├── app/
│   │   ├── routers/       # API 라우터
│   │   ├── services/      # 비즈니스 로직
│   │   └── models/        # DB 모델, 스키마
│   ├── templates/         # HTML 템플릿
│   └── Dockerfile
├── nginx/                  # Nginx 설정
├── docker-compose.yml      # 로컬 개발용
├── docker-compose.prod.yml # 프로덕션 배포용
├── manage.sh              # 로컬 개발 & GHCR 빌드
└── deploy.sh              # NAS 배포 스크립트
```

## 설치 및 실행

### 사전 요구사항

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- Anthropic API Key
- OpenAI API Key

### 로컬 개발

```bash
# 환경 변수 설정
cp .env.example .env
# .env 파일에서 API 키 설정

# Frontend
cd frontend && pnpm install && pnpm dev

# Backend
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Docker로 실행

```bash
# 환경 변수 설정
cp .env.example .env
# .env 파일에서 API 키와 DB 비밀번호 설정

# 빌드 및 실행
./manage.sh deploy

# 상태 확인
./manage.sh status

# 로그 확인
./manage.sh logs
```

접속: http://localhost:3500

## 배포 (Synology NAS)

### 1. 로컬에서 GHCR에 이미지 푸시

```bash
# GHCR 로그인
./manage.sh ghcr:login

# 이미지 빌드 및 푸시
./manage.sh ghcr:push              # latest
./manage.sh ghcr:push v1.0.0       # 특정 버전
```

### 2. NAS에서 배포

```bash
# 프로젝트 복사
scp -r detailpage_maker admin@NAS_IP:/volume1/docker/

# NAS에서 실행
cd /volume1/docker/detailpage_maker

# 환경 변수 설정
cp .env.example .env
# .env 파일 편집 (API 키, DB 비밀번호)

# GHCR 로그인 (최초 1회)
./deploy.sh login

# 배포
./deploy.sh update
```

### 관리 명령어

```bash
./deploy.sh status      # 상태 확인
./deploy.sh logs        # 전체 로그
./deploy.sh logs backend # 백엔드 로그
./deploy.sh restart     # 재시작
./deploy.sh backup      # DB 백업
./deploy.sh clean       # 정리
```

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `ANTHROPIC_API_KEY` | Anthropic API 키 | (필수) |
| `OPENAI_API_KEY` | OpenAI API 키 | (필수) |
| `POSTGRES_DB` | 데이터베이스 이름 | detailpage |
| `POSTGRES_USER` | 데이터베이스 사용자 | admin |
| `POSTGRES_PASSWORD` | 데이터베이스 비밀번호 | (필수) |
| `HTTP_PORT` | HTTP 포트 | 3500 |
| `HTTPS_PORT` | HTTPS 포트 | 3543 |

## 스크린샷

### 랜딩 페이지
AI 문답을 통한 상세페이지 생성 시작

### 문답 페이지
채팅형 UI로 상품 정보 입력

### 결과 페이지
생성된 HTML 미리보기 및 코드 복사

### 템플릿 갤러리
카테고리별 다양한 템플릿 선택

## 라이센스

MIT License
