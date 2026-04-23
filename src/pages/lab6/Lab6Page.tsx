import { useEffect, useMemo, useState } from "react";
import { Database, Pencil, PlusCircle, RefreshCcw, Search, Server, Trash2 } from "lucide-react";
import { Header } from "../../app/components/Header";
import { Footer } from "../../app/components/Footer";

type Difficulty = "Бастауыш" | "Орташа" | "Күрделі";

interface Category {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  fullName: string;
  email: string;
}

interface CourseItem {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  price: number;
  lessons: number;
  categoryId: number;
  teacherId: number;
  categoryName: string;
  teacherName: string;
  teacherEmail: string;
  createdAt: string;
}

interface Stats {
  categoriesCount: number;
  teachersCount: number;
  coursesCount: number;
  beginnerCount: number;
  intermediateCount: number;
  advancedCount: number;
  usersCount: number;
}

interface FormState {
  title: string;
  description: string;
  difficulty: Difficulty;
  price: string;
  lessons: string;
  categoryId: string;
  teacherId: string;
}

const emptyForm: FormState = {
  title: "",
  description: "",
  difficulty: "Бастауыш",
  price: "",
  lessons: "",
  categoryId: "",
  teacherId: "",
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || "Сұраныс орындалмады.");
  }
  return payload as T;
}

function validateForm(form: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (form.title.trim().length < 3) {
    errors.title = "Атауы кемінде 3 таңба болуы керек.";
  }
  if (form.description.trim().length < 10) {
    errors.description = "Сипаттама кемінде 10 таңба болуы керек.";
  }
  if (!form.price || Number(form.price) <= 0) {
    errors.price = "Бағаны дұрыс енгізіңіз.";
  }
  if (!form.lessons || Number(form.lessons) <= 0) {
    errors.lessons = "Сабақ санын дұрыс енгізіңіз.";
  }
  if (!form.categoryId) {
    errors.categoryId = "Санатты таңдаңыз.";
  }
  if (!form.teacherId) {
    errors.teacherId = "Оқытушыны таңдаңыз.";
  }

  return errors;
}

function toPayload(form: FormState) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    difficulty: form.difficulty,
    price: Number(form.price),
    lessons: Number(form.lessons),
    categoryId: Number(form.categoryId),
    teacherId: Number(form.teacherId),
  };
}

