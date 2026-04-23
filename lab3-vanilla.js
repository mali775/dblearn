const STORAGE_KEYS = {
  users: "users",
  theme: "lab3.theme",
  formDraft: "lab3.formDraft",
  quizResult: "lab3.quizResult",
  favorites: "lab3.favorites",
  progress: "lab3.progress",
};

const courses = [
  {
    id: 1,
    title: "SQL Basics",
    difficulty: "Бастауыш",
    price: 12000,
    description: "SQL синтаксисі, SELECT/FROM, кестемен жұмыс бастамасы.",
    lessons: 12,
    duration: "2 апта",
    rating: 4.8,
    category: "SQL",
    skills: ["SELECT", "FROM", "LIMIT", "Table basics"],
    modules: ["SQL-ге кіріспе", "Алғашқы сұраныстар", "Practice блок", "Mini тест"],
  },
  {
    id: 2,
    title: "WHERE Practice",
    difficulty: "Бастауыш",
    price: 14500,
    description: "Фильтр, LIKE, ORDER BY арқылы нақты дерек табу.",
    lessons: 14,
    duration: "3 апта",
    rating: 4.9,
    category: "SQL",
    skills: ["WHERE", "LIKE", "ORDER BY", "Filtering"],
    modules: ["Filtering", "Sorting", "Real cases", "Homework"],
  },
  {
    id: 3,
    title: "JOIN Basics",
    difficulty: "Орташа",
    price: 18000,
    description: "INNER JOIN және relation арқылы бірнеше кестені біріктіру.",
    lessons: 16,
    duration: "3 апта",
    rating: 4.7,
    category: "JOIN",
    skills: ["INNER JOIN", "Primary key", "Foreign key", "Multi-table query"],
    modules: ["Relations", "Join syntax", "Debug", "Практика"],
  },
  {
    id: 4,
    title: "GROUP BY",
    difficulty: "Орташа",
    price: 22000,
    description: "COUNT, SUM, AVG, HAVING арқылы аналитикалық сұраныстар.",
    lessons: 18,
    duration: "4 апта",
    rating: 4.9,
    category: "Analytics",
    skills: ["GROUP BY", "COUNT", "SUM", "HAVING"],
    modules: ["Aggregation", "Grouping", "Reports", "Dashboard tasks"],
  },
  {
    id: 5,
    title: "Advanced Analytics",
    difficulty: "Күрделі",
    price: 28000,
    description: "CTE, subquery, күрделі аналитика және production есептері.",
    lessons: 20,
    duration: "5 апта",
    rating: 4.8,
    category: "Analytics",
    skills: ["CTE", "Subquery", "Optimization", "Advanced SQL"],
    modules: ["Advanced queries", "CTE", "Optimization", "Portfolio project"],
  },
];

const quizQuestions = [
  {
    q: "SQL не үшін керек?",
    options: ["Видео монтаж", "Дерекқормен жұмыс", "Сурет салу"],
    correct: 1,
  },
  {
    q: "Дұрыс SELECT қайсы?",
    options: ["GET users", "SELECT users", "SELECT * FROM users"],
    correct: 2,
  },
  {
    q: "WHERE бөлімі не істейді?",
    options: ["Сүзеді", "Өшіреді", "Сақтайды"],
    correct: 0,
  },
];

