import anthropic
import base64
import os
from typing import Optional, Dict, Any

from app.models.schemas import QuestionResponse

# API 키가 없으면 None으로 설정 (나중에 사용 시 에러 처리)
_api_key = os.getenv("ANTHROPIC_API_KEY")
client = anthropic.Anthropic(api_key=_api_key) if _api_key else None


async def generate_followup_question(context: Dict[str, Any]) -> Optional[QuestionResponse]:
    """맥락 기반 후속 질문 생성"""
    # API 키가 없으면 후속 질문 없이 완료 처리
    if not client:
        return None

    prompt = f"""
현재까지 수집된 상품 정보:
{context}

위 정보를 바탕으로, 상세페이지 생성에 필요한 추가 정보가 있다면
1개의 후속 질문을 생성하세요.

충분한 정보가 수집되었다면 "COMPLETE"라고만 응답하세요.

후속 질문이 필요하다면 다음 JSON 형식으로 응답하세요:
{{
    "question": "질문 내용",
    "field_name": "필드명 (영문, snake_case)",
    "input_type": "text 또는 select",
    "options": ["옵션1", "옵션2"]  // select인 경우만
}}
"""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}],
    )

    response_text = message.content[0].text.strip()

    if response_text == "COMPLETE":
        return None

    try:
        import json
        data = json.loads(response_text)
        return QuestionResponse(
            question=data["question"],
            field_name=data["field_name"],
            input_type=data.get("input_type", "text"),
            options=data.get("options"),
        )
    except:
        return None


async def generate_next_question(context: Dict[str, Any]) -> QuestionResponse:
    """다음 질문 생성 (사용되지 않음 - 기본 흐름 사용)"""
    pass


async def analyze_image_with_vision(image_bytes: bytes) -> Dict[str, Any]:
    """Claude Vision으로 이미지 분석"""
    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": base64_image,
                        },
                    },
                    {
                        "type": "text",
                        "text": """이 스마트스토어 상세페이지 이미지를 분석해주세요.
다음 항목들을 JSON 형식으로 응답해주세요:

{
    "layout_pattern": "레이아웃 패턴 설명 (섹션 배치, 여백, 정렬)",
    "color_scheme": {
        "primary": "#색상코드",
        "secondary": "#색상코드",
        "background": "#색상코드",
        "accent": "#색상코드"
    },
    "sections": ["섹션1", "섹션2", ...],
    "highlights": ["눈에 띄는 디자인 요소1", ...],
    "tone_and_manner": "전체적인 톤앤매너 (고급스러운/캐주얼/귀여운 등)"
}
""",
                    },
                ],
            }
        ],
    )

    try:
        import json
        return json.loads(message.content[0].text)
    except:
        return {
            "layout_pattern": "분석 실패",
            "color_scheme": {},
            "sections": [],
            "highlights": [],
            "tone_and_manner": "",
        }


async def generate_copywriting(context: Dict[str, Any], section: str) -> str:
    """섹션별 카피라이팅 생성"""
    prompt = f"""
상품 정보:
- 상품명: {context.get('product_name', '')}
- 카테고리: {context.get('category', '')}
- 타겟 고객: {context.get('target_customer', '')}
- 차별점(USP): {context.get('usp', '')}
- 가격/프로모션: {context.get('price_info', '')}
- 분위기: {context.get('mood', '')}

위 정보를 바탕으로 상세페이지의 "{section}" 섹션에 들어갈
매력적인 카피라이팅을 작성해주세요.

- 타겟 고객의 언어로 작성
- 감성적이면서도 정보 전달이 명확하게
- 적절한 이모지 사용 가능
"""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}],
    )

    return message.content[0].text.strip()
