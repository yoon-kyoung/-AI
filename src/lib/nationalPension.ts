import type { UserProfile } from "../types/pension";

/**
 * 2026년 기준 국민연금 파라미터.
 * 출처: 보건복지부 2025.3.20 개정법(2026.1.1 시행), 국민연금공단 고시.
 * 기준소득월액 상한/하한(2026.7~2027.6 적용분)은 공식 고시 원문 대조가
 * 되지 않아 2025.7~2026.6 적용분(확정치)을 사용한다 — 실제 적용 시점에 따라
 * 오차가 있을 수 있다.
 */
export const NP_PARAMS_2026 = {
  contributionRate: 0.095,
  incomeFloor: 400_000,
  incomeCeiling: 6_370_000,
  /** 전체 가입자 평균소득월액(A값), 2025.12~2026.11 지급 기준 */
  aValue: 3_193_511,
  /** 소득대체율 43% 고정(2026년 개혁법) 에 대응하는 공식 상수 (43% × 0.03) */
  replacementConstant: 1.29,
  fullEnrollmentMonths: 240,
} as const;

export function standardPensionAge(birthYear: number): number {
  if (birthYear <= 1956) return 61;
  if (birthYear <= 1960) return 62;
  if (birthYear <= 1964) return 63;
  if (birthYear <= 1968) return 64;
  return 65;
}

function clampIncome(monthlyIncome: number): number {
  return Math.min(
    Math.max(monthlyIncome, NP_PARAMS_2026.incomeFloor),
    NP_PARAMS_2026.incomeCeiling
  );
}

export interface NationalPensionResult {
  /** 실제 가입(납부) 개월 수 */
  enrolledMonths: number;
  /** 정상 수급 개시 나이 */
  standardAge: number;
  /** 표준 수급 개시 시 월 기본연금액 (원, 세전) */
  monthlyBasicPension: number;
  /** 사용자가 지정한 은퇴 나이에 조기/연기 감액·가산을 반영한 월 연금액 */
  adjustedMonthlyPension: number;
  /** 조기(-)/연기(+) 개월 수 */
  earlyOrDeferredMonths: number;
}

export function calculateNationalPension(profile: UserProfile): NationalPensionResult {
  const b = clampIncome(profile.monthlyIncome);
  const a = NP_PARAMS_2026.aValue;
  const fullBasic = NP_PARAMS_2026.replacementConstant * (a + b);

  const months = Math.max(0, profile.npEnrolledMonths);
  const monthlyBasicPension =
    months >= NP_PARAMS_2026.fullEnrollmentMonths
      ? fullBasic *
        (1 + (0.05 * (months - NP_PARAMS_2026.fullEnrollmentMonths)) / 12)
      : fullBasic * (months / NP_PARAMS_2026.fullEnrollmentMonths);

  const standardAge = standardPensionAge(profile.birthYear);
  const earlyOrDeferredMonths = (profile.expectedRetirementAge - standardAge) * 12;
  const clampedMonths = Math.max(-60, Math.min(60, earlyOrDeferredMonths));

  const adjustmentRate =
    clampedMonths < 0
      ? 1 + clampedMonths * 0.005 // 조기: 월 0.5% 감액
      : 1 + clampedMonths * 0.006; // 연기: 월 0.6% 가산

  return {
    enrolledMonths: months,
    standardAge,
    monthlyBasicPension: Math.round(monthlyBasicPension),
    adjustedMonthlyPension: Math.round(monthlyBasicPension * adjustmentRate),
    earlyOrDeferredMonths: clampedMonths,
  };
}

/** 가입 공백기간(개월)의 합. 공백 기간이 국민연금 가입기간에서 제외됨을 보여주기 위한 참고용 계산 */
export function totalCareerGapMonths(profile: UserProfile): number {
  return profile.careerGaps.reduce((sum, gap) => {
    if (!gap.startMonth || !gap.endMonth) return sum;
    const [sy, sm] = gap.startMonth.split("-").map(Number);
    const [ey, em] = gap.endMonth.split("-").map(Number);
    const months = (ey - sy) * 12 + (em - sm) + 1;
    return sum + Math.max(0, months);
  }, 0);
}
