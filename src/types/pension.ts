export type EmploymentType =
  | "employee" // 사업장가입자 (직장인)
  | "self-employed" // 지역가입자 (자영업/프리랜서)
  | "unemployed"; // 미가입/실업 상태

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  employee: "직장인 (사업장가입자)",
  "self-employed": "자영업자/프리랜서 (지역가입자)",
  unemployed: "미취업/무소득",
};

export type RetirementPensionType = "DB" | "DC" | "IRP" | "none";

export const RETIREMENT_PENSION_TYPE_LABELS: Record<
  RetirementPensionType,
  string
> = {
  DB: "확정급여형 (DB)",
  DC: "확정기여형 (DC)",
  IRP: "개인형 퇴직연금 (IRP)만 운용",
  none: "퇴직연금 미가입",
};

export interface CareerGap {
  id: string;
  /** YYYY-MM 형식 */
  startMonth: string;
  /** YYYY-MM 형식 */
  endMonth: string;
  reason?: string;
}

export interface UserProfile {
  /** 출생연도 (예: 1990) */
  birthYear: number;
  employmentType: EmploymentType;
  /** 세전 월 소득 (원) */
  monthlyIncome: number;
  /** 국민연금 최초 가입 연도 */
  npEnrollStartYear: number;
  /** 실제 보험료를 납부한 총 개월 수 (공백기간 제외) */
  npEnrolledMonths: number;
  /** 가입 이력상의 공백 기간들 (실직/이직 등) */
  careerGaps: CareerGap[];
  retirementPensionType: RetirementPensionType;
  /** 현재까지 적립된 퇴직연금 잔액 (원) */
  retirementPensionBalance: number;
  /** 예상 은퇴(수급 개시 희망) 나이 */
  expectedRetirementAge: number;
  /** 연금저축 연간 납입액 (원) */
  annualPensionSavingContribution: number;
  /** IRP 연간 납입액 (원) */
  annualIRPContribution: number;
}

export const DEFAULT_PROFILE: UserProfile = {
  birthYear: 1990,
  employmentType: "employee",
  monthlyIncome: 3_500_000,
  npEnrollStartYear: 2015,
  npEnrolledMonths: 120,
  careerGaps: [],
  retirementPensionType: "DC",
  retirementPensionBalance: 20_000_000,
  expectedRetirementAge: 65,
  annualPensionSavingContribution: 4_000_000,
  annualIRPContribution: 3_000_000,
};
