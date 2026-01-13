from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm.attributes import flag_modified
from typing import Dict, Any

from app.models.database import get_db, Session
from app.models.schemas import (
    SessionCreate,
    SessionResponse,
    AnswerRequest,
    QuestionResponse,
)
from app.services.claude import generate_next_question, generate_followup_question

router = APIRouter()


# 문답 흐름 정의
INTERVIEW_FLOW = [
    {
        "field_name": "reference_url",
        "question": "참고할 상세페이지 URL이 있나요? (선택사항)",
        "input_type": "text",
        "optional": True,
    },
    {
        "field_name": "product_name",
        "question": "어떤 상품의 상세페이지를 만들까요?",
        "input_type": "text",
    },
    {
        "field_name": "category",
        "question": "이 상품은 어떤 카테고리에 속하나요?",
        "input_type": "select",
        "options": ["패션/의류", "뷰티/화장품", "식품", "전자기기", "생활용품", "기타"],
    },
    {
        "field_name": "target_customer",
        "question": "주요 구매 고객은 누구인가요?",
        "input_type": "text",
    },
    {
        "field_name": "usp",
        "question": "이 상품만의 차별점은 무엇인가요?",
        "input_type": "text",
    },
    {
        "field_name": "price_info",
        "question": "가격대와 프로모션 정보가 있나요?",
        "input_type": "text",
    },
    {
        "field_name": "product_images",
        "question": "상품 이미지를 업로드해주세요 (선택사항)",
        "input_type": "image_upload",
        "optional": True,
    },
    {
        "field_name": "mood",
        "question": "어떤 느낌의 디자인을 원하시나요?",
        "input_type": "select",
        "options": ["고급스러운", "캐주얼한", "귀여운", "심플한", "전문적인"],
    },
]


@router.post("/sessions", response_model=SessionResponse)
async def create_session(
    request: SessionCreate,
    db: AsyncSession = Depends(get_db),
):
    """새 문답 세션 시작"""
    context = {}
    if request.reference_url:
        context["reference_url"] = str(request.reference_url)

    session = Session(context=context)
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return session


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: int,
    db: AsyncSession = Depends(get_db),
):
    """세션 정보 조회"""
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")

    return session


@router.get("/sessions/{session_id}/next-question", response_model=QuestionResponse)
async def get_next_question(
    session_id: int,
    db: AsyncSession = Depends(get_db),
):
    """다음 질문 가져오기"""
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")

    context = session.context or {}

    # 다음 질문 찾기
    for flow_item in INTERVIEW_FLOW:
        field_name = flow_item["field_name"]
        if field_name not in context:
            return QuestionResponse(
                question=flow_item["question"],
                options=flow_item.get("options"),
                input_type=flow_item["input_type"],
                field_name=field_name,
            )

    # 모든 기본 질문 완료 - AI 후속 질문 생성
    followup = await generate_followup_question(context)
    if followup:
        return followup

    # 문답 완료
    session.status = "completed"
    await db.commit()

    return QuestionResponse(
        question="모든 정보가 수집되었습니다. 상세페이지를 생성할 준비가 되었습니다!",
        input_type="complete",
        field_name="complete",
    )


@router.post("/sessions/{session_id}/answer")
async def submit_answer(
    session_id: int,
    request: AnswerRequest,
    db: AsyncSession = Depends(get_db),
):
    """답변 제출"""
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")

    # 컨텍스트 업데이트 (새 딕셔너리로 복사하여 변경 감지)
    context = dict(session.context or {})
    context[request.field_name] = request.value
    session.context = context
    flag_modified(session, "context")  # SQLAlchemy에 JSON 필드 변경 알림

    await db.commit()

    return {"success": True, "field_name": request.field_name}
