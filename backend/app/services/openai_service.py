import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def generate_background_image(
    category: str,
    mood: str,
    color_scheme: str = None,
    custom_prompt: str = None,
) -> str:
    """DALL-E 3로 배경 이미지 생성"""

    # 카테고리별 기본 프롬프트
    category_prompts = {
        "fashion": "elegant fashion product photography background",
        "beauty": "clean minimal beauty cosmetics background",
        "food": "appetizing food photography background",
        "electronics": "modern tech product background",
        "home": "cozy home lifestyle background",
    }

    # 분위기별 스타일
    mood_styles = {
        "luxury": "luxurious, premium, gold accents, sophisticated",
        "casual": "casual, friendly, warm colors, approachable",
        "cute": "cute, playful, pastel colors, kawaii style",
        "simple": "minimalist, clean, white space, modern",
        "professional": "professional, corporate, trustworthy, clean",
    }

    base_prompt = category_prompts.get(category, "product photography background")
    mood_style = mood_styles.get(mood, "modern and clean")

    prompt = f"""
    Create a background image for an e-commerce product detail page.
    Style: {base_prompt}
    Mood: {mood_style}
    """

    if color_scheme:
        prompt += f"\nColor scheme: {color_scheme}"

    if custom_prompt:
        prompt += f"\nAdditional requirements: {custom_prompt}"

    prompt += """

    Requirements:
    - Clean and professional
    - Suitable for overlaying product images
    - No text or logos
    - Subtle gradients or patterns
    - High quality, 1024x1024
    """

    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1024x1024",
        quality="standard",
        n=1,
    )

    return response.data[0].url
