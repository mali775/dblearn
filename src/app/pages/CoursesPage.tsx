import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Heart,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ScrollToTopButton } from "../components/ScrollToTopButton";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useToast } from "../components/ToastProvider";
import {
  courses,
  getCourseLessonCount,
  type CourseDifficulty,
  type CourseItem,
} from "../lib/site-data";
import {
  calculateCourseProgress,
  getCompletedLessonsMap,
  getCourseQuizResults,
  getFavoriteCourseIds,
  getPlacementResult,
  subscribeToStorageChanges,
  toggleFavoriteCourse,
} from "../lib/storage";

type SortOption = "title-asc" | "title-desc" | "rating-desc" | "progress-desc";
type TabOption = "recommended" | "all" | "favorites";

function formatCoursePrice(price: number) {
  return price <= 0 ? "Тегін" : `${price.toLocaleString("kk-KZ")} ₸`;
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"all" | CourseDifficulty>("all");
  const [sortOption, setSortOption] = useState<SortOption>("title-asc");
  const [activeTab, setActiveTab] = useState<TabOption>("recommended");
  const [openAccordion, setOpenAccordion] = useState<number | null>(1);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<number[]>(getFavoriteCourseIds());
  const [progressMap, setProgressMap] = useState<Record<number, number>>(() => {
    const completedLessonsMap = getCompletedLessonsMap();

    return courses.reduce<Record<number, number>>((acc, course) => {
      const completedCount = completedLessonsMap[course.id]?.length ?? 0;
      const totalLessons = getCourseLessonCount(course.id);
      acc[course.id] = calculateCourseProgress(completedCount, totalLessons);
      return acc;
    }, {});
  });
  const [placementResult, setPlacementResult] = useState(getPlacementResult());
  const [quizResults, setQuizResults] = useState(getCourseQuizResults());
  const { showToast } = useToast();

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 900);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    setLoading(true);
    const timeout = window.setTimeout(() => setLoading(false), 320);
    return () => window.clearTimeout(timeout);
  }, [searchQuery, selectedDifficulty, sortOption, activeTab]);

  useEffect(() => {
    return subscribeToStorageChanges(() => {
      setFavoriteIds(getFavoriteCourseIds());
      const completedLessonsMap = getCompletedLessonsMap();
      setProgressMap(
        courses.reduce<Record<number, number>>((acc, course) => {
          const completedCount = completedLessonsMap[course.id]?.length ?? 0;
          const totalLessons = getCourseLessonCount(course.id);
          acc[course.id] = calculateCourseProgress(completedCount, totalLessons);
          return acc;
        }, {}),
      );
      setQuizResults(getCourseQuizResults());
      setPlacementResult(getPlacementResult());
    });
  }, []);

  const recommendedIds = placementResult?.recommendedCourseIds ?? [];
  const recommendedCourses = useMemo(
    () => courses.filter((course) => recommendedIds.includes(course.id)),
    [recommendedIds],
  );

  const filteredCourses = useMemo(() => {
    const source =
      activeTab === "favorites"
        ? courses.filter((course) => favoriteIds.includes(course.id))
        : activeTab === "recommended" && placementResult
          ? recommendedCourses
          : courses;

    return [...source]
      .filter((course) => {
        const matchesSearch = `${course.title} ${course.excerpt} ${course.category}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesDifficulty =
          selectedDifficulty === "all" || course.difficulty === selectedDifficulty;
        return matchesSearch && matchesDifficulty;
      })
      .sort((a, b) => {
        if (sortOption === "title-asc") return a.title.localeCompare(b.title, "kk-KZ");
        if (sortOption === "title-desc") return b.title.localeCompare(a.title, "kk-KZ");
        if (sortOption === "rating-desc") return b.rating - a.rating;
        return (progressMap[b.id] ?? 0) - (progressMap[a.id] ?? 0);
      });
  }, [
    activeTab,
    favoriteIds,
    placementResult,
    progressMap,
    recommendedCourses,
    searchQuery,
    selectedDifficulty,
    sortOption,
  ]);

  const averageProgress =
    Object.values(progressMap).length > 0
      ? Math.round(
          Object.values(progressMap).reduce((sum, value) => sum + value, 0) /
            Object.values(progressMap).length,
        )
      : 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />
      <main className="flex-1">
        <section className="border-b border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div>
                <h1 className="text-4xl font-black text-[#0A2463] dark:text-sky-200">SQL Курстары</h1>
                <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
                  Іздеу, фильтр, сұрыптау, popup modal, favorite, progress, accordion және recommendation жүйесі осы бетте жұмыс істейді.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Курстар саны</p>
                  <p className="mt-2 text-2xl font-bold">{courses.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Favorite</p>
                  <p className="mt-2 text-2xl font-bold">{favoriteIds.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Орташа прогресс</p>
                  <p className="mt-2 text-2xl font-bold">{averageProgress}%</p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[1.75rem] bg-[#061a40] px-6 py-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-sky-200">Recommendation Engine</p>
                  <h2 className="mt-2 text-2xl font-black">
                    {placementResult ? `Сіздің деңгейіңіз: ${placementResult.level}` : "Барлық курстар ашық"}
                  </h2>
                  <p className="mt-2 text-slate-200">
                    {placementResult
                      ? `Ұсынылатын курстар саны: ${placementResult.recommendedCourseIds.length}`
                      : "Деңгей тестін тапсырсаңыз, ұсынылатын бағыт автоматты түрде есептеледі."}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 px-5 py-4 text-right">
                  <p className="text-sm text-sky-100">{placementResult ? "Тест нәтижесі" : "Қолжетімділік"}</p>
                  <p className="mt-1 text-3xl font-black">{placementResult ? `${placementResult.percentage}%` : "Open"}</p>
                </div>
              </div>
            </div>
            {!placementResult ? (
              <div className="mt-5 rounded-[1.5rem] border border-amber-300 bg-amber-50 px-5 py-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                Деңгей тестін өтсеңіз, `Ұсынылған` бөлімі жеке нәтижеңізге қарай жұмыс істейді. Қазір барлық курстар ашық.
              </div>
            ) : null}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            <aside className="space-y-6">
              <div className="rounded-[1.75rem] bg-white p-6 shadow-sm dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="h-5 w-5 text-[#0A2463] dark:text-sky-300" />
                  <h2 className="text-lg font-bold">Фильтр және сұрыптау</h2>
                </div>
                <div className="mt-5 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Курс іздеу..."
                      className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 dark:border-slate-700 dark:bg-slate-950"
                    />
                  </div>

                  <select
                    value={selectedDifficulty}
                    onChange={(event) =>
                      setSelectedDifficulty(event.target.value as "all" | CourseDifficulty)
                    }
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="all">Барлық деңгей</option>
                    <option value="Бастауыш">Бастауыш</option>
                    <option value="Орташа">Орташа</option>
                    <option value="Күрделі">Күрделі</option>
                  </select>

                  <select
                    value={sortOption}
                    onChange={(event) => setSortOption(event.target.value as SortOption)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="title-asc">Атауы A-Z</option>
                    <option value="title-desc">Атауы Z-A</option>
                    <option value="rating-desc">Рейтинг жоғарысы</option>
                    <option value="progress-desc">Прогресс жоғарысы</option>
                  </select>
                </div>
              </div>

              <div className="rounded-[1.75rem] bg-white p-6 shadow-sm dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-[#0A2463] dark:text-sky-300" />
                  <h2 className="text-lg font-bold">Accordion</h2>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    {
                      id: 1,
                      title: "Қалай қолдану керек?",
                      text: "1. Тест өтесіз. 2. Курсты ашасыз. 3. Сабақтарды бір-бірлеп аяқтап, нақты прогресс жинайсыз.",
                    },
                    {
                      id: 2,
                      title: "Favorite қалай сақталады?",
                      text: "Heart батырмасы басылған курстар localStorage ішінде сақталып, қайта ашқанда көрінеді.",
                    },
                    {
                      id: 3,
                      title: "Progress қалай есептеледі?",
                      text: "Прогресс енді жай батырмадан емес, сабақтарды аяқтау саны бойынша есептеледі.",
                    },
                  ].map((item) => (
                    <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setOpenAccordion((current) => (current === item.id ? null : item.id))}
                        className="flex w-full items-center justify-between px-4 py-4 text-left font-semibold"
                      >
                        {item.title}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${openAccordion === item.id ? "rotate-180" : ""}`}
                        />
                      </button>
                      {openAccordion === item.id ? (
                        <div className="border-t border-slate-200 px-4 py-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                          {item.text}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <div>
              <div className="mb-6 flex flex-wrap gap-3">
                {[
                  { id: "recommended", label: "Ұсынылған" },
                  { id: "all", label: "Барлық курстар" },
                  { id: "favorites", label: "Favorite" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as TabOption)}
                    className={`rounded-full px-5 py-3 font-semibold ${
                      activeTab === tab.id
                        ? "bg-[#0A2463] text-white"
                        : "bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="rounded-[1.75rem] bg-white p-5 shadow-sm dark:bg-slate-900">
                      <div className="h-44 animate-pulse rounded-[1.25rem] bg-slate-200 dark:bg-slate-800" />
                      <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                  ))}
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="rounded-[1.75rem] bg-white p-12 text-center shadow-sm dark:bg-slate-900">
                  <p className="text-lg font-semibold">Сәйкес курс табылмады.</p>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">
                    Іздеуді немесе фильтрді өзгертіп көріңіз.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredCourses.map((course) => {
                    const progress = progressMap[course.id] ?? 0;
                    const isFavorite = favoriteIds.includes(course.id);
                    const isRecommended = recommendedIds.includes(course.id);
                    const isFinished = Boolean(quizResults[course.id]?.passed);

                    return (
                      <article
                        key={course.id}
                        className="overflow-hidden rounded-[1.75rem] bg-white shadow-sm transition-transform hover:-translate-y-1 dark:bg-slate-900"
                      >
                        <div className="relative">
                          <ImageWithFallback
                            src={course.image}
                            alt={course.title}
                            className="h-52 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const nextFavorites = toggleFavoriteCourse(course.id);
                              setFavoriteIds(nextFavorites);
                              showToast(
                                nextFavorites.includes(course.id)
                                  ? "Курс favorite тізіміне қосылды."
                                  : "Курс favorite тізімінен алынды.",
                                "success",
                              );
                            }}
                            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow"
                            aria-label="Favorite"
                          >
                            <Heart
                              className={`h-5 w-5 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`}
                            />
                          </button>
                        </div>

                        <div className="p-6">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                              {course.difficulty}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {course.category}
                            </span>
                            {isRecommended ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <Sparkles className="h-3 w-3" />
                                Ұсынылған
                              </span>
                            ) : null}
                            {isFinished ? (
                              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                                Толық аяқталған
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-4 flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-bold">{course.title}</h3>
                              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{course.excerpt}</p>
                            </div>
                            <div className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              {course.rating}
                            </div>
                          </div>

                          <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                            <div className="rounded-2xl bg-slate-100 px-3 py-3 dark:bg-slate-800">
                              <p className="text-slate-500 dark:text-slate-400">Бағасы</p>
                              <p className="mt-1 font-bold">{formatCoursePrice(course.price)}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-100 px-3 py-3 dark:bg-slate-800">
                              <p className="text-slate-500 dark:text-slate-400">Ұзақтығы</p>
                              <p className="mt-1 font-bold">{course.duration}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-100 px-3 py-3 dark:bg-slate-800">
                              <p className="text-slate-500 dark:text-slate-400">Сабақ</p>
                              <p className="mt-1 font-bold">{course.lessons}</p>
                            </div>
                          </div>

                          <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                              <span>Прогресс</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700">
                              <div
                                className="h-3 rounded-full bg-[#0A2463] transition-all dark:bg-sky-400"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                              to={`/courses/${course.id}`}
                              className="rounded-full bg-[#0A2463] px-5 py-3 font-semibold text-white"
                            >
                              {isFinished
                                ? "Қайта қарау"
                                : progress > 0
                                  ? "Оқуды жалғастыру"
                                  : "Курсты бастау"}
                            </Link>
                            <button
                              type="button"
                              onClick={() => setSelectedCourse(course)}
                              className="rounded-full border border-slate-300 px-5 py-3 font-semibold dark:border-slate-700"
                            >
                              Толық ақпарат
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {selectedCourse ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[2rem] bg-white p-8 shadow-2xl dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setSelectedCourse(null)}
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
              aria-label="Жабу"
            >
              <X className="h-5 w-5" />
            </button>

            <ImageWithFallback
              src={selectedCourse.image}
              alt={selectedCourse.title}
              className="h-64 w-full rounded-[1.5rem] object-cover"
            />
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                {selectedCourse.difficulty}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {selectedCourse.category}
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-black">{selectedCourse.title}</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">{selectedCourse.description}</p>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-bold">Дағдылар</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {selectedCourse.skills.map((skill) => (
                    <li key={skill}>• {skill}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold">Модульдер</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {selectedCourse.modules.map((module) => (
                    <li key={module.id}>
                      • {module.title} ({module.lessons.length} сабақ)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Link
              to={`/courses/${selectedCourse.id}`}
              className="mt-6 inline-flex rounded-full bg-[#0A2463] px-5 py-3 font-semibold text-white"
            >
              Курсты толық ашу
            </Link>
          </div>
        </div>
      ) : null}

      <ScrollToTopButton />
      <Footer />
    </div>
  );
}
