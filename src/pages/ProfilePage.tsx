import { useEffect, useId, useState } from "react";
import {
  DEFAULT_PROFILE,
  EMPLOYMENT_TYPE_LABELS,
  RETIREMENT_PENSION_TYPE_LABELS,
  type CareerGap,
  type EmploymentType,
  type RetirementPensionType,
  type UserProfile,
} from "../types/pension";
import { loadProfile, saveProfile } from "../lib/storage";
import "./ProfilePage.css";

function newCareerGap(): CareerGap {
  return {
    id: crypto.randomUUID(),
    startMonth: "",
    endMonth: "",
    reason: "",
  };
}

function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);
  const formId = useId();

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateGap = (id: string, patch: Partial<CareerGap>) => {
    setProfile((prev) => ({
      ...prev,
      careerGaps: prev.careerGaps.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));
    setSaved(false);
  };

  const removeGap = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      careerGaps: prev.careerGaps.filter((g) => g.id !== id),
    }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(profile);
    setSaved(true);
  };

  return (
    <main className="profile-page">
      <h1>내 프로필</h1>
      <p className="hint">
        연금 시뮬레이터 계산에 사용되는 정보입니다. 저장 시 브라우저에만 보관되며 서버로
        전송되지 않습니다.
      </p>

      <form id={formId} onSubmit={handleSubmit} className="profile-form">
        <fieldset>
          <legend>기본 정보</legend>

          <label>
            출생연도
            <input
              type="number"
              min={1940}
              max={2015}
              value={profile.birthYear}
              onChange={(e) => update("birthYear", Number(e.target.value))}
              required
            />
          </label>

          <label>
            고용형태
            <select
              value={profile.employmentType}
              onChange={(e) =>
                update("employmentType", e.target.value as EmploymentType)
              }
            >
              {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label>
            세전 월 소득 (원)
            <input
              type="number"
              min={0}
              step={10000}
              value={profile.monthlyIncome}
              onChange={(e) => update("monthlyIncome", Number(e.target.value))}
              required
            />
          </label>

          <label>
            희망 은퇴(수급 개시) 나이
            <input
              type="number"
              min={55}
              max={70}
              value={profile.expectedRetirementAge}
              onChange={(e) =>
                update("expectedRetirementAge", Number(e.target.value))
              }
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>국민연금 가입 이력</legend>

          <label>
            최초 가입 연도
            <input
              type="number"
              min={1988}
              max={2026}
              value={profile.npEnrollStartYear}
              onChange={(e) =>
                update("npEnrollStartYear", Number(e.target.value))
              }
            />
          </label>

          <label>
            실제 보험료 납부 개월 수 (공백기간 제외)
            <input
              type="number"
              min={0}
              max={600}
              value={profile.npEnrolledMonths}
              onChange={(e) =>
                update("npEnrolledMonths", Number(e.target.value))
              }
            />
          </label>

          <div className="career-gaps">
            <div className="career-gaps-header">
              <span>가입 공백 기간 (실직/이직 등)</span>
              <button
                type="button"
                onClick={() =>
                  update("careerGaps", [...profile.careerGaps, newCareerGap()])
                }
              >
                + 공백 기간 추가
              </button>
            </div>

            {profile.careerGaps.length === 0 && (
              <p className="empty">등록된 공백 기간이 없습니다.</p>
            )}

            {profile.careerGaps.map((gap) => (
              <div key={gap.id} className="career-gap-row">
                <input
                  type="month"
                  value={gap.startMonth}
                  onChange={(e) =>
                    updateGap(gap.id, { startMonth: e.target.value })
                  }
                  aria-label="공백 시작월"
                />
                <span>~</span>
                <input
                  type="month"
                  value={gap.endMonth}
                  onChange={(e) => updateGap(gap.id, { endMonth: e.target.value })}
                  aria-label="공백 종료월"
                />
                <input
                  type="text"
                  placeholder="사유 (예: 이직 준비)"
                  value={gap.reason ?? ""}
                  onChange={(e) => updateGap(gap.id, { reason: e.target.value })}
                />
                <button type="button" onClick={() => removeGap(gap.id)}>
                  삭제
                </button>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>퇴직연금</legend>

          <label>
            퇴직연금 유형
            <select
              value={profile.retirementPensionType}
              onChange={(e) =>
                update(
                  "retirementPensionType",
                  e.target.value as RetirementPensionType
                )
              }
            >
              {Object.entries(RETIREMENT_PENSION_TYPE_LABELS).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            현재 퇴직연금 적립금 (원)
            <input
              type="number"
              min={0}
              step={100000}
              value={profile.retirementPensionBalance}
              onChange={(e) =>
                update("retirementPensionBalance", Number(e.target.value))
              }
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>세액공제 (연금저축 / IRP)</legend>

          <label>
            연금저축 연간 납입액 (원)
            <input
              type="number"
              min={0}
              step={100000}
              value={profile.annualPensionSavingContribution}
              onChange={(e) =>
                update(
                  "annualPensionSavingContribution",
                  Number(e.target.value)
                )
              }
            />
          </label>

          <label>
            IRP 연간 납입액 (원)
            <input
              type="number"
              min={0}
              step={100000}
              value={profile.annualIRPContribution}
              onChange={(e) =>
                update("annualIRPContribution", Number(e.target.value))
              }
            />
          </label>
        </fieldset>

        <div className="form-actions">
          <button type="submit">프로필 저장</button>
          {saved && <span className="saved-msg">저장되었습니다.</span>}
        </div>
      </form>
    </main>
  );
}

export default ProfilePage;
