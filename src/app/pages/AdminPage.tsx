import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import {
  Users,
  BookOpen,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  BarChart3,
  FileText,
} from "lucide-react";
import {
  getCurrentUser,
  getRegisteredUsers,
  isAdmin,
  subscribeToAuthChanges,
} from "../lib/auth";

interface Course {
  id: number;
  title: string;
  difficulty: string;
  students: number;
  status: "active" | "draft";
}

interface User {
  id: number;
  name: string;
  email: string;
  enrolled: number;
  progress: number;
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [activeTab, setActiveTab] = useState<"dashboard" | "courses" | "users" | "analytics">("dashboard");
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, title: "SQL-ге Кіріспе", difficulty: "Бастауыш", students: 1250, status: "active" },
    { id: 2, title: "SELECT Операторының Негіздері", difficulty: "Бастауыш", students: 980, status: "active" },
    { id: 3, title: "INNER JOIN-ды Меңгеру", difficulty: "Орташа", students: 756, status: "active" },
    { id: 4, title: "LEFT және RIGHT JOIN-дар", difficulty: "Орташа", students: 543, status: "active" },
    { id: 5, title: "WHERE Шарты арқылы Сүзу", difficulty: "Бастауыш", students: 892, status: "active" },
    { id: 6, title: "Кешенді Агрегаттау", difficulty: "Орташа", students: 421, status: "draft" },
  ]);

  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "Айдар Нұрлан", email: "aidar@example.com", enrolled: 3, progress: 67 },
    { id: 2, name: "Сәния Қасым", email: "saniya@example.com", enrolled: 5, progress: 89 },
    { id: 3, name: "Ербол Асқар", email: "erbol@example.com", enrolled: 2, progress: 45 },
    { id: 4, name: "Динара Бекет", email: "dinara@example.com", enrolled: 4, progress: 72 },
    { id: 5, name: "Нұрлан Темір", email: "nurlan@example.com", enrolled: 6, progress: 91 },
  ]);

  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<number | null>(null);
  const [newCourse, setNewCourse] = useState({ title: "", difficulty: "Бастауыш" });

  useEffect(() => {
    const syncUsers = async () => {
      setCurrentUser(getCurrentUser());

      try {
        const registeredUsers = (await getRegisteredUsers()).map((user) => ({
          id: user.id,
          name: user.fullName,
          email: user.email,
          enrolled: 0,
          progress: 0,
        }));

        setUsers((currentUsers) => {
          const demoUsers = currentUsers.filter(
            (user) => !registeredUsers.some((registeredUser) => registeredUser.id === user.id),
          );

          return [...demoUsers, ...registeredUsers];
        });
      } catch {
        // Ignore when the current user is not allowed to access the server user list.
      }
    };

    void syncUsers();
    return subscribeToAuthChanges(() => {
      void syncUsers();
    });
  }, []);

  const handleAddCourse = () => {
    if (newCourse.title.trim()) {
      const course: Course = {
        id: courses.length + 1,
        title: newCourse.title,
        difficulty: newCourse.difficulty,
        students: 0,
        status: "draft",
      };
      setCourses([...courses, course]);
      setNewCourse({ title: "", difficulty: "Бастауыш" });
      setIsAddingCourse(false);
    }
  };

  const handleDeleteCourse = (id: number) => {
    if (window.confirm("Бұл курсты өшіруге сенімдісіз бе?")) {
      setCourses(courses.filter((c) => c.id !== id));
    }
  };

  const handleToggleCourseStatus = (id: number) => {
    setCourses(
      courses.map((c) =>
        c.id === id ? { ...c, status: c.status === "active" ? "draft" : "active" } : c
      )
    );
  };

  const totalStudents = users.length;
  const totalCourses = courses.filter((c) => c.status === "active").length;
  const averageProgress = Math.round(
    users.reduce((acc, user) => acc + user.progress, 0) / users.length
  );
  const totalEnrollments = courses.reduce((acc, course) => acc + course.students, 0);
  const topUsers = useMemo(
    () => [...users].sort((a, b) => b.progress - a.progress).slice(0, 5),
    [users],
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-xl rounded-2xl bg-white p-10 shadow-md text-center">
            <h1 className="text-3xl font-bold text-[#0A2463] mb-4">Админ Панелі</h1>
            <p className="text-gray-600 mb-6">
              Бұл бөлімге кіру үшін алдымен тіркеліп, жүйеге кіру керек.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/login"
                className="rounded-lg bg-[#0A2463] px-5 py-3 font-semibold text-white"
              >
                Кіру
              </Link>
              <Link
                to="/register"
                className="rounded-lg border border-[#0A2463] px-5 py-3 font-semibold text-[#0A2463]"
              >
                Тіркелу
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  if (!isAdmin(currentUser)) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-xl rounded-2xl bg-white p-10 text-center shadow-md">
            <h1 className="mb-4 text-3xl font-bold text-[#0A2463]">Қол жеткізу шектелген</h1>
            <p className="mb-6 text-gray-600">
              Бұл бөлім тек әкімші аккаунтына арналған. Кәдімгі қолданушыларға
              админ панелі ашылмайды.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/courses"
                className="rounded-lg bg-[#0A2463] px-5 py-3 font-semibold text-white"
              >
                Курстарға өту
              </Link>
              <Link
                to="/login"
                className="rounded-lg border border-[#0A2463] px-5 py-3 font-semibold text-[#0A2463]"
              >
                Басқа аккаунтпен кіру
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#0A2463] mb-2">
              Админ Панелі
            </h1>
            <p className="text-gray-600">
              Курстарды, пайдаланушыларды және статистиканы басқарыңыз
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                    activeTab === "dashboard"
                      ? "border-[#0A2463] text-[#0A2463]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Дашборд
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("courses")}
                  className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                    activeTab === "courses"
                      ? "border-[#0A2463] text-[#0A2463]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Курстар
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                    activeTab === "users"
                      ? "border-[#0A2463] text-[#0A2463]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Пайдаланушылар
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                    activeTab === "analytics"
                      ? "border-[#0A2463] text-[#0A2463]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Аналитика
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">
                    {totalStudents}
                  </h3>
                  <p className="text-gray-600">Жалпы Студенттер</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <BookOpen className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">
                    {totalCourses}
                  </h3>
                  <p className="text-gray-600">Белсенді Курстар</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">
                    {averageProgress}%
                  </h3>
                  <p className="text-gray-600">Орташа Прогресс</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">
                    {totalEnrollments.toLocaleString()}
                  </h3>
                  <p className="text-gray-600">Жалпы Тіркелулер</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Соңғы Әрекеттер
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Жаңа студент тіркелді</p>
                      <p className="text-sm text-gray-500">Сәния Қасым - 5 минут бұрын</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Курс жаңартылды</p>
                      <p className="text-sm text-gray-500">
                        "INNER JOIN-ды Меңгеру" - 1 сағат бұрын
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Тест аяқталды</p>
                      <p className="text-sm text-gray-500">Ербол Асқар - 2 сағат бұрын</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Курстарды Басқару
                </h2>
                <button
                  onClick={() => setIsAddingCourse(true)}
                  className="flex items-center gap-2 bg-[#0A2463] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0A2463]/90 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Жаңа Курс
                </button>
              </div>

              {isAddingCourse && (
                <div className="bg-white rounded-lg shadow-md p-6 border-2 border-[#0A2463]">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Жаңа Курс Қосу
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Курс Атауы
                      </label>
                      <input
                        type="text"
                        value={newCourse.title}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, title: e.target.value })
                        }
                        placeholder="Мысалы: Advanced SQL Queries"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2463]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Қиындық Деңгейі
                      </label>
                      <select
                        value={newCourse.difficulty}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, difficulty: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2463]"
                      >
                        <option value="Бастауыш">Бастауыш</option>
                        <option value="Орташа">Орташа</option>
                        <option value="Жоғары">Жоғары</option>
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleAddCourse}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Сақтау
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingCourse(false);
                          setNewCourse({ title: "", difficulty: "Бастауыш" });
                        }}
                        className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Болдырмау
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Атауы
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Деңгей
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Студенттер
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Әрекеттер
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {course.title}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            {course.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {course.students}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleCourseStatus(course.id)}
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              course.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {course.status === "active" ? "Белсенді" : "Жоба"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Пайдаланушыларды Басқару
              </h2>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Аты-жөні
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Тіркелген Курстар
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Прогресс
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Әрекеттер
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {user.enrolled} курс
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div
                                className="bg-[#0A2463] h-2 rounded-full"
                                style={{ width: `${user.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {user.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-[#0A2463] hover:underline font-medium">
                            Көру
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Аналитика және Есептер
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Курс Статистикасы
                  </h3>
                  <div className="space-y-3">
                    {courses.slice(0, 5).map((course) => (
                      <div key={course.id}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {course.title}
                          </span>
                          <span className="text-sm text-gray-600">
                            {course.students}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#0A2463] h-2 rounded-full"
                            style={{
                              width: `${(course.students / 1250) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Топ Студенттер
                  </h3>
                  <div className="space-y-4">
                    {topUsers.map((user, index) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-4"
                        >
                          <div className="w-8 h-8 bg-[#0A2463] text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.enrolled} курс
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#0A2463]">
                              {user.progress}%
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Деңгей Бөлінісі
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">
                          Бастауыш
                        </span>
                        <span className="text-gray-600">
                          {
                            courses.filter((c) => c.difficulty === "Бастауыш")
                              .length
                          }{" "}
                          курс
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full"
                          style={{
                            width: `${
                              (courses.filter((c) => c.difficulty === "Бастауыш")
                                .length /
                                courses.length) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">
                          Орташа
                        </span>
                        <span className="text-gray-600">
                          {
                            courses.filter((c) => c.difficulty === "Орташа")
                              .length
                          }{" "}
                          курс
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full"
                          style={{
                            width: `${
                              (courses.filter((c) => c.difficulty === "Орташа")
                                .length /
                                courses.length) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Жылдам Статистика
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Барлық Курстар</span>
                      <span className="font-bold text-gray-900">
                        {courses.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Белсенді Студенттер</span>
                      <span className="font-bold text-gray-900">
                        {totalStudents}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Орташа Аяқтау</span>
                      <span className="font-bold text-gray-900">
                        {averageProgress}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Жалпы Тіркелулер</span>
                      <span className="font-bold text-gray-900">
                        {totalEnrollments.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
