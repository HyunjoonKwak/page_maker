from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./data/app.db")

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


class Session(Base):
    """문답 세션"""
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = Column(String(20), default="in_progress")  # in_progress, completed, cancelled
    context = Column(JSON, default=dict)  # 수집된 정보


class GenerationHistory(Base):
    """생성 이력"""
    __tablename__ = "generation_history"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    product_name = Column(String(200))
    output_format = Column(String(20))  # html, image, both
    html_content = Column(Text, nullable=True)
    image_path = Column(String(500), nullable=True)


class ReferenceAnalysis(Base):
    """참고 페이지 분석 결과"""
    __tablename__ = "reference_analysis"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    screenshot_path = Column(String(500), nullable=True)
    analysis_result = Column(JSON)  # Claude Vision 분석 결과


class Template(Base):
    """상세페이지 템플릿"""
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    category = Column(String(50))  # fashion, food, electronics, etc.
    description = Column(Text, nullable=True)
    html_template = Column(Text)
    is_default = Column(Integer, default=0)


async def init_db():
    """데이터베이스 초기화"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    """DB 세션 의존성"""
    async with async_session() as session:
        yield session
