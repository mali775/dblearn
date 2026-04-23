import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
  Download,
  Lock,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { getCourseById } from "../lib/site-data";
import {
  calculateCourseProgress,
  getCourseCertificate,
  getCourseNote,
  getCourseQuizResult,
  getCompletedLessonIds,
  getLessonQuizResult,
  getModuleQuizResult,
  issueCourseCertificate,
  markLessonCompleted,
  saveCourseNote,
  saveCourseQuizResult,
  saveLessonQuizResult,
  saveModuleQuizResult,
  subscribeToStorageChanges,
  unmarkLessonCompleted,
} from "../lib/storage";

type LessonView =
  | { type: "lesson"; moduleId: string; lessonId: string }
  | { type: "moduleQuiz"; moduleId: string }
  | { type: "finalQuiz" };

export default function CourseLearnPage() {
  const { courseId } = useParams();
  const numericId = Number(courseId);
  const course = getCourseById(numericId);

  const flatLessons = useMemo(() => {
    if (!course) {
      return [];
    }

    return course.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        ...lesson,
        moduleId: module.id,
        moduleTitle: module.title,
      })),
    );
  }, [course]);

  const totalLessons = flatLessons.length;
  const [completedLessons, setCompletedLessons] = useState<string[]>(getCompletedLessonIds(numericId));
  const [courseNote, setCourseNote] = useState(getCourseNote(numericId));
  const [courseQuizResult, setCourseQuizResult] = useState(getCourseQuizResult(numericId));
  const [certificate, setCertificate] = useState(getCourseCertificate(numericId));
  const [lessonQuizResults, setLessonQuizResults] = useState<Record<string, { score: number; total: number; passed: boolean }>>(
    () =>
      course
        ? Object.fromEntries(
            flatLessons
              .map((lesson) => [lesson.id, getLessonQuizResult(numericId, lesson.id)])
              .filter((entry) => entry[1]),
          )
        : {},
  );
  const [moduleQuizResults, setModuleQuizResults] = useState<Record<string, { score: number; total: number; passed: boolean }>>(
    () =>
      course
        ? Object.fromEntries(
            course.modules
              .map((module) => [module.id, getModuleQuizResult(numericId, module.id)])
              .filter((entry) => entry[1]),
          )
        : {},
  );
  const [activeView, setActiveView] = useState<LessonView>(() => {
    if (!course || flatLessons.length === 0) {
      return { type: "finalQuiz" };
    }

    const firstIncomplete = flatLessons.find((lesson) => !getCompletedLessonIds(numericId).includes(lesson.id));
    if (firstIncomplete) {
      return { type: "lesson", moduleId: firstIncomplete.moduleId, lessonId: firstIncomplete.id };
    }

    const firstUnpassedModule = course.modules.find((module) => !getModuleQuizResult(numericId, module.id)?.passed);
    if (firstUnpassedModule) {
      return { type: "moduleQuiz", moduleId: firstUnpassedModule.id };
    }

    return { type: "finalQuiz" };
  });
  const [moduleQuizAnswers, setModuleQuizAnswers] = useState<Record<string, Array<number | null>>>(() =>
    course
      ? Object.fromEntries(course.modules.map((module) => [module.id, Array(module.quiz.length).fill(null)]))
      : {},
  );
  const [finalQuizAnswers, setFinalQuizAnswers] = useState<Array<number | null>>(
    course ? Array(course.quiz.length).fill(null) : [],
  );
  const [lessonQuizAnswers, setLessonQuizAnswers] = useState<Record<string, Array<number | null>>>({});

  useEffect(() => {
    setCompletedLessons(getCompletedLessonIds(numericId));
    setCourseNote(getCourseNote(numericId));
    setCourseQuizResult(getCourseQuizResult(numericId));
    setCertificate(getCourseCertificate(numericId));
    if (course) {
      setLessonQuizResults(
        Object.fromEntries(
          flatLessons
            .map((lesson) => [lesson.id, getLessonQuizResult(numericId, lesson.id)])
            .filter((entry) => entry[1]),
        ),
      );
      setModuleQuizResults(
        Object.fromEntries(
          course.modules
            .map((module) => [module.id, getModuleQuizResult(numericId, module.id)])
            .filter((entry) => entry[1]),
        ),
      );
      setLessonQuizAnswers({});
      setModuleQuizAnswers(
        Object.fromEntries(course.modules.map((module) => [module.id, Array(module.quiz.length).fill(null)])),
      );
      setFinalQuizAnswers(Array(course.quiz.length).fill(null));
    }
  }, [numericId, course]);

  useEffect(() => {
    return subscribeToStorageChanges(() => {
      setCompletedLessons(getCompletedLessonIds(numericId));
      setCourseNote(getCourseNote(numericId));
      setCourseQuizResult(getCourseQuizResult(numericId));
      setCertificate(getCourseCertificate(numericId));
      if (course) {
        setLessonQuizResults(
          Object.fromEntries(
            flatLessons
              .map((lesson) => [lesson.id, getLessonQuizResult(numericId, lesson.id)])
              .filter((entry) => entry[1]),
          ),
        );
        setModuleQuizResults(
          Object.fromEntries(
            course.modules
              .map((module) => [module.id, getModuleQuizResult(numericId, module.id)])
              .filter((entry) => entry[1]),
          ),
        );
      }
    });
  }, [numericId, course, flatLessons]);

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  const progress = calculateCourseProgress(completedLessons.length, totalLessons);
  const lessonsCompleted = totalLessons > 0 && completedLessons.length === totalLessons;
  const allModuleQuizzesPassed = course.modules.every((module) => moduleQuizResults[module.id]?.passed);
  const courseFinished = lessonsCompleted && allModuleQuizzesPassed && Boolean(courseQuizResult?.passed);

  const activeLesson =
    activeView.type === "lesson"
      ? flatLessons.find((lesson) => lesson.id === activeView.lessonId)
      : null;
  const activeModule =
    activeView.type === "moduleQuiz"
      ? course.modules.find((module) => module.id === activeView.moduleId) ?? null
      : activeLesson
        ? course.modules.find((module) => module.id === activeLesson.moduleId) ?? null
        : null;
  const activeLessonIndex = activeLesson
    ? flatLessons.findIndex((lesson) => lesson.id === activeLesson.id)
    : -1;
  const activeLessonQuizPassed = activeLesson ? Boolean(lessonQuizResults[activeLesson.id]?.passed) : false;

  const getNextUnlockedLesson = () => {
    return flatLessons.find((lesson) => !completedLessons.includes(lesson.id)) ?? null;
  };

  const isLessonUnlocked = (lessonId: string) => {
    const lessonIndex = flatLessons.findIndex((lesson) => lesson.id === lessonId);
    if (lessonIndex <= 0) {
      return true;
    }
    return completedLessons.includes(flatLessons[lessonIndex - 1].id);
  };

  const canOpenModuleQuiz = (moduleId: string) => {
    const module = course.modules.find((item) => item.id === moduleId);
    if (!module) {
      return false;
    }
    return module.lessons.every(
      (lesson) => completedLessons.includes(lesson.id) && lessonQuizResults[lesson.id]?.passed,
    );
  };

  const canOpenFinalQuiz = lessonsCompleted && allModuleQuizzesPassed;

  const buildLessonTest = (lesson: NonNullable<typeof activeLesson>) => {
    const firstTheory = lesson.theory[0] ?? "Бұл тақырып SQL логикасын түсіндіреді.";
    const secondTheory = lesson.theory[1] ?? "Бұл бөлім query құрылымын бекітеді.";

    return [
      {
        id: `${lesson.id}-q1`,
        question: `"${lesson.title}" сабағының негізгі мақсаты қайсы?`,
        options: [
          firstTheory,
          "Тек интерфейс түсін өзгерту",
          "Тек файл жүктеуді үйрену",
        ],
        correctAnswer: 0,
        explanation: firstTheory,
      },
      {
        id: `${lesson.id}-q2`,
        question: `Практикадағы ең дұрыс жауап қайсы: "${lesson.practice}"`,
        options: [
          lesson.expectedResult,
          "SELECT * FROM table;",
          "WHERE id = 1;",
        ],
        correctAnswer: 0,
        explanation: `Дұрыс жауап: ${lesson.expectedResult}`,
      },
      {
        id: `${lesson.id}-q3`,
        question: "Төмендегі тұжырымдардың қайсысы осы сабаққа сәйкес келеді?",
        options: [
          secondTheory,
          "SQL тек дизайн үшін қолданылады",
          "JOIN әрқашан кестені жояды",
        ],
        correctAnswer: 0,
        explanation: secondTheory,
      },
    ];
  };

  const handleToggleLesson = () => {
    if (!activeLesson) {
      return;
    }

    if (!activeLessonQuizPassed && !completedLessons.includes(activeLesson.id)) {
      return;
    }

    const nextCompleted = completedLessons.includes(activeLesson.id)
      ? unmarkLessonCompleted(course.id, activeLesson.id)
      : markLessonCompleted(course.id, activeLesson.id);
    setCompletedLessons(nextCompleted);

    if (!completedLessons.includes(activeLesson.id)) {
      const moduleLessons = activeModule?.lessons ?? [];
      const allDone = moduleLessons.every((lesson) =>
        lesson.id === activeLesson.id ? true : nextCompleted.includes(lesson.id),
      );

      if (allDone && activeModule) {
        setActiveView({ type: "moduleQuiz", moduleId: activeModule.id });
      } else {
        const nextLesson = flatLessons[activeLessonIndex + 1];
        if (nextLesson && nextLesson.moduleId === activeLesson.moduleId) {
          setActiveView({
            type: "lesson",
            moduleId: nextLesson.moduleId,
            lessonId: nextLesson.id,
          });
        }
      }
    }
  };

  const handleSaveNote = () => {
    saveCourseNote(course.id, courseNote);
  };

  const handleSubmitModuleQuiz = (moduleId: string) => {
    const module = course.modules.find((item) => item.id === moduleId);
    if (!module) {
      return;
    }

    const answers = moduleQuizAnswers[moduleId] ?? [];
    if (answers.some((answer) => answer === null)) {
      return;
    }

    const score = answers.reduce(
      (sum, answer, index) => sum + (answer === module.quiz[index].correctAnswer ? 1 : 0),
      0,
    );
    const total = module.quiz.length;
    const passed = score >= Math.ceil(total * 0.7);
    const result = { score, total, passed };
    saveModuleQuizResult(course.id, moduleId, result);
    setModuleQuizResults((current) => ({ ...current, [moduleId]: result }));

    if (passed) {
      const currentModuleIndex = course.modules.findIndex((item) => item.id === moduleId);
      const nextModule = course.modules[currentModuleIndex + 1];
      if (nextModule) {
        setActiveView({
          type: "lesson",
          moduleId: nextModule.id,
          lessonId: nextModule.lessons[0].id,
        });
      } else {
        setActiveView({ type: "finalQuiz" });
      }
    }
  };

  const handleSubmitFinalQuiz = () => {
    if (finalQuizAnswers.some((answer) => answer === null)) {
      return;
    }

    const score = finalQuizAnswers.reduce(
      (sum, answer, index) => sum + (answer === course.quiz[index].correctAnswer ? 1 : 0),
      0,
    );
    const total = course.quiz.length;
    const passed = score >= Math.ceil(total * 0.7);
    const result = { score, total, passed };
    saveCourseQuizResult(course.id, result);
    setCourseQuizResult(result);

    if (passed) {
      setCertificate(issueCourseCertificate(course.id));
    }
  };

  const downloadCertificate = () => {
    if (!certificate) {
      return;
    }

    const content = [
      "DB.Learn Certificate",
      `Курс: ${course.title}`,
      `Қолданушы: ${courseNote.trim() ? "DB.Learn Student" : "DB.Learn Student"}`,
      `Берілген күні: ${new Date(certificate.issuedAt).toLocaleString("kk-KZ")}`,
      "Мәртебе: Курс сәтті аяқталды",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${course.title}-certificate.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const continueFromLastLesson = () => {
    const nextLesson = getNextUnlockedLesson();
    if (nextLesson) {
      setActiveView({ type: "lesson", moduleId: nextLesson.moduleId, lessonId: nextLesson.id });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const nextModuleQuiz = course.modules.find((module) => !moduleQuizResults[module.id]?.passed);
    if (nextModuleQuiz) {
      setActiveView({ type: "moduleQuiz", moduleId: nextModuleQuiz.id });
      return;
    }

    setActiveView({ type: "finalQuiz" });
  };

  const renderMainContent = () => {
    if (activeView.type === "lesson" && activeLesson) {
      const lessonDone = completedLessons.includes(activeLesson.id);
      const lessonTest = buildLessonTest(activeLesson);
      const selectedLessonAnswers =
        lessonQuizAnswers[activeLesson.id] ?? Array<number | null>(lessonTest.length).fill(null);
      const lessonResult = lessonQuizResults[activeLesson.id];

      return (
        <section className="rounded-[1.75rem] bg-white p-8 shadow-sm dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                {activeLesson.moduleTitle}
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#0A2463] dark:text-sky-300">
                {activeLesson.title}
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <Clock3 className="h-4 w-4" />
              {activeLesson.duration}
            </div>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_0.92fr]">
            <div>
              <h3 className="text-xl font-bold">Теория</h3>
              <ul className="mt-4 space-y-3 text-slate-600 dark:text-slate-300">
                {activeLesson.theory.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>

              <div className="mt-8 rounded-3xl bg-slate-100 p-5 dark:bg-slate-800">
                <h4 className="font-bold">Мысал</h4>
                <p className="mt-3 font-mono text-sm text-slate-700 dark:text-slate-200">
                  {activeLesson.example}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800">
                <h4 className="font-bold">Практика</h4>
                <p className="mt-3 text-slate-600 dark:text-slate-300">{activeLesson.practice}</p>
              </div>
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/40">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-200">Күтілетін жауап</h4>
                <p className="mt-3 text-emerald-900 dark:text-emerald-100">{activeLesson.expectedResult}</p>
              </div>
              <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-900 dark:bg-violet-950/30">
                <h4 className="font-bold text-violet-900 dark:text-violet-100">Сабақ ішіндегі тест</h4>
                <div className="mt-4 space-y-5">
                  {lessonTest.map((question, questionIndex) => (
                    <article key={question.id} className="rounded-2xl bg-white/70 p-4 dark:bg-slate-950">
                      <p className="text-sm font-semibold text-violet-900 dark:text-violet-100">
                        {questionIndex + 1}. {question.question}
                      </p>
                      <div className="mt-3 grid gap-2">
                        {question.options.map((option, optionIndex) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setLessonQuizAnswers((current) => ({
                                ...current,
                                [activeLesson.id]: lessonTest.map((_, index) =>
                                  index === questionIndex ? optionIndex : selectedLessonAnswers[index] ?? null,
                                ),
                              }))
                            }
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                              selectedLessonAnswers[questionIndex] === optionIndex
                                ? "border-violet-600 bg-white dark:border-violet-400 dark:bg-slate-900"
                                : "border-violet-200 bg-white/80 dark:border-violet-900 dark:bg-slate-950"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      {lessonResult ? (
                        <p className="mt-3 text-xs text-violet-900 dark:text-violet-100">
                          Түсіндіру: {question.explanation}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={selectedLessonAnswers.some((answer) => answer === null)}
                  onClick={() => {
                    const score = lessonTest.reduce(
                      (sum, question, index) =>
                        sum +
                        ((selectedLessonAnswers[index] ?? -1) === question.correctAnswer ? 1 : 0),
                      0,
                    );
                    const total = lessonTest.length;
                    const passed = score >= Math.ceil(total * 0.7);
                    saveLessonQuizResult(course.id, activeLesson.id, { score, total, passed });
                    setLessonQuizResults((current) => ({
                      ...current,
                      [activeLesson.id]: { score, total, passed },
                    }));
                  }}
                  className="mt-4 rounded-full bg-violet-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                >
                  Сабақ тестін тексеру
                </button>
                <p className="mt-3 text-sm text-violet-900 dark:text-violet-100">
                  {activeLessonQuizPassed
                    ? `Бұл сабақтың тесті өтті: ${lessonResult?.score} / ${lessonResult?.total}.`
                    : "Сабақты жабу үшін осы тесттен кемінде 70% алу керек."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleLesson}
                disabled={!lessonDone && !activeLessonQuizPassed}
                className={`w-full rounded-full px-5 py-3 font-semibold text-white ${
                  lessonDone ? "bg-amber-500 hover:bg-amber-600" : "bg-[#0A2463] hover:bg-[#091d4d]"
                } disabled:opacity-50`}
              >
                {lessonDone ? "Сабақты аяқталмаған деп белгілеу" : "Сабақты аяқталды деп белгілеу"}
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
            <button
              type="button"
              disabled={activeLessonIndex <= 0}
              onClick={() => {
                const previousLesson = flatLessons[activeLessonIndex - 1];
                if (previousLesson) {
                  setActiveView({
                    type: "lesson",
                    moduleId: previousLesson.moduleId,
                    lessonId: previousLesson.id,
                  });
                }
              }}
              className="rounded-full border border-slate-300 px-5 py-3 font-semibold disabled:opacity-40 dark:border-slate-700"
            >
              Алдыңғы сабақ
            </button>
            <button
              type="button"
              disabled={activeLessonIndex >= flatLessons.length - 1 || !completedLessons.includes(activeLesson.id)}
              onClick={() => {
                const nextLesson = flatLessons[activeLessonIndex + 1];
                if (nextLesson && isLessonUnlocked(nextLesson.id)) {
                  setActiveView({
                    type: "lesson",
                    moduleId: nextLesson.moduleId,
                    lessonId: nextLesson.id,
                  });
                }
              }}
              className="inline-flex rounded-full bg-[#0A2463] px-5 py-3 font-semibold text-white disabled:opacity-40"
            >
              Келесі сабақ
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </section>
      );
    }

    if (activeView.type === "moduleQuiz" && activeModule) {
      const answers = moduleQuizAnswers[activeModule.id] ?? [];
      const result = moduleQuizResults[activeModule.id];

      return (
        <section className="rounded-[1.75rem] bg-white p-8 shadow-sm dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#0A2463] dark:text-sky-300" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Модульдік тексеру
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#0A2463] dark:text-sky-300">
                {activeModule.title}
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {activeModule.quiz.map((question, index) => (
              <article key={question.id} className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="font-bold">
                  {index + 1}. {question.question}
                </h3>
                <div className="mt-4 grid gap-3">
                  {question.options.map((option, optionIndex) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setModuleQuizAnswers((current) => ({
                          ...current,
                          [activeModule.id]: (current[activeModule.id] ?? []).map((answer, answerIndex) =>
                            answerIndex === index ? optionIndex : answer,
                          ),
                        }))
                      }
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        answers[index] === optionIndex
                          ? "border-[#0A2463] bg-sky-50 dark:border-sky-400 dark:bg-sky-950"
                          : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {result ? (
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Түсіндіру: {question.explanation}
                  </p>
                ) : null}
              </article>
            ))}
          </div>

          <button
            type="button"
            disabled={answers.some((answer) => answer === null)}
            onClick={() => handleSubmitModuleQuiz(activeModule.id)}
            className="mt-6 rounded-full bg-[#0A2463] px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            Модуль тестін тексеру
          </button>

          {result ? (
            <div
              className={`mt-5 rounded-3xl p-5 ${
                result.passed
                  ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                  : "bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100"
              }`}
            >
              <p className="text-lg font-bold">
                Нәтиже: {result.score} / {result.total}
              </p>
              <p className="mt-2">
                {result.passed
                  ? "Модуль жабылды. Келесі бөлімге өте аласыз."
                  : "Модуль жабылған жоқ. Теорияны қайталап, тестті қайта тапсырыңыз."}
              </p>
            </div>
          ) : null}
        </section>
      );
    }

    return (
      <section className="rounded-[1.75rem] bg-white p-8 shadow-sm dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-[#0A2463] dark:text-sky-300" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Қорытынды тест
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#0A2463] dark:text-sky-300">
              {course.title}
            </h2>
          </div>
        </div>

        {!canOpenFinalQuiz ? (
          <div className="mt-6 rounded-3xl bg-amber-50 p-5 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            Алдымен барлық сабақтарды және модульдік тесттерді аяқтаңыз.
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-6">
              {course.quiz.map((question, index) => (
                <article key={question.id} className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800">
                  <h3 className="font-bold">
                    {index + 1}. {question.question}
                  </h3>
                  <div className="mt-4 grid gap-3">
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setFinalQuizAnswers((current) =>
                            current.map((answer, answerIndex) =>
                              answerIndex === index ? optionIndex : answer,
                            ),
                          )
                        }
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          finalQuizAnswers[index] === optionIndex
                            ? "border-[#0A2463] bg-sky-50 dark:border-sky-400 dark:bg-sky-950"
                            : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {courseQuizResult ? (
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                      Түсіндіру: {question.explanation}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>

            <button
              type="button"
              disabled={finalQuizAnswers.some((answer) => answer === null)}
              onClick={handleSubmitFinalQuiz}
              className="mt-6 rounded-full bg-[#0A2463] px-6 py-3 font-semibold text-white disabled:opacity-50"
            >
              Қорытынды тестті тексеру
            </button>

            {courseQuizResult ? (
              <div
                className={`mt-5 rounded-3xl p-5 ${
                  courseQuizResult.passed
                    ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                    : "bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100"
                }`}
              >
                <p className="text-lg font-bold">
                  Нәтиже: {courseQuizResult.score} / {courseQuizResult.total}
                </p>
                <p className="mt-2">
                  {courseQuizResult.passed
                    ? "Қорытынды тест өтті. Курс толық аяқталды."
                    : "Өту балы жетпеді. Тестті қайта тапсыруға болады."}
                </p>
              </div>
            ) : null}
          </>
        )}
      </section>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />
      <main className="flex-1">
        <section className="border-b border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A2463] dark:text-sky-300">
              <ArrowLeft className="h-4 w-4" />
              Курстар тізіміне қайту
            </Link>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                    {course.difficulty}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {course.category}
                  </span>
                  {courseFinished ? (
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                      Курс аяқталды
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-4 text-4xl font-black text-[#0A2463] dark:text-sky-200">
                  {course.title}
                </h1>
                <p className="mt-4 max-w-3xl text-slate-600 dark:text-slate-300">
                  {course.description}
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Модуль</p>
                    <p className="mt-2 text-xl font-bold">{course.modules.length}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Сабақ</p>
                    <p className="mt-2 text-xl font-bold">{totalLessons}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Ұзақтығы</p>
                    <p className="mt-2 text-xl font-bold">{course.duration}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] bg-[#061a40] p-6 text-white">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-cyan-300" />
                  <h2 className="text-xl font-black">Курс мәртебесі</h2>
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-200">
                    <span>Сабақ прогресі</span>
                    <span>
                      {completedLessons.length} / {totalLessons}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-white/15">
                    <div className="h-3 rounded-full bg-cyan-400 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-3 text-3xl font-black">{progress}%</p>
                  <p className="mt-3 text-sm text-slate-200">
                    {courseFinished
                      ? "Сертификат дайын"
                      : canOpenFinalQuiz
                        ? "Қорытынды тест қолжетімді"
                        : "Сабақтар мен модульдік тесттерді аяқтаңыз"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={continueFromLastLesson}
                  className="mt-6 w-full rounded-full bg-white px-5 py-3 font-semibold text-[#0A2463]"
                >
                  Соңғы ашық бөлімге өту
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
            <aside className="rounded-[1.75rem] bg-white p-6 shadow-sm dark:bg-slate-900">
              <h2 className="text-xl font-black text-[#0A2463] dark:text-sky-300">Курс жоспары</h2>
              <div className="mt-5 space-y-5">
                {course.modules.map((module) => (
                  <div key={module.id}>
                    <h3 className="font-bold">{module.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{module.summary}</p>
                    <div className="mt-3 space-y-2">
                      {module.lessons.map((lesson) => {
                        const lessonDone = completedLessons.includes(lesson.id);
                        const unlocked = isLessonUnlocked(lesson.id);
                        const active =
                          activeView.type === "lesson" && activeView.lessonId === lesson.id;

                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => {
                              if (unlocked) {
                                setActiveView({ type: "lesson", moduleId: module.id, lessonId: lesson.id });
                              }
                            }}
                            disabled={!unlocked}
                            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                              active
                                ? "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-100"
                                : unlocked
                                  ? "bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800"
                                  : "cursor-not-allowed bg-slate-100 opacity-70 dark:bg-slate-900"
                            }`}
                          >
                            {lessonDone ? (
                              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                            ) : !unlocked ? (
                              <Lock className="h-5 w-5 shrink-0 text-slate-400" />
                            ) : (
                              <Circle className="h-5 w-5 shrink-0 text-slate-400" />
                            )}
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold">{lesson.title}</span>
                              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                                {lesson.duration}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          if (canOpenModuleQuiz(module.id)) {
                            setActiveView({ type: "moduleQuiz", moduleId: module.id });
                          }
                        }}
                        disabled={!canOpenModuleQuiz(module.id)}
                        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                          activeView.type === "moduleQuiz" && activeView.moduleId === module.id
                            ? "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-100"
                            : canOpenModuleQuiz(module.id)
                              ? "bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800"
                              : "cursor-not-allowed bg-slate-100 opacity-70 dark:bg-slate-900"
                        }`}
                      >
                        {moduleQuizResults[module.id]?.passed ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                        ) : !canOpenModuleQuiz(module.id) ? (
                          <Lock className="h-5 w-5 shrink-0 text-slate-400" />
                        ) : (
                          <Sparkles className="h-5 w-5 shrink-0 text-violet-500" />
                        )}
                        <span className="text-sm font-semibold">Модульдік тест</span>
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    if (canOpenFinalQuiz) {
                      setActiveView({ type: "finalQuiz" });
                    }
                  }}
                  disabled={!canOpenFinalQuiz}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                    activeView.type === "finalQuiz"
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                      : canOpenFinalQuiz
                        ? "bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800"
                        : "cursor-not-allowed bg-slate-100 opacity-70 dark:bg-slate-900"
                  }`}
                >
                  {courseQuizResult?.passed ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : !canOpenFinalQuiz ? (
                    <Lock className="h-5 w-5 shrink-0 text-slate-400" />
                  ) : (
                    <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                  )}
                  <span className="text-sm font-semibold">Қорытынды тест</span>
                </button>
              </div>
            </aside>

            <div className="space-y-8">
              {renderMainContent()}

              <section className="rounded-[1.75rem] bg-white p-8 shadow-sm dark:bg-slate-900">
                <h2 className="text-2xl font-black text-[#0A2463] dark:text-sky-300">Нәтижесінде не үйренесіз</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {course.outcomes.map((item) => (
                    <div key={item} className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
                      <p className="font-semibold">{item}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.75rem] bg-white p-8 shadow-sm dark:bg-slate-900">
                <h2 className="text-2xl font-black text-[#0A2463] dark:text-sky-300">Практикалық тапсырмалар</h2>
                <div className="mt-5 space-y-5">
                  {course.practiceTasks.map((task) => (
                    <article key={task.id} className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800">
                      <h3 className="text-lg font-bold">{task.title}</h3>
                      <p className="mt-2 text-slate-600 dark:text-slate-300">{task.brief}</p>
                      <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        {task.steps.map((step) => (
                          <li key={step}>• {step}</li>
                        ))}
                      </ul>
                      <div className="mt-4 rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
                        <p className="text-sm font-semibold">Кеңес</p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{task.answerHint}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.75rem] bg-white p-8 shadow-sm dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <NotebookPen className="h-5 w-5 text-[#0A2463] dark:text-sky-300" />
                  <h2 className="text-2xl font-black text-[#0A2463] dark:text-sky-300">Жеке жазбалар</h2>
                </div>
                <textarea
                  value={courseNote}
                  onChange={(event) => setCourseNote(event.target.value)}
                  className="mt-5 min-h-40 w-full rounded-3xl border border-slate-300 px-4 py-4 outline-none focus:border-[#0A2463] dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Бұл жерге қысқаша конспект, query мысалдары немесе ескертпелерді сақтаңыз."
                />
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="mt-4 rounded-full bg-[#0A2463] px-5 py-3 font-semibold text-white"
                >
                  Жазбаны сақтау
                </button>
              </section>

              {certificate ? (
                <section className="rounded-[1.75rem] bg-white p-8 shadow-sm dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-violet-500" />
                    <h2 className="text-2xl font-black text-[#0A2463] dark:text-sky-300">Сертификат</h2>
                  </div>
                  <div className="mt-5 rounded-[2rem] border border-violet-200 bg-[linear-gradient(135deg,#f8f5ff_0%,#eef4ff_100%)] p-8 dark:border-violet-900 dark:bg-slate-950">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-700 dark:text-violet-300">
                      DB.Learn Certificate
                    </p>
                    <h3 className="mt-4 text-3xl font-black">{course.title}</h3>
                    <p className="mt-3 text-slate-600 dark:text-slate-300">
                      Бұл сертификат курс толық аяқталғанын растайды.
                    </p>
                    <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                      Берілген күні: {new Date(certificate.issuedAt).toLocaleString("kk-KZ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadCertificate}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-3 font-semibold text-white"
                  >
                    <Download className="h-4 w-4" />
                    Сертификатты жүктеу
                  </button>
                </section>
              ) : null}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
