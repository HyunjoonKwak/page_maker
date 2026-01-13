from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routers import interview, generate, templates, analyze
from app.models.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작/종료 시 실행"""
    # 시작 시
    await init_db()
    yield
    # 종료 시


app = FastAPI(
    title="상세페이지 자동화 API",
    description="네이버 스마트스토어 상세페이지 자동 생성 서비스",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(interview.router, prefix="/api/interview", tags=["문답"])
app.include_router(generate.router, prefix="/api/generate", tags=["생성"])
app.include_router(templates.router, prefix="/api/templates", tags=["템플릿"])
app.include_router(analyze.router, prefix="/api/analyze", tags=["분석"])


@app.get("/")
async def root():
    return {"message": "상세페이지 자동화 API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
