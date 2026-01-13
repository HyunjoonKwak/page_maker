from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, select
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./data/app.db")

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


class Session(Base):
    """문답 세션"""
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = Column(String(20), default="in_progress")  # in_progress, completed, cancelled
    context = Column(JSON, default=dict)  # 수집된 정보


class GenerationHistory(Base):
    """생성 이력"""
    __tablename__ = "generation_history"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    product_name = Column(String(200))
    output_format = Column(String(20))  # html, image, both
    html_content = Column(Text, nullable=True)
    image_path = Column(String(500), nullable=True)


class ReferenceAnalysis(Base):
    """참고 페이지 분석 결과"""
    __tablename__ = "reference_analysis"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    screenshot_path = Column(String(500), nullable=True)
    analysis_result = Column(JSON)  # Claude Vision 분석 결과


class Template(Base):
    """상세페이지 템플릿"""
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    category = Column(String(50))  # fashion, food, electronics, etc.
    description = Column(Text, nullable=True)
    html_template = Column(Text)
    is_default = Column(Integer, default=0)


async def init_db():
    """데이터베이스 초기화"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 샘플 템플릿 시드
    await seed_templates()


async def seed_templates():
    """샘플 템플릿 시드 데이터 추가"""
    async with async_session() as session:
        # 이미 템플릿이 있으면 스킵
        result = await session.execute(select(Template))
        if result.scalars().first():
            return

        sample_templates = [
            {
                "name": "모던 미니멀",
                "category": "fashion",
                "description": "깔끔하고 세련된 패션 아이템용 템플릿",
                "is_default": 1,
                "html_template": TEMPLATE_FASHION,
            },
            {
                "name": "럭셔리 뷰티",
                "category": "beauty",
                "description": "고급스러운 화장품/뷰티 제품용 템플릿",
                "is_default": 0,
                "html_template": TEMPLATE_BEAUTY,
            },
            {
                "name": "맛있는 유혹",
                "category": "food",
                "description": "식욕을 자극하는 식품용 템플릿",
                "is_default": 1,
                "html_template": TEMPLATE_FOOD,
            },
            {
                "name": "테크 스펙",
                "category": "electronics",
                "description": "전자기기 스펙 강조 템플릿",
                "is_default": 0,
                "html_template": TEMPLATE_ELECTRONICS,
            },
            {
                "name": "홈 라이프",
                "category": "home",
                "description": "따뜻한 생활용품용 템플릿",
                "is_default": 0,
                "html_template": TEMPLATE_HOME,
            },
            {
                "name": "프리미엄 블랙",
                "category": "fashion",
                "description": "다크 테마의 프리미엄 패션 템플릿",
                "is_default": 0,
                "html_template": TEMPLATE_FASHION_DARK,
            },
            {
                "name": "싱싱 과일",
                "category": "food",
                "description": "신선한 과일 상품을 위한 자연 친화적 템플릿",
                "is_default": 0,
                "html_template": TEMPLATE_FRUIT,
            },
        ]

        for data in sample_templates:
            template = Template(**data)
            session.add(template)

        await session.commit()


# 샘플 템플릿 HTML
TEMPLATE_FASHION = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=860">
    <title>{{ product_name }} - 상세페이지</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans KR', sans-serif; background: #fff; color: #111; width: 860px; margin: 0 auto; }
        .hero { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 100px 40px; text-align: center; }
        .hero h1 { font-size: 48px; font-weight: 300; letter-spacing: 4px; margin-bottom: 16px; }
        .hero .badge { display: inline-block; border: 1px solid rgba(255,255,255,0.3); padding: 8px 24px; font-size: 12px; letter-spacing: 2px; }
        .section { padding: 80px 40px; }
        .section-title { font-size: 24px; font-weight: 600; text-align: center; margin-bottom: 48px; }
        .features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; }
        .feature { text-align: center; padding: 40px; border: 1px solid #eee; }
        .feature h3 { font-size: 18px; margin-bottom: 12px; }
        .feature p { color: #666; font-size: 14px; }
        .cta { background: #111; color: white; text-align: center; padding: 60px; }
        .cta h2 { font-size: 28px; margin-bottom: 24px; }
        .cta-btn { display: inline-block; border: 1px solid white; padding: 16px 48px; color: white; text-decoration: none; font-size: 14px; letter-spacing: 1px; }
    </style>
</head>
<body>
    <section class="hero">
        <span class="badge">{{ category }}</span>
        <h1>{{ product_name }}</h1>
    </section>
    <section class="section">
        <h2 class="section-title">FEATURES</h2>
        <div class="features">
            <div class="feature"><h3>프리미엄 소재</h3><p>최고급 원단으로 제작</p></div>
            <div class="feature"><h3>완벽한 핏</h3><p>체형을 살려주는 디자인</p></div>
            <div class="feature"><h3>디테일</h3><p>섬세한 마감 처리</p></div>
            <div class="feature"><h3>스타일링</h3><p>다양한 연출 가능</p></div>
        </div>
    </section>
    <section class="cta">
        <h2>{{ price_info }}</h2>
        <a href="#" class="cta-btn">구매하기</a>
    </section>
</body>
</html>"""

