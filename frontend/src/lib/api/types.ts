// API 타입 정의 (백엔드 schemas.py와 동기화)

// 열거형
export type Category = 'fashion' | 'beauty' | 'food' | 'electronics' | 'home' | 'other';
export type Mood = 'luxury' | 'casual' | 'cute' | 'simple' | 'professional';
export type OutputFormat = 'html' | 'image' | 'both';
export type InputType = 'text' | 'select' | 'multiselect' | 'image_upload' | 'complete';

// 문답 관련
export interface QuestionResponse {
  question: string;
  options?: string[];
  input_type: InputType;
  field_name: string;
}

export interface AnswerRequest {
  session_id: number;
  field_name: string;
  value: string | string[] | File[];
}

export interface SessionCreate {
  reference_url?: string;
}

export interface SessionResponse {
  id: number;
  status: 'in_progress' | 'completed' | 'cancelled';
  context: Record<string, unknown>;
  created_at: string;
}

// 분석 관련
export interface AnalyzeRequest {
  url: string;
}

export interface AnalysisResult {
  layout_pattern: string;
  color_scheme: Record<string, string>;
  sections: string[];
  highlights: string[];
  tone_and_manner: string;
  screenshot_url?: string;
}

// 생성 관련
export interface GenerateRequest {
  session_id: number;
  output_format?: OutputFormat;
  template_id?: number;
}

export interface GenerateResponse {
  id: number;
  html_content?: string;
  image_url?: string;
  preview_url: string;
}

export interface BackgroundGenerateRequest {
  category: Category;
  mood: Mood;
  color_scheme?: string;
  custom_prompt?: string;
}

// 템플릿 관련
export interface TemplateCreate {
  name: string;
  category: Category;
  description?: string;
  html_template: string;
}

export interface TemplateResponse {
  id: number;
  name: string;
  category: Category;
  description?: string;
  is_default: boolean;
}

// 채팅 메시지 (프론트엔드 전용)
export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  fieldName?: string;
  inputType?: InputType;
  options?: string[];
}
