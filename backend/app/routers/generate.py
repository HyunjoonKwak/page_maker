from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os

from app.models.database import get_db, Session, GenerationHistory
from app.models.schemas import GenerateRequest, GenerateResponse, BackgroundGenerateRequest
from app.services.renderer import generate_detail_page, html_to_image
from app.services.openai_service import generate_background_image

router = APIRouter()


@router.post("/detail-page", response_model=GenerateResponse)
async def generate_detail_page_api(
    request: GenerateRequest,
    db: AsyncSession = Depends(get_db),
):
    """상세페이지 생성"""
    # 세션 조회
    result = await db.execute(select(Session).where(Session.id == request.session_id))
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")

    if session.status != "completed":
        raise HTTPException(status_code=400, detail="문답이 완료되지 않았습니다")

    context = session.context

    try:
        # HTML 생성
        html_content = await generate_detail_page(context, request.template_id)

        # 이미지 생성 (필요시)
        image_path = None
        if request.output_format in ["image", "both"]:
            image_path = await html_to_image(html_content, session.id)

        # 이력 저장
        history = GenerationHistory(
            session_id=session.id,
            product_name=context.get("product_name", ""),
            output_format=request.output_format,
            html_content=html_content if request.output_format in ["html", "both"] else None,
            image_path=image_path,
        )
        db.add(history)
        await db.commit()
        await db.refresh(history)

        return GenerateResponse(
            id=history.id,
            html_content=html_content if request.output_format in ["html", "both"] else None,
            image_url=f"/api/generate/images/{history.id}" if image_path else None,
            preview_url=f"/api/generate/preview/{history.id}",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"생성 실패: {str(e)}")


@router.get("/images/{history_id}")
async def get_generated_image(
    history_id: int,
    db: AsyncSession = Depends(get_db),
):
    """생성된 이미지 다운로드"""
    result = await db.execute(
        select(GenerationHistory).where(GenerationHistory.id == history_id)
    )
    history = result.scalar_one_or_none()

    if not history or not history.image_path:
        raise HTTPException(status_code=404, detail="이미지를 찾을 수 없습니다")

    if not os.path.exists(history.image_path):
        raise HTTPException(status_code=404, detail="이미지 파일이 존재하지 않습니다")

    return FileResponse(
        history.image_path,
        media_type="image/png",
        filename=f"detail_page_{history_id}.png",
    )


@router.post("/background-image")
async def generate_background(request: BackgroundGenerateRequest):
    """배경 이미지 생성 (DALL-E)"""
    try:
        image_url = await generate_background_image(
            category=request.category,
            mood=request.mood,
            color_scheme=request.color_scheme,
            custom_prompt=request.custom_prompt,
        )
        return {"image_url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이미지 생성 실패: {str(e)}")
