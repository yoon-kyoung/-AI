import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadProfile } from "../lib/storage";
import type { UserProfile } from "../types/pension";
import {
  calculateNationalPension,
  totalCareerGapMonths,
} from "../lib/nationalPension";
import { calculateRetirementPension } from "../lib/retirementPension";
import { calculateTaxDeduction } from "../lib/taxDeduction";
import "./PensionSimulatorPage.css";

function won(n: number): string {
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}

function PensionSimulatorPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const nationalPension = useMemo(
    () => (profile ? calculateNationalPension(profile) : null),
    [profile]
  );

  const gapMonths = useMemo(
    () => (profile ? totalCareerGapMonths(profile) : 0),
    [profile]
  );

  const nationalPensionNoGap = useMemo(() => {
    if (!profile || gapMonths === 0) return null;
    return calculateNationalPension({
      ...profile,
      npEnrolledMonths: profile.npEnrolledMonths + gapMonths,
    });
  }, [profile, gapMonths]);

  const retirementPension = useMemo(
    () => (profile ? calculateRetirementPension(profile) : null),
    [profile]
  );

  const taxDeduction = useMemo(
    () => (profile ? calculateTaxDeduction(profile) : null),
    [profile]
  );

  if (!profile) return null;

  const totalMonthlyPension =
    (nationalPension?.adjustedMonthlyPension ?? 0) +
    (retirementPension?.estimatedMonthlyPayout ?? 0);

  return (
    <main className="simulator-page">
      <h1>연금 시뮬레이터</h1>
      <p className="hint">
        <Link to="/profile">내 프로필</Link>에 입력한 값을 기준으로 계산됩니다.
        아래 결과는 2026년 기준 제도(국민연금 개혁법, 세액공제 한도 등)를 반영한 추정치이며,
        실제 수급액과 차이가 있을 수 있습니다.
      </p>

      <section className="card">
        <h2>국민연금</h2>
        {nationalPension && (
          <ul className="result-list">
            <li>
              <span>가입(납부) 개월 수</span>
              <strong>{nationalPension.enrolledMonths}개월</strong>
            </li>
            <li>
              <span>정상 수급 개시 나이</span>
              <strong>{nationalPension.standardAge}세</strong>
            </li>
            <li>
              <span>표준 수급 시 월 기본연금액</span>
              <strong>{won(nationalPension.monthlyBasicPension)}</strong>
            </li>
            <li>
              <span>
                희망 은퇴나이({profile.expectedRetirementAge}세) 반영 월 연금액
                {nationalPension.earlyOrDeferredMonths !== 0 && (
                  <>
                    {" "}
                    ({nationalPension.earlyOrDeferredMonths > 0 ? "연기" : "조기"}{" "}
                    {Math.abs(nationalPension.earlyOrDeferredMonths)}개월)
                  </>
                )}
              </span>
              <strong>{won(nationalPension.adjustedMonthlyPension)}</strong>
            </li>
          </ul>
        )}

        {gapMonths > 0 && nationalPensionNoGap && (
          <div className="gap-scenario">
            <h3>공백 시나리오 비교</h3>
            <p>
              등록된 가입 공백 기간 합계: <strong>{gapMonths}개월</strong>
            </p>
            <p>
              공백이 없었다면 월 기본연금액은{" "}
              <strong>{won(nationalPensionNoGap.monthlyBasicPension)}</strong>
              으로, 현재 대비{" "}
              <strong>
                {won(
                  nationalPensionNoGap.monthlyBasicPension -
                    nationalPension!.monthlyBasicPension
                )}
              </strong>{" "}
              더 많았을 것으로 추정됩니다.
            </p>
          </div>
        )}
      </section>

      <section className="card">
        <h2>퇴직연금</h2>
        {retirementPension && (
          <ul className="result-list">
            <li>
              <span>은퇴까지 남은 기간</span>
              <strong>{retirementPension.yearsToRetirement}년</strong>
            </li>
            <li>
              <span>은퇴 시점 예상 적립금</span>
              <strong>{won(retirementPension.projectedLumpSum)}</strong>
            </li>
            <li>
              <span>20년 분할 수령 가정 시 월 수령액</span>
              <strong>{won(retirementPension.estimatedMonthlyPayout)}</strong>
            </li>
          </ul>
        )}
      </section>

      <section className="card highlight">
        <h2>통합 예상 월 연금 (국민연금 + 퇴직연금)</h2>
        <p className="total-pension">{won(totalMonthlyPension)}</p>
      </section>

      <section className="card">
        <h2>세액공제 최적화 (연금저축 + IRP)</h2>
        {taxDeduction && (
          <>
            <ul className="result-list">
              <li>
                <span>현재 연간 납입액</span>
                <strong>
                  {won(
                    profile.annualPensionSavingContribution +
                      profile.annualIRPContribution
                  )}
                </strong>
              </li>
              <li>
                <span>세액공제 인정 금액</span>
                <strong>{won(taxDeduction.deductibleContribution)}</strong>
              </li>
              <li>
                <span>적용 공제율</span>
                <strong>{(taxDeduction.appliedRate * 100).toFixed(1)}%</strong>
              </li>
              <li>
                <span>예상 세액공제(환급) 금액</span>
                <strong>{won(taxDeduction.estimatedTaxSaving)}</strong>
              </li>
              {taxDeduction.excessContribution > 0 && (
                <li>
                  <span>한도 초과로 공제 못 받는 금액</span>
                  <strong className="warn">
                    {won(taxDeduction.excessContribution)}
                  </strong>
                </li>
              )}
            </ul>

            <div className="recommendation">
              <h3>추천 배분</h3>
              <p>
                연금저축 <strong>{won(taxDeduction.recommendedPensionSaving)}</strong> +
                IRP <strong>{won(taxDeduction.recommendedIRP)}</strong> 으로 납입하면
                통합 한도(900만원)를 최대한 활용할 수 있습니다.
              </p>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default PensionSimulatorPage;
