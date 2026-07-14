import { DEFAULT_PROFILE, type UserProfile } from "../types/pension";

const PROFILE_KEY = "pension-simulator:profile";

export function loadProfile(): UserProfile {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return DEFAULT_PROFILE;

  try {
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
}
