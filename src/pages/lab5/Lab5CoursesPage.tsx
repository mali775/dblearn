import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { courses } from "../../app/lib/site-data";

export default function Lab5CoursesPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 500);
    return () => window.clearTimeout(timeout);
  }, []);

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <p className="font-semibold text-slate-600">Жүктелуде...</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-black text-[#0A2463]">Курстар тізімі</h2>
      <p className="mt-2 text-slate-600">Алдыңғы жобадағы `courses` деректері қолданылды.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <article key={course.id} className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">{course.category}</p>
            <h3 className="mt-1 text-lg font-bold">{course.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{course.excerpt}</p>
            <Link
              to={`/lab5/courses/${course.id}`}
              className="mt-4 inline-flex rounded-full bg-[#0A2463] px-4 py-2 text-sm font-semibold text-white"
            >
              Толық ашу
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
