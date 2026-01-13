import os
import uuid
from typing import Dict, Any, Optional
from jinja2 import Environment, FileSystemLoader
from playwright.async_api import async_playwright

# Jinja2 환경 설정 - 현재 작업 디렉토리 기준
TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "templates")
template_env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=True,
)


async def _get_copywriting(context: Dict[str, Any], section: str) -> str:
    """AI 카피라이팅 생성 (API 키가 없으면 기본값 반환)"""
    try:
        from app.services.claude import generate_copywriting, client
        if client:
            return await generate_copywriting(context, section)
    except Exception:
        pass

    # API 키가 없거나 오류 시 기본값 반환
    product_name = context.get("product_name", "제품")
    defaults = {
        "히어로 섹션 (메인 타이틀, 서브 타이틀)": f"{product_name}과 함께하는 특별한 경험",
        "특징/장점 섹션": "최고의 품질과 합리적인 가격",
        "고객 혜택 섹션": "고객 만족을 위해 최선을 다합니다",
        "상세 정보 섹션": "상세한 정보는 판매자에게 문의해주세요",
        "구매 유도 섹션": "지금 바로 만나보세요",
    }
    return defaults.get(section, "")


async def generate_detail_page(
    context: Dict[str, Any],
    template_id: Optional[int] = None,
) -> str:
    """상세페이지 HTML 생성"""

    # 카피라이팅 생성 (API 키 없이도 기본값으로 작동)
    sections = {
        "hero": await _get_copywriting(context, "히어로 섹션 (메인 타이틀, 서브 타이틀)"),
        "features": await _get_copywriting(context, "특징/장점 섹션"),
        "benefits": await _get_copywriting(context, "고객 혜택 섹션"),
        "details": await _get_copywriting(context, "상세 정보 섹션"),
        "cta": await _get_copywriting(context, "구매 유도 섹션"),
    }

    # 템플릿 선택
    category = context.get("category", "기타").lower()
    template_path = os.path.join(TEMPLATES_DIR, f"{category}.html")
    template_name = f"{category}.html" if os.path.exists(template_path) else "default.html"

    try:
        template = template_env.get_template(template_name)
    except Exception:
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
