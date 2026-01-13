import { CheckCircle2 } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: '질문에 답하기',
    description: 'AI가 상품에 대해 질문합니다. 채팅하듯 편하게 답변해주세요.',
    details: ['상품명과 카테고리', '타겟 고객과 차별점', '가격과 프로모션 정보'],
  },
  {
    step: '02',
    title: 'AI가 제작',
    description: '입력한 정보를 바탕으로 AI가 전문적인 상세페이지를 만듭니다.',
    details: ['구매 유도 카피라이팅', '섹션별 레이아웃 구성', '반응형 HTML/CSS 생성'],
  },
  {
    step: '03',
    title: '코드 복사 → Figma',
    description: '완성된 코드를 복사해서 Figma에서 바로 사용하세요.',
    details: ['html.to.design 플러그인', '완전 편집 가능한 디자인', '원하는 대로 수정 가능'],
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-gray-50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        {/* 섹션 타이틀 */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
            이렇게 사용해요
          </h2>
          <p className="text-lg text-gray-600">
            3단계만 거치면 상세페이지가 완성됩니다
          </p>
        </div>

        {/* 스텝 카드 */}
        <div className="grid gap-8 lg:grid-cols-3">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className="relative rounded-3xl bg-white p-8 shadow-sm"
            >
              {/* 스텝 번호 */}
              <div className="mb-6 text-5xl font-bold text-blue-100">
                {item.step}
              </div>

              {/* 타이틀 */}
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                {item.title}
              </h3>

              {/* 설명 */}
              <p className="mb-6 text-gray-600">{item.description}</p>

              {/* 상세 항목 */}
              <ul className="space-y-3">
                {item.details.map((detail) => (
                  <li key={detail} className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
                    {detail}
                  </li>
                ))}
              </ul>

              {/* 연결선 (마지막 아이템 제외) */}
              {index < steps.length - 1 && (
                <div className="absolute -right-4 top-1/2 hidden h-0.5 w-8 bg-gray-200 lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
