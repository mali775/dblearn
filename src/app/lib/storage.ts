import type { PlacementResult } from "./site-data";

type ThemeMode = "light" | "dark";

const STORAGE_KEYS = {
  users: ["db.learn.users", "users"],
  session: ["db.learn.session"],
  theme: "db.learn.theme",
  placement: "db.learn.placement-result",
  favorites: "db.learn.favorite-courses",
  progress: "db.learn.course-progress",
  completedLessons: "db.learn.course-completed-lessons",
  lessonQuizResults: "db.learn.lesson-quiz-results",
  moduleQuizResults: "db.learn.module-quiz-results",
  courseQuizResults: "db.learn.course-quiz-results",
  courseCertificates: "db.learn.course-certificates",
  courseNotes: "db.learn.course-notes",
  registrationDraft: "db.learn.registration-draft",
};

const STORAGE_EVENT = "db-learn-storage-change";

function isBrowser() {
  return typeof window !== "undefined";
}

function emitStorageChange() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function readValue<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeValue<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
  emitStorageChange();
}

export function subscribeToStorageChanges(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  window.addEventListener(STORAGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(STORAGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getStoredTheme(): ThemeMode {
  return readValue<ThemeMode>(STORAGE_KEYS.theme, "light");
}

export function setStoredTheme(theme: ThemeMode) {
  if (!isBrowser()) {
    return;
  }

  writeValue(STORAGE_KEYS.theme, theme);
}

export function applyTheme(theme: ThemeMode) {
  if (!isBrowser()) {
    return;
  }

  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function getPlacementResult() {
  return readValue<PlacementResult | null>(STORAGE_KEYS.placement, null);
}

export function savePlacementResult(result: PlacementResult) {
  writeValue(STORAGE_KEYS.placement, result);
}

export function clearPlacementResult() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.placement);
  emitStorageChange();
}

export function getFavoriteCourseIds() {
  return readValue<number[]>(STORAGE_KEYS.favorites, []);
}

export function toggleFavoriteCourse(id: number) {
  const favorites = getFavoriteCourseIds();
  const nextFavorites = favorites.includes(id)
    ? favorites.filter((item) => item !== id)
    : [...favorites, id];

  writeValue(STORAGE_KEYS.favorites, nextFavorites);
  return nextFavorites;
}

export function getCourseProgress() {
  return readValue<Record<number, number>>(STORAGE_KEYS.progress, {});
}

export function saveCourseProgress(courseId: number, progress: number) {
  const progressMap = getCourseProgress();
  writeValue(STORAGE_KEYS.progress, {
    ...progressMap,
    [courseId]: Math.max(0, Math.min(100, progress)),
  });
}

export function getCompletedLessonsMap() {
  return readValue<Record<number, string[]>>(STORAGE_KEYS.completedLessons, {});
}

export function getCompletedLessonIds(courseId: number) {
  const completedMap = getCompletedLessonsMap();
  return completedMap[courseId] ?? [];
}

export function getLessonQuizResults() {
  return readValue<Record<number, Record<string, { score: number; total: number; passed: boolean }>>>(
    STORAGE_KEYS.lessonQuizResults,
    {},
  );
}

export function getLessonQuizResult(courseId: number, lessonId: string) {
  const results = getLessonQuizResults();
  return results[courseId]?.[lessonId] ?? null;
}

export function saveLessonQuizResult(
  courseId: number,
  lessonId: string,
  result: { score: number; total: number; passed: boolean },
) {
  const results = getLessonQuizResults();
  writeValue(STORAGE_KEYS.lessonQuizResults, {
    ...results,
    [courseId]: {
      ...(results[courseId] ?? {}),
      [lessonId]: result,
    },
  });
}

export function markLessonCompleted(courseId: number, lessonId: string) {
  const completedMap = getCompletedLessonsMap();
  const currentLessons = completedMap[courseId] ?? [];

  if (currentLessons.includes(lessonId)) {
    return currentLessons;
  }

  const nextLessons = [...currentLessons, lessonId];
  writeValue(STORAGE_KEYS.completedLessons, {
    ...completedMap,
    [courseId]: nextLessons,
  });

  return nextLessons;
}

export function unmarkLessonCompleted(courseId: number, lessonId: string) {
  const completedMap = getCompletedLessonsMap();
  const currentLessons = completedMap[courseId] ?? [];
  const nextLessons = currentLessons.filter((item) => item !== lessonId);

  writeValue(STORAGE_KEYS.completedLessons, {
    ...completedMap,
    [courseId]: nextLessons,
  });

  return nextLessons;
}

export function calculateCourseProgress(completedLessonCount: number, totalLessonCount: number) {
  if (totalLessonCount <= 0) {
    return 0;
  }

  return Math.round((completedLessonCount / totalLessonCount) * 100);
}

export function getCourseQuizResults() {
  return readValue<Record<number, { score: number; total: number; passed: boolean }>>(
    STORAGE_KEYS.courseQuizResults,
    {},
  );
}

export function getCourseQuizResult(courseId: number) {
  const results = getCourseQuizResults();
  return results[courseId] ?? null;
}

export function saveCourseQuizResult(
  courseId: number,
  result: { score: number; total: number; passed: boolean },
) {
  const results = getCourseQuizResults();
  writeValue(STORAGE_KEYS.courseQuizResults, {
    ...results,
    [courseId]: result,
  });
}

export function getModuleQuizResults() {
  return readValue<
    Record<number, Record<string, { score: number; total: number; passed: boolean }>>
  >(STORAGE_KEYS.moduleQuizResults, {});
}

export function getModuleQuizResult(courseId: number, moduleId: string) {
  const results = getModuleQuizResults();
  return results[courseId]?.[moduleId] ?? null;
}

export function saveModuleQuizResult(
  courseId: number,
  moduleId: string,
  result: { score: number; total: number; passed: boolean },
) {
  const results = getModuleQuizResults();
  writeValue(STORAGE_KEYS.moduleQuizResults, {
    ...results,
    [courseId]: {
      ...(results[courseId] ?? {}),
      [moduleId]: result,
    },
  });
}

export function getCourseCertificates() {
  return readValue<Record<number, { issuedAt: string }>>(STORAGE_KEYS.courseCertificates, {});
}

export function getCourseCertificate(courseId: number) {
  const certificates = getCourseCertificates();
  return certificates[courseId] ?? null;
}

export function issueCourseCertificate(courseId: number) {
  const certificates = getCourseCertificates();
  const existing = certificates[courseId];
  if (existing) {
    return existing;
  }

  const certificate = { issuedAt: new Date().toISOString() };
  writeValue(STORAGE_KEYS.courseCertificates, {
    ...certificates,
    [courseId]: certificate,
  });
  return certificate;
}

export function getCourseNotes() {
  return readValue<Record<number, string>>(STORAGE_KEYS.courseNotes, {});
}

export function getCourseNote(courseId: number) {
  const notes = getCourseNotes();
  return notes[courseId] ?? "";
}

export function saveCourseNote(courseId: number, note: string) {
  const notes = getCourseNotes();
  writeValue(STORAGE_KEYS.courseNotes, {
    ...notes,
    [courseId]: note,
  });
}

export function getRegistrationDraft() {
  return readValue<Record<string, string>>(STORAGE_KEYS.registrationDraft, {
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });
}

export function saveRegistrationDraft(data: Record<string, string>) {
  writeValue(STORAGE_KEYS.registrationDraft, data);
}

export function clearRegistrationDraft() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.registrationDraft);
  emitStorageChange();
}

export { STORAGE_KEYS };