const state = {
  step: 1,
  tab: "recommended",
  search: "",
  difficulty: "all",
  sort: "title-asc",
  quizAnswers: [],
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function toast(message) {
  const wrap = document.getElementById("toastWrap");
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  wrap.appendChild(node);
  setTimeout(() => node.remove(), 2500);
}

function setInvalid(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  error.textContent = message;
  input.classList.toggle("invalid", Boolean(message));
}

function validateField(name, value) {
  const v = value.trim();
  if (name === "fullName") return v ? "" : "Аты-жөні бос болмауы керек";
  if (name === "phone") return /^\d{11}$/.test(v) ? "" : "11 сан енгізіңіз";
  if (name === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Email қате";
  if (name === "password") return /^(?=.*\d).{6,}$/.test(value) ? "" : "Кемінде 6 таңба және 1 сан";
  return "";
}

function updateStepUI() {
  document.getElementById("step1").classList.toggle("hidden", state.step !== 1);
  document.getElementById("step2").classList.toggle("hidden", state.step !== 2);
  document.getElementById("stepLabel").textContent = state.step === 1 ? "1/2" : "2/2";
  document.getElementById("formProgressBar").style.width = state.step === 1 ? "50%" : "100%";
}

function saveDraft() {
  write(STORAGE_KEYS.formDraft, {
    fullName: document.getElementById("fullName").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  });
}

function loadDraft() {
  const draft = read(STORAGE_KEYS.formDraft, { fullName: "", phone: "", email: "", password: "" });
  document.getElementById("fullName").value = draft.fullName;
  document.getElementById("phone").value = draft.phone;
  document.getElementById("email").value = draft.email;
  document.getElementById("password").value = draft.password;
}

function registerUser(event) {
  event.preventDefault();
  const fullName = document.getElementById("fullName").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const errors = {
    fullName: validateField("fullName", fullName),
    phone: validateField("phone", phone),
    email: validateField("email", email),
    password: validateField("password", password),
  };

  setInvalid("fullName", "fullNameError", errors.fullName);
  setInvalid("phone", "phoneError", errors.phone);
  setInvalid("email", "emailError", errors.email);
  setInvalid("password", "passwordError", errors.password);

  if (Object.values(errors).some(Boolean)) {
    toast("Формада қате бар");
    return;
  }

  const users = read(STORAGE_KEYS.users, []);
  users.push({ id: Date.now(), fullName, phone, email, password });
  write(STORAGE_KEYS.users, users);
  localStorage.removeItem(STORAGE_KEYS.formDraft);
  toast("Сәтті тіркелдіңіз");
}

function renderQuiz() {
  const wrap = document.getElementById("quizBox");
  const saved = read(STORAGE_KEYS.quizResult, null);
  if (saved) {
    wrap.innerHTML = `
      <p><b>Сіздің деңгейіңіз:</b> ${saved.level} (${saved.percent}%)</p>
      <p><b>Ұсынылған курс саны:</b> ${saved.recommendedIds.length}</p>
      <button class="btn primary" id="exportQuizBtn">Excel-ге сақтау (CSV)</button>
      <button class="btn" id="resetQuizBtn">Тестті қайта бастау</button>
    `;
    document.getElementById("exportQuizBtn").addEventListener("click", () => {
      exportQuizToCsv(saved);
    });
    document.getElementById("resetQuizBtn").addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEYS.quizResult);
      state.quizAnswers = [];
      renderQuiz();
      renderCourses();
    });
    return;
  }

  wrap.innerHTML = quizQuestions
    .map(
      (item, index) => `
      <div class="course">
        <p><b>${index + 1}. ${item.q}</b></p>
        ${item.options
          .map(
            (opt, optIdx) => `
          <label>
            <input type="radio" name="q${index}" value="${optIdx}" />
            ${opt}
          </label>
        `,
          )
          .join("")}
      </div>
    `,
    )
    .join("") +
    `<button class="btn primary" id="finishQuizBtn">Тестті аяқтау</button>`;

  document.getElementById("finishQuizBtn").addEventListener("click", () => {
    const answers = quizQuestions.map((_, i) => {
      const checked = document.querySelector(`input[name="q${i}"]:checked`);
      return checked ? Number(checked.value) : -1;
    });
    if (answers.includes(-1)) {
      toast("Барлық сұраққа жауап беріңіз");
      return;
    }
    const correct = answers.reduce((sum, ans, idx) => sum + (ans === quizQuestions[idx].correct ? 1 : 0), 0);
    const percent = Math.round((correct / quizQuestions.length) * 100);
    const level = percent < 50 ? "Бастауыш" : percent < 85 ? "Орташа" : "Күрделі";
    const recommendedIds = courses
      .filter((c) => c.difficulty === level)
      .map((c) => c.id)
      .slice(0, 3);
    write(STORAGE_KEYS.quizResult, { correct, percent, level, recommendedIds });
    toast("Тест аяқталды, ұсыныстар жаңарды");
    renderQuiz();
    renderCourses();
  });
}

