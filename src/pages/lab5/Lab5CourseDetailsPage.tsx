import { Link, useParams } from "react-router-dom";
import { courses } from "../../app/lib/site-data";

export default function Lab5CourseDetailsPage() {
  const { courseId } = useParams();
  const id = Number(courseId);
  const course = courses.find((item) => item.id === id);

  if (!course) {
    return (
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-black text-[#0A2463]">Курс табылмады</h2>
        <Link to="/lab5/courses" className="mt-4 inline-flex font-semibold text-[#0A2463]">
          Курстарға қайту
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      <p className="text-sm text-slate-500">Route params: /lab5/courses/{course.id}</p>
      <h2 className="mt-2 text-3xl font-black text-[#0A2463]">{course.title}</h2>
      <p className="mt-3 text-slate-600">{course.description}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-100 p-3">
          <p className="text-sm text-slate-500">Деңгей</p>
          <p className="font-bold">{course.difficulty}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3">
          <p className="text-sm text-slate-500">Ұзақтығы</p>
          <p className="font-bold">{course.duration}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3">
          <p className="text-sm text-slate-500">Бағасы</p>
          <p className="font-bold">{course.price <= 0 ? "Тегін" : `${course.price.toLocaleString("kk-KZ")} ₸`}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-bold text-[#0A2463]">Дағдылар</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {course.skills.map((skill) => (
              <li key={skill}>• {skill}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#0A2463]">Модульдер</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {course.modules.map((module) => (
              <li key={module.id}>• {module.title}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
