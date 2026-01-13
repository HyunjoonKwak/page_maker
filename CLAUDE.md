# 네이버 스마트스토어 상세페이지 자동화 도구

## 프로젝트 개요
소크라테스식 문답을 통해 상품 정보를 수집하고, AI로 상세페이지를 자동 생성하는 도구

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
- Playwright (HTML→이미지)
- SQLite (로컬 DB)

## 프로젝트 구조
```
detailpage_maker/
├── frontend/           # Next.js 웹 앱
├── backend/            # FastAPI 서버
│   ├── app/
│   │   ├── routers/
│   │   ├── services/
│   │   └── models/
│   └── templates/      # HTML 템플릿
├── data/               # SQLite DB
└── docker-compose.yml
```

## 실행 방법

### 개발 모드
```bash
# Frontend
cd frontend && pnpm dev

# Backend
cd backend && uvicorn app.main:app --reload
```

### Docker
```bash
docker-compose up -d
```

## 주요 기능
1. 참고 페이지 분석 (Claude Vision)
2. 소크라테스식 문답
3. AI 카피라이팅 생성
4. DALL-E 배경 이미지 생성
5. HTML/이미지 출력

## 환경 변수
```
ANTHROPIC_API_KEY=xxx
OPENAI_API_KEY=xxx
```