function exportQuizToCsv(result) {
  const rows = [
    ["Көрсеткіш", "Мәні"],
    ["Дұрыс жауап саны", String(result.correct)],
    ["Пайыз", `${result.percent}%`],
    ["Деңгей", result.level],
    ["Ұсынылған курс ID", result.recommendedIds.join(", ")],
    ["Экспорт уақыты", new Date().toLocaleString("kk-KZ")],
  ];
  const csvContent = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `quiz-result-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  toast("Нәтиже Excel форматына сақталды");
}

function getVisibleCourses() {
  const quizResult = read(STORAGE_KEYS.quizResult, null);
  const favorites = read(STORAGE_KEYS.favorites, []);
  let source = courses;
  if (state.tab === "recommended") {
    source = quizResult ? courses.filter((c) => quizResult.recommendedIds.includes(c.id)) : [];
  }
  if (state.tab === "favorites") {
    source = courses.filter((c) => favorites.includes(c.id));
  }

  const bySearch = source.filter((c) => c.title.toLowerCase().includes(state.search.toLowerCase()));
  const byDifficulty =
    state.difficulty === "all" ? bySearch : bySearch.filter((c) => c.difficulty === state.difficulty);

  return [...byDifficulty].sort((a, b) => {
    if (state.sort === "price-asc") return a.price - b.price;
    if (state.sort === "price-desc") return b.price - a.price;
    if (state.sort === "title-desc") return b.title.localeCompare(a.title);
    return a.title.localeCompare(b.title);
  });
}

function renderCourses() {
  const loading = document.getElementById("loading");
  const grid = document.getElementById("coursesGrid");
  loading.classList.remove("hidden");
  grid.innerHTML = "";

  setTimeout(() => {
    const quizResult = read(STORAGE_KEYS.quizResult, null);
    const favorites = read(STORAGE_KEYS.favorites, []);
    const progress = read(STORAGE_KEYS.progress, {});
    const list = getVisibleCourses();

    if (!list.length) {
      grid.innerHTML = "<p>Сәйкес курс табылмады</p>";
      loading.classList.add("hidden");
      return;
    }

    grid.innerHTML = list
      .map((course) => {
        const isFav = favorites.includes(course.id);
        const p = progress[course.id] || 0;
        const recommended = quizResult ? quizResult.recommendedIds.includes(course.id) : false;
        return `
          <article class="course">
            <div class="row">
              <span class="tag">${course.difficulty}</span>
              <span class="tag">${course.category}</span>
              ${recommended ? '<span class="tag">Ұсынылған</span>' : ""}
            </div>
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <p>Ұзақтығы: <b>${course.duration}</b> | Рейтинг: <b>${course.rating}</b></p>
            <p><b>${course.price}</b> ₸</p>
            <p>Прогресс: <b>${p}%</b></p>
            <div class="row">
              <button class="btn" data-action="favorite" data-id="${course.id}">${isFav ? "Unfavorite" : "Favorite"}</button>
              <button class="btn" data-action="start" data-id="${course.id}">Бастау</button>
              <button class="btn" data-action="details" data-id="${course.id}">Толық ақпарат</button>
            </div>
          </article>
        `;
      })
      .join("");

    loading.classList.add("hidden");
  }, 350);
}

function openModal(course) {
  const modal = document.getElementById("courseModal");
  document.getElementById("modalBody").innerHTML = `
    <h3>${course.title}</h3>
    <p>Деңгей: ${course.difficulty} | Категория: ${course.category}</p>
    <p>Сабақ: ${course.lessons} | Ұзақтығы: ${course.duration}</p>
    <p>Рейтинг: ${course.rating}</p>
    <p>Бағасы: ${course.price} ₸</p>
    <p>${course.description}</p>
    <h4>Нені үйренесіз:</h4>
    <ul>${course.skills.map((skill) => `<li>${skill}</li>`).join("")}</ul>
    <h4>Модульдер:</h4>
    <ul>${course.modules.map((item) => `<li>${item}</li>`).join("")}</ul>
  `;
  modal.classList.remove("hidden");
}

function setupTheme() {
  const saved = read(STORAGE_KEYS.theme, "light");
  document.body.classList.toggle("dark", saved === "dark");
  document.getElementById("themeToggle").addEventListener("click", () => {
    const dark = document.body.classList.toggle("dark");
    write(STORAGE_KEYS.theme, dark ? "dark" : "light");
    toast(dark ? "Dark mode" : "Light mode");
  });
}

function setupAccordion() {
  document.querySelectorAll(".accordion-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.nextElementSibling;
      panel.classList.toggle("open");
    });
  });
}

function setupScrollTop() {
  const btn = document.getElementById("scrollTopBtn");
  window.addEventListener("scroll", () => {
    btn.classList.toggle("hidden", window.scrollY < 300);
  });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function bindEvents() {
  const fullName = document.getElementById("fullName");
  const phone = document.getElementById("phone");
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  [fullName, phone, email, password].forEach((el) => {
    el.addEventListener("input", () => saveDraft());
  });

  phone.addEventListener("input", () => {
    phone.value = phone.value.replace(/[^\d]/g, "").slice(0, 11);
  });

  document.getElementById("nextStepBtn").addEventListener("click", () => {
    const e1 = validateField("fullName", fullName.value);
    const e2 = validateField("phone", phone.value);
    setInvalid("fullName", "fullNameError", e1);
    setInvalid("phone", "phoneError", e2);
    if (e1 || e2) return;
    state.step = 2;
    updateStepUI();
  });

  document.getElementById("prevStepBtn").addEventListener("click", () => {
    state.step = 1;
    updateStepUI();
  });

  document.getElementById("togglePasswordBtn").addEventListener("click", () => {
    password.type = password.type === "password" ? "text" : "password";
  });

  document.getElementById("registerForm").addEventListener("submit", registerUser);

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
      tab.classList.add("active");
      state.tab = tab.dataset.tab;
      renderCourses();
    });
  });

  document.getElementById("searchInput").addEventListener("input", (e) => {
    state.search = e.target.value;
    renderCourses();
  });

  document.getElementById("difficultyFilter").addEventListener("change", (e) => {
    state.difficulty = e.target.value;
    renderCourses();
  });

  document.getElementById("sortSelect").addEventListener("change", (e) => {
    state.sort = e.target.value;
    renderCourses();
  });

  document.getElementById("coursesGrid").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    const favorites = read(STORAGE_KEYS.favorites, []);
    const progress = read(STORAGE_KEYS.progress, {});
    const quizResult = read(STORAGE_KEYS.quizResult, null);
    const course = courses.find((c) => c.id === id);
    if (!course) return;

    if (action === "favorite") {
      const next = favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id];
      write(STORAGE_KEYS.favorites, next);
      toast(next.includes(id) ? "Favorite қосылды" : "Favorite өшірілді");
      renderCourses();
      return;
    }

    if (action === "start") {
      if (!quizResult) {
        toast("Алдымен тесттен өтіңіз");
        return;
      }
      const next = Math.min(100, (progress[id] || 0) + 25);
      write(STORAGE_KEYS.progress, { ...progress, [id]: next });
      toast(`Прогресс: ${next}%`);
      renderCourses();
      return;
    }

    if (action === "details") {
      openModal(course);
    }
  });

  document.getElementById("closeModalBtn").addEventListener("click", () => {
    document.getElementById("courseModal").classList.add("hidden");
  });

  document.getElementById("courseModal").addEventListener("click", (e) => {
    if (e.target.id === "courseModal") {
      e.currentTarget.classList.add("hidden");
    }
  });
}

function init() {
  setupTheme();
  setupAccordion();
  setupScrollTop();
  loadDraft();
  updateStepUI();
  bindEvents();
  renderQuiz();
  renderCourses();
}

init();