export default function Lab6Page() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [items, setItems] = useState<CourseItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const pageSize = 5;

  const levelBadges = useMemo(
    () => [
      { label: "Бастауыш", value: stats?.beginnerCount ?? 0, className: "bg-emerald-100 text-emerald-800" },
      { label: "Орташа", value: stats?.intermediateCount ?? 0, className: "bg-amber-100 text-amber-800" },
      { label: "Күрделі", value: stats?.advancedCount ?? 0, className: "bg-rose-100 text-rose-800" },
    ],
    [stats],
  );

  const loadReferenceData = async () => {
    const [loadedCategories, loadedTeachers, loadedStats] = await Promise.all([
      requestJson<Category[]>("/api/lab6/categories"),
      requestJson<Teacher[]>("/api/lab6/teachers"),
      requestJson<Stats>("/api/lab6/stats"),
    ]);

    setCategories(loadedCategories);
    setTeachers(loadedTeachers);
    setStats(loadedStats);
  };

  const loadCourses = async (currentPage: number, currentSearch: string) => {
    const params = new URLSearchParams({
      page: String(currentPage),
      pageSize: String(pageSize),
    });

    if (currentSearch.trim()) {
      params.set("search", currentSearch.trim());
    }

    const payload = await requestJson<{
      items: CourseItem[];
      pagination: { page: number; total: number; totalPages: number };
    }>(`/api/lab6/courses?${params.toString()}`);

    setItems(payload.items);
    setTotalPages(payload.pagination.totalPages);
    setTotalItems(payload.pagination.total);
  };

  const refreshAll = async (currentPage = page, currentSearch = search) => {
    setLoading(true);
    setPageError("");

    try {
      await Promise.all([loadReferenceData(), loadCourses(currentPage, currentSearch)]);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Деректер жүктелмеді.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshAll(page, search);
  }, [page, search]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: "" }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setFormErrors({});
    setSubmitError("");
    setEditingId(null);
  };

  const handleEdit = (item: CourseItem) => {
    setEditingId(item.id);
    setSubmitError("");
    setFormErrors({});
    setForm({
      title: item.title,
      description: item.description,
      difficulty: item.difficulty,
      price: String(item.price),
      lessons: String(item.lessons),
      categoryId: String(item.categoryId),
      teacherId: String(item.teacherId),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateForm(form);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    setSubmitError("");

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/lab6/courses/${editingId}` : "/api/lab6/courses";

      await requestJson(url, {
        method,
        body: JSON.stringify(toPayload(form)),
      });

      resetForm();
      await refreshAll(1, search);
      setPage(1);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Сақтау мүмкін болмады.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const approved = window.confirm("Бұл курсты шынымен жойғыңыз келе ме?");
    if (!approved) {
      return;
    }

    setPageError("");

    try {
      await requestJson(`/api/lab6/courses/${id}`, {
        method: "DELETE",
      });

      const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      await refreshAll(nextPage, search);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Жою мүмкін болмады.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />
      <main className="flex-1">
        <section className="overflow-hidden bg-[linear-gradient(135deg,#061a40_0%,#0f2f73_45%,#155e75_100%)] text-white">
          <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                <Server className="h-4 w-4" />
                Лабораториялық жұмыс №6
              </span>
              <h1 className="mt-6 text-4xl font-black leading-tight md:text-5xl">
                Модельдер, пішіндер және SQLite базасымен CRUD модулі
              </h1>
              <p className="mt-5 max-w-3xl text-lg text-cyan-50">
                Бұл бөлімде 3 байланысқан кесте, REST API, қосу, оқу, өңдеу, жою,
                серверлік және клиенттік валидация, іздеу және пагинация бірге жұмыс істейді.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Кестелер саны</p>
              <p className="mt-3 text-3xl font-black text-[#0A2463] dark:text-sky-300">
                {stats?.categoriesCount ?? 0} / {stats?.teachersCount ?? 0} / {stats?.coursesCount ?? 0}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Санаттар, оқытушылар және курстар
              </p>
            </div>
            {levelBadges.map((item) => (
              <div key={item.label} className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.label} деңгейі</p>
                <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${item.className}`}>
                  {item.value} курс
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[2rem] bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-xl font-black text-[#0A2463] dark:text-sky-300">Қауіпсіздік және валидация</h2>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-emerald-100 px-3 py-2 font-semibold text-emerald-800">
                `bcrypt` арқылы пароль хэштеледі
              </span>
              <span className="rounded-full bg-sky-100 px-3 py-2 font-semibold text-sky-800">
                Prepared statements қолданылады
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-2 font-semibold text-amber-800">
                Server-side validation бар
              </span>
              <span className="rounded-full bg-violet-100 px-3 py-2 font-semibold text-violet-800">
                Тіркелген қолданушылар: {stats?.usersCount ?? 0}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_1.45fr]">
            <section className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-slate-900">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {editingId ? "Өңдеу" : "Қосу"}
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-[#0A2463] dark:text-sky-300">
                    Курс пішіні
                  </h2>
                </div>
                <div className="rounded-2xl bg-sky-100 p-3 text-[#0A2463] dark:bg-sky-950 dark:text-sky-300">
                  <PlusCircle className="h-6 w-6" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Курс атауы</label>
                  <input
                    value={form.title}
                    onChange={(event) => handleChange("title", event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0A2463] dark:border-slate-700 dark:bg-slate-950"
                    placeholder="Мысалы, SQL сұраныстары"
                  />
                  {formErrors.title ? <p className="mt-1 text-sm text-rose-600">{formErrors.title}</p> : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">Сипаттама</label>
                  <textarea
                    value={form.description}
                    onChange={(event) => handleChange("description", event.target.value)}
                    className="min-h-28 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0A2463] dark:border-slate-700 dark:bg-slate-950"
                    placeholder="Курстың қысқаша мазмұны"
                  />
                  {formErrors.description ? (
                    <p className="mt-1 text-sm text-rose-600">{formErrors.description}</p>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Деңгей</label>
                    <select
                      value={form.difficulty}
                      onChange={(event) => handleChange("difficulty", event.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0A2463] dark:border-slate-700 dark:bg-slate-950"
                    >
                      <option value="Бастауыш">Бастауыш</option>
                      <option value="Орташа">Орташа</option>
                      <option value="Күрделі">Күрделі</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Бағасы</label>
                    <input
                      type="number"
                      min="1"
                      value={form.price}
                      onChange={(event) => handleChange("price", event.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0A2463] dark:border-slate-700 dark:bg-slate-950"
                      placeholder="15000"
                    />
                    {formErrors.price ? <p className="mt-1 text-sm text-rose-600">{formErrors.price}</p> : null}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Сабақ саны</label>
                    <input
                      type="number"
                      min="1"
                      value={form.lessons}
                      onChange={(event) => handleChange("lessons", event.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0A2463] dark:border-slate-700 dark:bg-slate-950"
                      placeholder="12"
                    />
                    {formErrors.lessons ? <p className="mt-1 text-sm text-rose-600">{formErrors.lessons}</p> : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Санат</label>
                    <select
                      value={form.categoryId}
                      onChange={(event) => handleChange("categoryId", event.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0A2463] dark:border-slate-700 dark:bg-slate-950"
                    >
                      <option value="">Санатты таңдаңыз</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.categoryId ? (
                      <p className="mt-1 text-sm text-rose-600">{formErrors.categoryId}</p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">Оқытушы</label>
                  <select
                    value={form.teacherId}
                    onChange={(event) => handleChange("teacherId", event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0A2463] dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="">Оқытушыны таңдаңыз</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.fullName} ({teacher.email})
                      </option>
                    ))}
                  </select>
                  {formErrors.teacherId ? (
                    <p className="mt-1 text-sm text-rose-600">{formErrors.teacherId}</p>
                  ) : null}
                </div>

                {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full bg-[#0A2463] px-5 py-3 font-semibold text-white transition hover:bg-[#091d4d] disabled:opacity-70"
                  >
                    {editingId ? <Pencil className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                    {saving ? "Сақталуда..." : editingId ? "Өзгерісті сақтау" : "Курс қосу"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200"
                  >
                    Тазарту
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    REST API
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-[#0A2463] dark:text-sky-300">
                    Курстар тізімі
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => void refreshAll(page, search)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#0A2463] hover:text-[#0A2463] dark:border-slate-700 dark:text-slate-200"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Жаңарту
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <label className="relative block md:max-w-sm md:flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => {
                      setPage(1);
                      setSearch(event.target.value);
                    }}
                    className="w-full rounded-full border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-[#0A2463] dark:border-slate-700 dark:bg-slate-950"
                    placeholder="Курс атауы бойынша іздеу"
                  />
                </label>
                <div className="rounded-full bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  Барлығы: {totalItems}
                </div>
              </div>

              {pageError ? (
                <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {pageError}
                </div>
              ) : null}

              {loading ? (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-300 px-6 py-16 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Деректер жүктелуде...
                </div>
              ) : items.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
                  <Database className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="mt-4 font-semibold">Курс табылмады</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Іздеу шартын өзгертіңіз немесе жаңа курс қосыңыз.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Курс</th>
                            <th className="px-4 py-3 font-semibold">Байланыс</th>
                            <th className="px-4 py-3 font-semibold">Баға</th>
                            <th className="px-4 py-3 font-semibold">Әрекет</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {items.map((item) => (
                            <tr key={item.id} className="bg-white dark:bg-slate-900">
                              <td className="px-4 py-4 align-top">
                                <p className="font-semibold">{item.title}</p>
                                <p className="mt-1 max-w-md text-slate-500 dark:text-slate-400">
                                  {item.description}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">
                                    {item.difficulty}
                                  </span>
                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                    {item.lessons} сабақ
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <p className="font-semibold">{item.categoryName}</p>
                                <p className="mt-1 text-slate-600 dark:text-slate-300">{item.teacherName}</p>
                                <p className="text-slate-500 dark:text-slate-400">{item.teacherEmail}</p>
                              </td>
                              <td className="px-4 py-4 align-top font-semibold">
                                {new Intl.NumberFormat("kk-KZ").format(item.price)} тг
                              </td>
                              <td className="px-4 py-4 align-top">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(item)}
                                    className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-2 font-semibold text-amber-800 transition hover:bg-amber-200"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    Өңдеу
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleDelete(item.id)}
                                    className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-2 font-semibold text-rose-800 transition hover:bg-rose-200"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Жою
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#0A2463] hover:text-[#0A2463] disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                    >
                      Алдыңғы бет
                    </button>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {page} / {totalPages} бет
                    </p>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#0A2463] hover:text-[#0A2463] disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                    >
                      Келесі бет
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
