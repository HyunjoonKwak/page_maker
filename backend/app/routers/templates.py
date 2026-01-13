from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.models.database import get_db, Template
from app.models.schemas import TemplateCreate, TemplateResponse

router = APIRouter()


@router.get("/", response_model=List[TemplateResponse])
async def list_templates(
    category: str = None,
    db: AsyncSession = Depends(get_db),
):
    """템플릿 목록 조회"""
    query = select(Template)
    if category:
        query = query.where(Template.category == category)

    result = await db.execute(query)
    templates = result.scalars().all()

    return templates


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
):
    """템플릿 상세 조회"""
    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=404, detail="템플릿을 찾을 수 없습니다")

    return template


@router.post("/", response_model=TemplateResponse)
async def create_template(
    request: TemplateCreate,
    db: AsyncSession = Depends(get_db),
):
    """새 템플릿 생성"""
    template = Template(
        name=request.name,
        category=request.category,
        description=request.description,
        html_template=request.html_template,
    )
    db.add(template)
    await db.commit()
    await db.refresh(template)

    return template


@router.delete("/{template_id}")
async def delete_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
):
    """템플릿 삭제"""
    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=404, detail="템플릿을 찾을 수 없습니다")

    await db.delete(template)
    await db.commit()

    return {"success": True}
