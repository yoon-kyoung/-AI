import type { UserProfile } from "../types/pension";

/**
 * 2026년 기준 연금계좌(연금저축+IRP) 세액공제 파라미터.
 * 출처: 국세청, 2023년 세법개정 이후 변동 없음 (50세 이상 한시 우대는 2022년 말 종료).
 */
export const TAX_DEDUCTION_PARAMS_2026 = {
  /** 연금저축+IRP 통합 세액공제 한도 (원/년) */
  combinedLimit: 9_000_000,
  /** 연금저축 단독 한도 (원/년) */
  pensionSavingLimit: 6_000_000,
  /** 총급여 5,500만원(종합소득 4,500만원) 이하 공제율 (지방소득세 포함) */
  higherRate: 0.165,
  /** 그 외 구간 공제율 (지방소득세 포함) */
  lowerRate: 0.132,
  /** 공제율 구간 기준 총급여 (연, 원) */
  rateThresholdAnnualSalary: 55_000_000,
} as const;

export interface TaxDeductionResult {
  /** 세액공제 대상으로 인정되는 총 납입액 (한도 적용 후) */
  deductibleContribution: number;
  /** 적용된 공제율 */
  appliedRate: number;
  /** 예상 세액공제(환급) 금액 */
  estimatedTaxSaving: number;
  /** 한도를 초과해 세액공제를 받지 못하는 금액 */
  excessContribution: number;
  /** 연금저축 한도 초과분 (IRP로 돌리면 공제 가능한 금액) */
  pensionSavingExcess: number;
  /** 최적 배분 추천: 연금저축 한도까지 채운 뒤 나머지는 IRP로 */
  recommendedPensionSaving: number;
  recommendedIRP: number;
}

export function calculateTaxDeduction(profile: UserProfile): TaxDeductionResult {
  const { combinedLimit, pensionSavingLimit, higherRate, lowerRate, rateThresholdAnnualSalary } =
    TAX_DEDUCTION_PARAMS_2026;

  const annualSalary = profile.monthlyIncome * 12;
  const appliedRate = annualSalary <= rateThresholdAnnualSalary ? higherRate : lowerRate;

  const pensionSaving = Math.max(0, profile.annualPensionSavingContribution);
  const irp = Math.max(0, profile.annualIRPContribution);
  const totalContribution = pensionSaving + irp;

  // 연금저축은 자체 한도(600만원)를 넘는 금액은 세액공제 대상에서 제외되지만,
  // 그 초과분은 IRP 한도(통합 900만원 이내)로는 인정될 수 있다.
  const pensionSavingRecognized = Math.min(pensionSaving, pensionSavingLimit);
  const pensionSavingExcess = pensionSaving - pensionSavingRecognized;

  const recognizedBeforeCombinedCap = pensionSavingRecognized + irp;
  const deductibleContribution = Math.min(recognizedBeforeCombinedCap, combinedLimit);

  const excessContribution = totalContribution - deductibleContribution;
  const estimatedTaxSaving = Math.round(deductibleContribution * appliedRate);

  // 최적 배분: 900만원 한도를 연금저축 600만원 + IRP 300만원으로 채우는 것을 우선 추천
  const recommendedPensionSaving = Math.min(pensionSavingLimit, combinedLimit);
  const recommendedIRP = combinedLimit - recommendedPensionSaving;

  return {
    deductibleContribution,
    appliedRate,
    estimatedTaxSaving,
    excessContribution: Math.max(0, excessContribution),
    pensionSavingExcess: Math.max(0, pensionSavingExcess),
    recommendedPensionSaving,
    recommendedIRP,
  };
}
