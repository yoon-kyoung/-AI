import type { UserProfile } from "../types/pension";

export interface RetirementPensionOptions {
  /** 연 평균 운용수익률 (DC/IRP 적립금에 적용), 기본 3% */
  annualReturnRate?: number;
}

export interface RetirementPensionResult {
  /** 은퇴 시점까지 남은 년수 */
  yearsToRetirement: number;
  /** 은퇴 시점 예상 퇴직연금 적립금 총액 (DC/IRP 운용 가정) */
  projectedLumpSum: number;
  /** 위 적립금을 20년간 균등 수령한다고 가정한 월 수령액 */
  estimatedMonthlyPayout: number;
}

const DEFAULT_RETURN_RATE = 0.03;
const PAYOUT_YEARS = 20;

export function getCurrentAge(birthYear: number): number {
  const thisYear = new Date().getFullYear();
  return thisYear - birthYear;
}

export function calculateRetirementPension(
  profile: UserProfile,
  options: RetirementPensionOptions = {}
): RetirementPensionResult {
  const annualReturnRate = options.annualReturnRate ?? DEFAULT_RETURN_RATE;
  const currentAge = getCurrentAge(profile.birthYear);
  const yearsToRetirement = Math.max(
    0,
    profile.expectedRetirementAge - currentAge
  );

  if (profile.retirementPensionType === "none") {
    return { yearsToRetirement, projectedLumpSum: 0, estimatedMonthlyPayout: 0 };
  }

  // DC/IRP: 근로자퇴직급여보장법 제20조에 따라 회사가 연간 임금총액의 1/12 이상을
  // 매년 납입한다고 가정(= 월급 1개월치). 여기에 IRP 개인 추가 납입을 더해
  // 기존 적립금과 함께 복리로 운용한다고 가정.
  const annualEmployerContribution = profile.monthlyIncome;
  const annualPersonalContribution =
    profile.retirementPensionType === "IRP" ? profile.annualIRPContribution : 0;
  const annualContribution = annualEmployerContribution + annualPersonalContribution;

  let balance = profile.retirementPensionBalance;
  for (let year = 0; year < yearsToRetirement; year++) {
    balance = balance * (1 + annualReturnRate) + annualContribution;
  }

  const estimatedMonthlyPayout = balance / (PAYOUT_YEARS * 12);

  return {
    yearsToRetirement,
    projectedLumpSum: Math.round(balance),
    estimatedMonthlyPayout: Math.round(estimatedMonthlyPayout),
  };
}
