import { MessageSquare, Eye, Wand2, Code2 } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'AI 문답',
    description: '복잡한 입력 폼 대신, AI와 대화하듯 질문에 답하세요. 필요한 정보만 자연스럽게 수집합니다.',
    color: 'bg-blue-500',
  },
  {
    icon: Eye,
    title: '참고 페이지 분석',
    description: '마음에 드는 상세페이지 URL을 입력하면, AI가 디자인 패턴을 분석해 참고합니다.',
    color: 'bg-purple-500',
  },
  {
    icon: Wand2,
    title: '자동 카피라이팅',
    description: '제품 특징을 입력하면 구매를 유도하는 전문적인 카피를 AI가 작성합니다.',
    color: 'bg-pink-500',
  },
  {
    icon: Code2,
    title: 'HTML/CSS 출력',
    description: '완성된 상세페이지를 HTML 코드로 제공합니다. Figma에서 바로 import 가능해요.',
    color: 'bg-green-500',
  },
];

export function FeatureSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        {/* 섹션 타이틀 */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
            이런 기능이 있어요
          </h2>
          <p className="text-lg text-gray-600">
            복잡한 도구 없이, 대화만으로 상세페이지를 완성하세요
          </p>
        </div>

        {/* 기능 카드 그리드 */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-3xl bg-gray-50 p-6 transition-all hover:bg-white hover:shadow-lg hover:shadow-gray-200/50"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color}`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
