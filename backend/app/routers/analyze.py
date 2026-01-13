from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import get_db, ReferenceAnalysis
from app.models.schemas import AnalyzeRequest, AnalysisResult
from app.services.analyzer import analyze_reference_page

router = APIRouter()


@router.post("/reference", response_model=AnalysisResult)
async def analyze_reference(
    request: AnalyzeRequest,
    db: AsyncSession = Depends(get_db),
):
    """참고 페이지 분석"""
    try:
        result = await analyze_reference_page(str(request.url))

        # DB에 저장
        analysis = ReferenceAnalysis(
            url=str(request.url),
            screenshot_path=result.get("screenshot_path"),
            analysis_result=result,
        )
        db.add(analysis)
        await db.commit()

        return AnalysisResult(
            layout_pattern=result.get("layout_pattern", ""),
            color_scheme=result.get("color_scheme", {}),
            sections=result.get("sections", []),
            highlights=result.get("highlights", []),
            tone_and_manner=result.get("tone_and_manner", ""),
            screenshot_url=result.get("screenshot_path"),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"분석 실패: {str(e)}")
