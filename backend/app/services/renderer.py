import os
import uuid
from typing import Dict, Any, Optional
from jinja2 import Environment, FileSystemLoader
from playwright.async_api import async_playwright

from app.services.claude import generate_copywriting

# Jinja2 환경 설정
template_env = Environment(
    loader=FileSystemLoader("backend/templates"),
    autoescape=True,
)


async def generate_detail_page(
    context: Dict[str, Any],
    template_id: Optional[int] = None,
) -> str:
    """상세페이지 HTML 생성"""

    # 카피라이팅 생성
    sections = {
        "hero": await generate_copywriting(context, "히어로 섹션 (메인 타이틀, 서브 타이틀)"),
        "features": await generate_copywriting(context, "특징/장점 섹션"),
        "benefits": await generate_copywriting(context, "고객 혜택 섹션"),
        "details": await generate_copywriting(context, "상세 정보 섹션"),
        "cta": await generate_copywriting(context, "구매 유도 섹션"),
    }

    # 템플릿 선택
    category = context.get("category", "기타").lower()
    template_name = f"{category}.html" if os.path.exists(f"backend/templates/{category}.html") else "default.html"

    try:
        template = template_env.get_template(template_name)
    except:
        template = template_env.get_template("default.html")

    # HTML 렌더링
    html_content = template.render(
        product_name=context.get("product_name", ""),
        category=context.get("category", ""),
        target_customer=context.get("target_customer", ""),
        usp=context.get("usp", ""),
        price_info=context.get("price_info", ""),
        mood=context.get("mood", ""),
        product_images=context.get("product_images", []),
        sections=sections,
    )

    return html_content


async def html_to_image(html_content: str, session_id: int) -> str:
    """HTML을 이미지로 변환"""
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # 뷰포트 설정 (스마트스토어 권장 너비)
        await page.set_viewport_size({"width": 860, "height": 10000})

        # HTML 로드
        await page.set_content(html_content, wait_until="networkidle")

        # 실제 콘텐츠 높이 계산
        height = await page.evaluate("document.body.scrollHeight")
        await page.set_viewport_size({"width": 860, "height": height})

        # 스크린샷
        images_dir = "data/generated_images"
        os.makedirs(images_dir, exist_ok=True)

        filename = f"detail_page_{session_id}_{uuid.uuid4()}.png"
        filepath = os.path.join(images_dir, filename)

        await page.screenshot(path=filepath, full_page=True)

        await browser.close()

        return filepath
