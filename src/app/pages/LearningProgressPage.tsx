import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, Sparkles, Trophy } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { courses, getCourseLessonCount } from "../lib/site-data";
import {
  calculateCourseProgress,
  getCompletedLessonsMap,
  getCourseCertificates,
  getCourseQuizResults,
} from "../lib/storage";

export default function LearningProgressPage() {
  const completedLessonsMap = getCompletedLessonsMap();
  const certificates = getCourseCertificates();
  const finalQuizResults = getCourseQuizResults();

  const courseProgress = courses.map((course) => {
    const completedCount = completedLessonsMap[course.id]?.length ?? 0;
    const totalLessons = getCourseLessonCount(course.id);
    const progress = calculateCourseProgress(completedCount, totalLessons);
    const finalResult = finalQuizResults[course.id];

    return {
      ...course,
      completedCount,
      totalLessons,
      progress,
      isFinished: Boolean(finalResult?.passed),
      hasCertificate: Boolean(certificates[course.id]),
    };
  });

  const finishedCount = courseProgress.filter((course) => course.isFinished).length;
  const totalCertificates = courseProgress.filter((course) => course.hasCertificate).length;
  const avgProgress =
    courseProgress.length > 0
      ? Math.round(courseProgress.reduce((sum, course) => sum + course.progress, 0) / courseProgress.length)
      : 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />
      <main className="flex-1">
        <section className="border-b border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-black text-[#0A2463] dark:text-sky-200">Оқу прогресі</h1>
            <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
              Бұл жерде барлық курстар бойынша ілгерілеу, аяқталған сабақтар және сертификаттар көрінеді.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-slate-100 p-5 dark:bg-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">Орташа прогресс</p>
                <p className="mt-2 text-3xl font-black">{avgProgress}%</p>
              </div>
              <div className="rounded-3xl bg-slate-100 p-5 dark:bg-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">Аяқталған курс</p>
                <p className="mt-2 text-3xl font-black">{finishedCount}</p>
              </div>
              <div className="rounded-3xl bg-slate-100 p-5 dark:bg-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">Сертификат</p>
                <p className="mt-2 text-3xl font-black">{totalCertificates}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courseProgress.map((course) => (
              <article key={course.id} className="rounded-[1.75rem] bg-white p-6 shadow-sm dark:bg-slate-900">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                    {course.difficulty}
                  </span>
                  {course.isFinished ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Аяқталған
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-4 text-2xl font-black">{course.title}</h2>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{course.excerpt}</p>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Сабақтар</span>
                    <span>
                      {course.completedCount} / {course.totalLessons}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-3 rounded-full bg-[#0A2463] dark:bg-sky-400" style={{ width: `${course.progress}%` }} />
                  </div>
                  <p className="text-sm font-semibold">{course.progress}%</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={`/courses/${course.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[#0A2463] px-4 py-3 font-semibold text-white"
                  >
                    <BookOpen className="h-4 w-4" />
                    Өту
                  </Link>
                  {course.isFinished ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                      <CheckCircle2 className="h-4 w-4" />
                      Final test өтті
                    </span>
                  ) : null}
                  {course.hasCertificate ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-800 dark:bg-violet-950 dark:text-violet-200">
                      <Trophy className="h-4 w-4" />
                      Сертификат бар
                    </span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[1.75rem] bg-white p-6 shadow-sm dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#0A2463] dark:text-sky-300" />
              <h2 className="text-xl font-black text-[#0A2463] dark:text-sky-300">Қосымша</h2>
            </div>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Енді пайдаланушы тек курс ашып қана қоймай, жалпы ілгерілеуін бір жерден көре алады. Бұл платформа логикасын толық әрі түсінікті етеді.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
