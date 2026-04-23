import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Download, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useToast } from "../components/ToastProvider";
import {
  courses,
  getPlacementLevel,
  getRecommendedCourseIds,
  placementQuestions,
} from "../lib/site-data";
import { clearPlacementResult, getPlacementResult, savePlacementResult } from "../lib/storage";

export default function QuizPage() {
  const storedResult = getPlacementResult();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Array<number | undefined>>(
    storedResult ? Array(placementQuestions.length).fill(undefined) : [],
  );
  const [result, setResult] = useState(storedResult);
  const { showToast } = useToast();

  const currentQuestionData = placementQuestions[currentQuestion];
  const isAnswered = selectedAnswers[currentQuestion] !== undefined;

  const recommendedCourses = useMemo(
    () =>
      result ? courses.filter((course) => result.recommendedCourseIds.includes(course.id)) : [],
    [result],
  );

  const finishQuiz = () => {
    const score = selectedAnswers.reduce(
      (total, answer, index) =>
        total + (answer === placementQuestions[index].correctAnswer ? 1 : 0),
      0,
    );
    const percentage = Math.round((score / placementQuestions.length) * 100);
    const level = getPlacementLevel(percentage);
    const nextResult = {
      score,
      totalQuestions: placementQuestions.length,
      percentage,
      level,
      recommendedCourseIds: getRecommendedCourseIds(level),
      completedAt: new Date().toISOString(),
    };

    savePlacementResult(nextResult);
    setResult(nextResult);
    showToast("Тест аяқталды. Сайт сізге лайық курстарды ұсынды.", "success");
  };

  const handleExport = () => {
    if (!result) {
      return;
    }

    const exportPayload = {
      ...result,
      details: placementQuestions.map((question, index) => ({
        question: question.question,
        yourAnswer: question.options[selectedAnswers[index]],
        correctAnswer: question.options[question.correctAnswer],
      })),
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `placement-result-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExcelExport = () => {
    if (!result) {
      return;
    }

    const rows = [
      ["Көрсеткіш", "Мәні"],
      ["Дұрыс жауап саны", `${result.score} / ${result.totalQuestions}`],
      ["Пайыз", `${result.percentage}%`],
      ["Деңгей", result.level],
      ["Ұсынылған курс ID", result.recommendedCourseIds.join(", ")],
      ["Экспорт уақыты", new Date().toLocaleString("kk-KZ")],
    ];

    const csvContent = rows
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `placement-result-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Нәтиже Excel форматына сақталды.", "success");
  };

  const resetQuiz = () => {
    clearPlacementResult();
    setSelectedAnswers([]);
    setCurrentQuestion(0);
    setResult(null);
    showToast("Тест қайта басталды.", "info");
  };

  if (result) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <Header />
        <main className="flex-1 py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-[2rem] bg-white p-8 shadow-xl dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      Нәтиже сақталды
                    </span>
                    <h1 className="mt-4 text-4xl font-black text-[#0A2463] dark:text-sky-200">
                      Сіздің деңгейіңіз: {result.level}
                    </h1>
                    <p className="mt-3 text-slate-600 dark:text-slate-300">
                      {result.score} / {result.totalQuestions} дұрыс жауап, жалпы нәтиже {result.percentage}%.
                    </p>
                  </div>
                  <div
                    className={`inline-flex h-24 w-24 items-center justify-center rounded-full ${
                      result.percentage >= 70 ? "bg-emerald-100" : "bg-amber-100"
                    }`}
                  >
                    {result.percentage >= 70 ? (
                      <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                    ) : (
                      <XCircle className="h-12 w-12 text-amber-600" />
                    )}
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Ұсынылған бағыт</p>
                    <p className="mt-2 text-xl font-bold">{result.level}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Ұсынылатын курстар</p>
                    <p className="mt-2 text-xl font-bold">{result.recommendedCourseIds.length}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Сақталған уақыт</p>
                    <p className="mt-2 text-xl font-bold">
                      {new Date(result.completedAt).toLocaleDateString("kk-KZ")}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={resetQuiz}
                    className="inline-flex items-center gap-2 rounded-full bg-[#0A2463] px-6 py-3 font-semibold text-white"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Қайта тапсыру
                  </button>
                  <button
                    type="button"
                    onClick={handleExport}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-semibold dark:border-slate-700"
                  >
                    <Download className="h-5 w-5" />
                    JSON Экспорт
                  </button>
                  <button
                    type="button"
                    onClick={handleExcelExport}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-6 py-3 font-semibold text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                  >
                    <Download className="h-5 w-5" />
                    Excel (CSV)
                  </button>
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-6 py-3 font-semibold text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100"
                  >
                    Курстарға өту
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </section>

              <aside className="rounded-[2rem] bg-[#061a40] p-8 text-white shadow-xl">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-cyan-300" />
                  <h2 className="text-2xl font-black">Ұсынылған курстар</h2>
                </div>
                <div className="mt-6 space-y-4">
                  {recommendedCourses.map((course) => (
                    <article key={course.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-bold">{course.title}</h3>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                          {course.difficulty}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-200">{course.excerpt}</p>
                      <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                        <span>{course.duration}</span>
                        <span>{formatCoursePrice(course.price)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <section className="rounded-[2rem] bg-white p-8 shadow-xl dark:bg-slate-900">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                  Multi-step тест
                </span>
                <h1 className="mt-4 text-4xl font-black text-[#0A2463] dark:text-sky-200">
                  Оқу деңгейін анықтау тесті
                </h1>
                <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
                  Әр сұраққа жауап беріңіз. Соңында сайт сізге лайық курстарды автоматты түрде ұсынады.
                </p>
              </div>
              <div className="min-w-[180px]">
                <div className="mb-2 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>Прогресс</span>
                  <span>
                    {currentQuestion + 1} / {placementQuestions.length}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-3 rounded-full bg-[#0A2463] transition-all dark:bg-sky-400"
                    style={{ width: `${((currentQuestion + 1) / placementQuestions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-slate-50 p-6 dark:bg-slate-800">
              <h2 className="text-2xl font-bold">{currentQuestionData.question}</h2>
              <div className="mt-6 grid gap-3">
                {currentQuestionData.options.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      const nextAnswers = [...selectedAnswers];
                      nextAnswers[currentQuestion] = index;
                      setSelectedAnswers(nextAnswers);
                    }}
                    className={`rounded-2xl border-2 px-5 py-4 text-left transition-colors ${
                      selectedAnswers[currentQuestion] === index
                        ? "border-[#0A2463] bg-sky-50 dark:border-sky-400 dark:bg-sky-950"
                        : "border-slate-200 bg-white hover:border-sky-300 dark:border-slate-700 dark:bg-slate-900"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setCurrentQuestion((current) => Math.max(0, current - 1))}
                disabled={currentQuestion === 0}
                className="rounded-full border border-slate-300 px-6 py-3 font-semibold disabled:opacity-40 dark:border-slate-700"
              >
                Артқа
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentQuestion === placementQuestions.length - 1) {
                    finishQuiz();
                    return;
                  }

                  setCurrentQuestion((current) => current + 1);
                }}
                disabled={!isAnswered}
                className="rounded-full bg-[#0A2463] px-6 py-3 font-semibold text-white disabled:opacity-40"
              >
                {currentQuestion === placementQuestions.length - 1 ? "Тестті аяқтау" : "Келесі"}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {placementQuestions.map((question, index) => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setCurrentQuestion(index)}
                  className={`h-10 w-10 rounded-xl font-semibold ${
                    index === currentQuestion
                      ? "bg-[#0A2463] text-white"
                      : selectedAnswers[index] !== undefined
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
  const formatCoursePrice = (price: number) => (price <= 0 ? "Тегін" : `${price.toLocaleString("kk-KZ")} ₸`);
