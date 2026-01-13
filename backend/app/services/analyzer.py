import os
import uuid
from typing import Dict, Any
from playwright.async_api import async_playwright

from app.services.claude import analyze_image_with_vision


async def capture_page(url: str) -> bytes:
    """Playwright로 페이지 캡처"""
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # 뷰포트 설정 (스마트스토어 상세페이지 기준)
        await page.set_viewport_size({"width": 860, "height": 10000})

        # 페이지 로드
        await page.goto(url, wait_until="networkidle")

        # 스크린샷 캡처
        screenshot = await page.screenshot(full_page=True)

        await browser.close()

        return screenshot


async def analyze_reference_page(url: str) -> Dict[str, Any]:
    """참고 페이지 분석"""
    # 1. 스크린샷 캡처
    screenshot_bytes = await capture_page(url)

    # 2. 스크린샷 저장
    screenshots_dir = "data/screenshots"
    os.makedirs(screenshots_dir, exist_ok=True)

    filename = f"{uuid.uuid4()}.png"
    filepath = os.path.join(screenshots_dir, filename)

    with open(filepath, "wb") as f:
        f.write(screenshot_bytes)

    # 3. Claude Vision으로 분석
    analysis = await analyze_image_with_vision(screenshot_bytes)

    # 4. 결과 반환
    return {
        **analysis,
        "screenshot_path": filepath,
    }
