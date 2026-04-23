import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, ClipboardList, Heart, Moon, Search, SlidersHorizontal } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { courses } from "../lib/site-data";
import { getPlacementResult } from "../lib/storage";

const features = [
  {
    title: "Деңгейді анықтау тесті",
    description: "Курс таңдаудан бұрын тест өтіп, өз деңгейіңізді анықтайсыз.",
    icon: ClipboardList,
  },
  {
    title: "Ұсынылатын курстар",
    description: "Нәтижеге қарай сайт бірден лайық SQL курстарын ұсынады.",
    icon: BookOpen,
  },
  {
    title: "Іздеу, сұрыптау, фильтр",
    description: "Курстар real-time түрде ізделеді және деңгей бойынша сұрыпталады.",
    icon: Search,
  },
  {
    title: "Favorite және прогресс",
    description: "Ұнаған курстар мен оқу прогресі localStorage-та сақталады.",
    icon: Heart,
  },
  {
    title: "Dark / Light Mode",
    description: "Тақырып ауыстыру батырмасы жұмыс істейді және режим сақталады.",
    icon: Moon,
  },
  {
    title: "Tabs, modal, accordion",
    description: "Толық ақпарат popup арқылы ашылады, бөлімдер интерактивті ауысады.",
    icon: SlidersHorizontal,
  },
];

export default function HomePage() {
  const placementResult = getPlacementResult();
  const recommendedCourses = placementResult
    ? courses.filter((course) => placementResult.recommendedCourseIds.includes(course.id))
    : courses.slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />
      <main className="flex-1">
        <section className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.25),_transparent_35%),linear-gradient(135deg,#061a40_0%,#0a2463_45%,#123b8f_100%)] text-white">
          <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
            <div>
              <span className="inline-flex rounded-full bg-white/12 px-4 py-2 text-sm font-semibold backdrop-blur">
                JavaScript интерактивті лаборатория жұмысы
              </span>
              <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
                Алдымен тест, содан кейін нақты деңгейге сай SQL курстары
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-sky-100">
                Бұл нұсқада сайт курс деңгейін өзіңіз таңдатпайды. Алдымен интерактивті тест өтесіз, нәтижесі localStorage-та сақталады, содан кейін жүйе лайық оқу жолын өзі ұсынады.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/quiz"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 font-semibold text-[#0A2463] transition-transform hover:-translate-y-1"
                >
                  Тесті Бастау
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-4 font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Курстарды Қарау
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-white/12 px-3 py-2">Form validation</span>
                <span className="rounded-full bg-white/12 px-3 py-2">LocalStorage</span>
                <span className="rounded-full bg-white/12 px-3 py-2">Modal popup</span>
                <span className="rounded-full bg-white/12 px-3 py-2">Search + Sort</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-6 top-10 hidden h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl lg:block" />
              <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="SQL learning dashboard"
                  className="h-[420px] w-full rounded-[1.5rem] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-[#0A2463] dark:text-sky-200">Негізгі функционалдар</h2>
              <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
                Лабораториялық жұмыс талабындағы интерактивтер сайттың UI ішінде көрінеді.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="inline-flex rounded-2xl bg-sky-100 p-3 text-[#0A2463] dark:bg-sky-950 dark:text-sky-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{feature.title}</h3>
                  <p className="mt-3 text-slate-600 dark:text-slate-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white py-16 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-[#0A2463] dark:text-sky-200">
                  {placementResult ? "Сізге ұсынылған курстар" : "Платформадағы курстар"}
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  {placementResult
                    ? `${placementResult.level} деңгейіне сәйкес автоматты түрде іріктелген сабақтар.`
                    : "Тест нәтижесінен кейін осы жердегі ұсыныстар жеке деңгейіңізге қарай өзгереді."}
                </p>
              </div>
              <Link to="/courses" className="text-sm font-semibold text-[#0A2463] dark:text-sky-300">
                Барлығын көру
              </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {recommendedCourses.map((course) => (
                <article
                  key={course.id}
                  className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  <ImageWithFallback
                    src={course.image}
                    alt={course.title}
                    className="h-52 w-full object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                        {course.difficulty}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{course.duration}</span>
                    </div>
                    <h3 className="mt-4 text-xl font-bold">{course.title}</h3>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{course.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
