from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class Category(str, Enum):
    FASHION = "fashion"
    BEAUTY = "beauty"
    FOOD = "food"
    ELECTRONICS = "electronics"
    HOME = "home"
    OTHER = "other"


class Mood(str, Enum):
    LUXURY = "luxury"
    CASUAL = "casual"
    CUTE = "cute"
    SIMPLE = "simple"
    PROFESSIONAL = "professional"


class OutputFormat(str, Enum):
    HTML = "html"
    IMAGE = "image"
    BOTH = "both"


# === 문답 관련 ===

class QuestionResponse(BaseModel):
    """AI가 생성한 질문"""
    question: str
    options: Optional[List[str]] = None
    input_type: str = "text"  # text, select, multiselect, image_upload
    field_name: str


class AnswerRequest(BaseModel):
    """사용자 답변"""
    session_id: int
    field_name: str
    value: Any


class SessionCreate(BaseModel):
    """세션 생성"""
    reference_url: Optional[str] = None


class SessionResponse(BaseModel):
    """세션 응답"""
    id: int
    status: str
    context: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


# === 분석 관련 ===

class AnalyzeRequest(BaseModel):
    """참고 페이지 분석 요청"""
    url: HttpUrl


class AnalysisResult(BaseModel):
    """분석 결과"""
    layout_pattern: str
    color_scheme: Dict[str, str]
    sections: List[str]
    highlights: List[str]
    tone_and_manner: str
    screenshot_url: Optional[str] = None


# === 생성 관련 ===

class GenerateRequest(BaseModel):
    """상세페이지 생성 요청"""
    session_id: int
    output_format: OutputFormat = OutputFormat.BOTH
    template_id: Optional[int] = None


class GenerateResponse(BaseModel):
    """생성 결과"""
    id: int
    html_content: Optional[str] = None
    image_url: Optional[str] = None
    preview_url: str


# === 템플릿 관련 ===

class TemplateBase(BaseModel):
    name: str
    category: Category
    description: Optional[str] = None


class TemplateCreate(TemplateBase):
    html_template: str


class TemplateResponse(TemplateBase):
    id: int
    is_default: bool

    class Config:
        from_attributes = True


# === 이미지 생성 관련 ===

class BackgroundGenerateRequest(BaseModel):
    """배경 이미지 생성 요청"""
    category: Category
    mood: Mood
    color_scheme: Optional[str] = None
    custom_prompt: Optional[str] = None