TEMPLATE_BEAUTY = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=860">
    <title>{{ product_name }} - 상세페이지</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Noto Sans KR', sans-serif; background: #fff; color: #333; width: 860px; margin: 0 auto; }
        .hero { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 100px 40px; text-align: center; }
        .hero h1 { font-size: 42px; font-weight: 700; color: #5d4037; margin-bottom: 16px; }
        .hero p { color: #795548; font-size: 18px; }
        .section { padding: 60px 40px; }
        .section-title { font-size: 28px; text-align: center; margin-bottom: 40px; color: #5d4037; }
        .benefits { background: #fff5f5; border-radius: 24px; padding: 48px; text-align: center; }
        .benefits p { font-size: 16px; color: #666; line-height: 2; }
        .ingredients { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .ingredient { background: #fafafa; padding: 32px; border-radius: 16px; text-align: center; }
        .ingredient h3 { color: #e91e63; margin-bottom: 8px; }
        .cta { background: linear-gradient(135deg, #fcb69f 0%, #ffecd2 100%); padding: 80px 40px; text-align: center; }
        .cta-btn { background: #5d4037; color: white; padding: 20px 60px; border-radius: 50px; text-decoration: none; font-weight: 600; }
    </style>
</head>
<body>
    <section class="hero">
        <h1>{{ product_name }}</h1>
        <p>{{ usp }}</p>
    </section>
    <section class="section">
        <h2 class="section-title">이런 효과가 있어요</h2>
        <div class="benefits"><p>{{ sections.benefits }}</p></div>
    </section>
    <section class="section">
        <h2 class="section-title">주요 성분</h2>
        <div class="ingredients">
            <div class="ingredient"><h3>히알루론산</h3><p>강력한 보습</p></div>
            <div class="ingredient"><h3>비타민C</h3><p>미백 케어</p></div>
            <div class="ingredient"><h3>콜라겐</h3><p>탄력 개선</p></div>
        </div>
    </section>
    <section class="cta">
        <h2 style="font-size: 32px; margin-bottom: 24px; color: #5d4037;">{{ price_info }}</h2>
        <a href="#" class="cta-btn">지금 구매하기</a>
    </section>
</body>
</html>"""

TEMPLATE_FOOD = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=860">
    <title>{{ product_name }} - 상세페이지</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Noto Sans KR', sans-serif; background: #fff; color: #333; width: 860px; margin: 0 auto; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 80px 40px; text-align: center; color: white; }
        .hero .badge { background: rgba(255,255,255,0.2); padding: 8px 20px; border-radius: 100px; font-size: 14px; display: inline-block; margin-bottom: 20px; }
        .hero h1 { font-size: 42px; font-weight: 700; margin-bottom: 16px; }
        .hero p { font-size: 18px; opacity: 0.9; }
        .section { padding: 60px 40px; }
        .section-title { font-size: 28px; font-weight: 700; text-align: center; margin-bottom: 40px; }
        .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .feature-card { background: #f8f9fa; padding: 32px; border-radius: 16px; text-align: center; }
        .feature-card h3 { margin: 16px 0 8px; font-size: 18px; }
        .feature-card p { color: #666; font-size: 14px; }
        .price-section { background: #f8f9fa; text-align: center; }
        .price-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 48px; border-radius: 24px; max-width: 400px; margin: 0 auto; }
        .price-box .amount { font-size: 48px; font-weight: 700; }
        .cta { background: #191F28; color: white; padding: 80px 40px; text-align: center; }
        .cta-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 48px; border-radius: 100px; text-decoration: none; font-weight: 600; display: inline-block; }
    </style>
</head>
<body>
    <section class="hero">
        <span class="badge">{{ category }}</span>
        <h1>{{ product_name }}</h1>
        <p>{{ sections.hero }}</p>
    </section>
    <section class="section">
        <h2 class="section-title">주요 특징</h2>
        <div class="features">
            <div class="feature-card"><div style="font-size: 32px;">✨</div><h3>프리미엄 품질</h3><p>엄선된 재료만 사용</p></div>
            <div class="feature-card"><div style="font-size: 32px;">🎯</div><h3>신선도 보장</h3><p>산지 직송 시스템</p></div>
            <div class="feature-card"><div style="font-size: 32px;">💝</div><h3>정성 가득</h3><p>장인의 손길로 제작</p></div>
        </div>
    </section>
    <section class="section price-section">
        <h2 class="section-title">합리적인 가격</h2>
        <div class="price-box"><p class="amount">{{ price_info }}</p></div>
    </section>
    <section class="cta">
        <h2 style="font-size: 32px; margin-bottom: 24px;">지금 바로 만나보세요</h2>
        <a href="#" class="cta-btn">구매하기</a>
    </section>
</body>
</html>"""

TEMPLATE_ELECTRONICS = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=860">
    <title>{{ product_name }} - 상세페이지</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans KR', sans-serif; background: #0a0a0a; color: #fff; width: 860px; margin: 0 auto; }
        .hero { background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%); padding: 100px 40px; text-align: center; }
        .hero h1 { font-size: 56px; font-weight: 700; background: linear-gradient(90deg, #00d4ff, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero p { color: #888; font-size: 18px; margin-top: 16px; }
        .section { padding: 80px 40px; }
        .section-title { font-size: 32px; font-weight: 700; text-align: center; margin-bottom: 48px; }
        .specs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .spec { background: #1a1a1a; border: 1px solid #333; border-radius: 16px; padding: 32px; }
        .spec h3 { color: #00d4ff; font-size: 14px; margin-bottom: 8px; }
        .spec p { font-size: 24px; font-weight: 600; }
        .features { background: #111; padding: 60px 40px; }
        .feature-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; text-align: center; }
        .feature-list h3 { font-size: 16px; margin-top: 12px; }
        .cta { background: linear-gradient(135deg, #7c3aed 0%, #00d4ff 100%); padding: 60px; text-align: center; }
        .cta-btn { background: white; color: #0a0a0a; padding: 20px 60px; border-radius: 8px; text-decoration: none; font-weight: 700; }
    </style>
</head>
<body>
    <section class="hero">
        <h1>{{ product_name }}</h1>
        <p>{{ usp }}</p>
    </section>
    <section class="section">
        <h2 class="section-title">스펙</h2>
        <div class="specs">
            <div class="spec"><h3>성능</h3><p>최신 프로세서</p></div>
            <div class="spec"><h3>디스플레이</h3><p>고해상도</p></div>
            <div class="spec"><h3>배터리</h3><p>장시간 사용</p></div>
            <div class="spec"><h3>연결성</h3><p>5G 지원</p></div>
        </div>
    </section>
    <section class="features">
        <div class="feature-list">
            <div><div style="font-size: 40px;">⚡</div><h3>초고속 충전</h3></div>
            <div><div style="font-size: 40px;">🔒</div><h3>보안 강화</h3></div>
            <div><div style="font-size: 40px;">🎮</div><h3>게이밍 최적화</h3></div>
        </div>
    </section>
    <section class="cta">
        <h2 style="font-size: 36px; margin-bottom: 24px;">{{ price_info }}</h2>
        <a href="#" class="cta-btn">지금 구매</a>
    </section>
</body>
</html>"""

TEMPLATE_HOME = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=860">
    <title>{{ product_name }} - 상세페이지</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Noto Sans KR', sans-serif; background: #fafaf9; color: #44403c; width: 860px; margin: 0 auto; }
        .hero { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 80px 40px; text-align: center; }
        .hero h1 { font-size: 40px; font-weight: 700; color: #78350f; margin-bottom: 16px; }
        .hero p { color: #92400e; font-size: 18px; }
        .section { padding: 60px 40px; background: white; }
        .section:nth-child(even) { background: #fafaf9; }
        .section-title { font-size: 28px; font-weight: 700; text-align: center; margin-bottom: 40px; color: #78350f; }
        .benefits { max-width: 600px; margin: 0 auto; }
        .benefit { display: flex; align-items: center; gap: 20px; padding: 20px 0; border-bottom: 1px solid #e7e5e4; }
        .benefit:last-child { border-bottom: none; }
        .benefit-icon { width: 48px; height: 48px; background: #fef3c7; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .benefit h3 { font-size: 18px; color: #44403c; }
        .cta { background: #78350f; color: white; padding: 60px 40px; text-align: center; }
        .cta-btn { background: #fef3c7; color: #78350f; padding: 16px 48px; border-radius: 100px; text-decoration: none; font-weight: 600; }
    </style>
</head>
<body>
    <section class="hero">
        <h1>{{ product_name }}</h1>
        <p>{{ usp }}</p>
    </section>
    <section class="section">
        <h2 class="section-title">이런 점이 좋아요</h2>
        <div class="benefits">
            <div class="benefit"><div class="benefit-icon">🏠</div><div><h3>공간 활용 최적화</h3></div></div>
            <div class="benefit"><div class="benefit-icon">✨</div><div><h3>세련된 디자인</h3></div></div>
            <div class="benefit"><div class="benefit-icon">💪</div><div><h3>튼튼한 내구성</h3></div></div>
            <div class="benefit"><div class="benefit-icon">🧹</div><div><h3>쉬운 관리</h3></div></div>
        </div>
    </section>
    <section class="cta">
        <h2 style="font-size: 32px; margin-bottom: 24px;">{{ price_info }}</h2>
        <a href="#" class="cta-btn">구매하기</a>
    </section>
</body>
</html>"""

TEMPLATE_FRUIT = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=860">
    <title>{{ product_name }} - 상세페이지</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Noto Sans KR', sans-serif; background: #fff; color: #333; width: 860px; margin: 0 auto; }
        .hero { background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%); padding: 100px 40px; text-align: center; color: white; position: relative; overflow: hidden; }
        .hero::before { content: '🍊🍎🍇🍑🍋'; position: absolute; font-size: 80px; opacity: 0.15; top: 20px; left: 50%; transform: translateX(-50%); letter-spacing: 20px; }
        .hero .badge { background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); padding: 10px 28px; border-radius: 100px; font-size: 14px; font-weight: 600; display: inline-block; margin-bottom: 20px; }
        .hero h1 { font-size: 48px; font-weight: 800; margin-bottom: 16px; text-shadow: 0 2px 20px rgba(0,0,0,0.1); }
        .hero p { font-size: 20px; opacity: 0.95; }
        .freshness { background: #f0fdf4; padding: 60px 40px; text-align: center; }
        .freshness-title { font-size: 32px; font-weight: 700; color: #166534; margin-bottom: 16px; }
        .freshness-desc { font-size: 18px; color: #15803d; max-width: 600px; margin: 0 auto; line-height: 1.8; }
        .section { padding: 70px 40px; }
        .section-title { font-size: 28px; font-weight: 700; text-align: center; margin-bottom: 48px; color: #166534; }
        .features { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .feature-card { background: linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%); padding: 32px 20px; border-radius: 24px; text-align: center; transition: transform 0.3s; }
        .feature-card:hover { transform: translateY(-4px); }
        .feature-icon { font-size: 48px; margin-bottom: 16px; }
        .feature-card h3 { font-size: 18px; font-weight: 700; color: #166534; margin-bottom: 8px; }
        .feature-card p { color: #15803d; font-size: 14px; }
        .origin { background: #fefce8; padding: 60px 40px; }
        .origin-content { display: flex; align-items: center; gap: 40px; max-width: 700px; margin: 0 auto; }
        .origin-icon { font-size: 80px; }
        .origin-text h3 { font-size: 24px; font-weight: 700; color: #a16207; margin-bottom: 12px; }
        .origin-text p { color: #ca8a04; font-size: 16px; line-height: 1.8; }
        .nutrition { background: white; }
        .nutrition-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .nutrition-item { background: #f0fdf4; border-radius: 20px; padding: 32px; text-align: center; border: 2px solid #bbf7d0; }
        .nutrition-value { font-size: 36px; font-weight: 800; color: #16a34a; }
        .nutrition-label { font-size: 14px; color: #166534; margin-top: 8px; }
        .cta { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 80px 40px; text-align: center; color: white; }
        .cta h2 { font-size: 36px; font-weight: 700; margin-bottom: 12px; }
        .cta .price { font-size: 48px; font-weight: 800; margin-bottom: 32px; }
        .cta-btn { background: white; color: #16a34a; padding: 20px 60px; border-radius: 100px; text-decoration: none; font-weight: 700; font-size: 18px; display: inline-block; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        .cta-btn:hover { transform: scale(1.05); }
        .guarantee { background: #dcfce7; padding: 40px; text-align: center; }
        .guarantee p { color: #166534; font-size: 16px; }
        .guarantee strong { color: #15803d; }
    </style>
</head>
<body>
    <section class="hero">
        <span class="badge">🌿 {{ category }}</span>
        <h1>{{ product_name }}</h1>
        <p>{{ usp }}</p>
    </section>
    <section class="freshness">
        <h2 class="freshness-title">🍃 산지에서 직접 배송</h2>
        <p class="freshness-desc">농장에서 갓 수확한 싱싱한 과일을 빠른 배송으로 보내드립니다. 신선함이 다릅니다.</p>
    </section>
    <section class="section">
        <h2 class="section-title">이런 점이 특별해요</h2>
        <div class="features">
            <div class="feature-card"><div class="feature-icon">🌱</div><h3>유기농 재배</h3><p>친환경 농법으로 재배</p></div>
            <div class="feature-card"><div class="feature-icon">☀️</div><h3>햇살 가득</h3><p>일조량 풍부한 산지</p></div>
            <div class="feature-card"><div class="feature-icon">💧</div><h3>깨끗한 물</h3><p>청정 지하수 사용</p></div>
            <div class="feature-card"><div class="feature-icon">📦</div><h3>신선 배송</h3><p>수확 후 당일 발송</p></div>
        </div>
    </section>
    <section class="origin">
        <div class="origin-content">
            <div class="origin-icon">🗺️</div>
            <div class="origin-text">
                <h3>엄선된 산지에서 재배</h3>
                <p>최적의 기후와 토양에서 정성껏 키운 과일입니다. 오랜 노하우를 가진 농가에서 직접 재배하여 품질을 보장합니다.</p>
            </div>
        </div>
    </section>
    <section class="section nutrition">
        <h2 class="section-title">영양 정보</h2>
        <div class="nutrition-grid">
            <div class="nutrition-item"><div class="nutrition-value">비타민C</div><div class="nutrition-label">풍부한 비타민</div></div>
            <div class="nutrition-item"><div class="nutrition-value">식이섬유</div><div class="nutrition-label">장 건강에 도움</div></div>
            <div class="nutrition-item"><div class="nutrition-value">천연 당분</div><div class="nutrition-label">자연 그대로의 단맛</div></div>
        </div>
    </section>
    <section class="cta">
        <h2>지금 주문하시면</h2>
        <p class="price">{{ price_info }}</p>
        <a href="#" class="cta-btn">🛒 신선한 과일 주문하기</a>
    </section>
    <section class="guarantee">
        <p>🛡️ <strong>100% 신선도 보장</strong> | 만족하지 않으시면 전액 환불해 드립니다</p>
    </section>
</body>
</html>"""

TEMPLATE_FASHION_DARK = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=860">
    <title>{{ product_name }} - 상세페이지</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans KR', sans-serif; background: #000; color: #fff; width: 860px; margin: 0 auto; }
        .hero { background: #000; padding: 120px 40px; text-align: center; border-bottom: 1px solid #222; }
        .hero h1 { font-size: 64px; font-weight: 200; letter-spacing: 8px; margin-bottom: 24px; }
        .hero p { color: #666; font-size: 14px; letter-spacing: 4px; text-transform: uppercase; }
        .section { padding: 80px 40px; border-bottom: 1px solid #222; }
        .section-title { font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: #666; text-align: center; margin-bottom: 48px; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: #222; }
        .grid-item { background: #000; padding: 60px 40px; text-align: center; }
        .grid-item h3 { font-size: 24px; font-weight: 300; margin-bottom: 12px; }
        .grid-item p { color: #666; font-size: 14px; }
        .cta { background: #fff; color: #000; padding: 80px 40px; text-align: center; }
        .cta h2 { font-size: 48px; font-weight: 300; margin-bottom: 32px; }
        .cta-btn { background: #000; color: #fff; padding: 20px 60px; text-decoration: none; font-size: 12px; letter-spacing: 2px; }
    </style>
</head>
<body>
    <section class="hero">
        <p>{{ category }}</p>
        <h1>{{ product_name }}</h1>
    </section>
    <section class="section">
        <h2 class="section-title">Details</h2>
        <div class="grid">
            <div class="grid-item"><h3>Material</h3><p>Premium Quality</p></div>
            <div class="grid-item"><h3>Design</h3><p>Minimalist</p></div>
            <div class="grid-item"><h3>Fit</h3><p>Perfect Silhouette</p></div>
            <div class="grid-item"><h3>Care</h3><p>Easy Maintenance</p></div>
        </div>
    </section>
    <section class="cta">
        <h2>{{ price_info }}</h2>
        <a href="#" class="cta-btn">SHOP NOW</a>
    </section>
</body>
</html>"""


async def get_db():
    """DB 세션 의존성"""
    async with async_session() as session:
        yield session
