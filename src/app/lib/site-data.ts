export type CourseDifficulty = "Бастауыш" | "Орташа" | "Күрделі";

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  theory: string[];
  example: string;
  practice: string;
  expectedResult: string;
}

export interface CourseModuleQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface CourseModule {
  id: string;
  title: string;
  summary: string;
  lessons: CourseLesson[];
  quiz: CourseModuleQuizQuestion[];
}

export interface CoursePracticeTask {
  id: string;
  title: string;
  brief: string;
  steps: string[];
  answerHint: string;
}

export interface CourseQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface CourseItem {
  id: number;
  title: string;
  excerpt: string;
  description: string;
  difficulty: CourseDifficulty;
  price: number;
  duration: string;
  progressSeed: number;
  rating: number;
  lessons: number;
  category: "SQL" | "JOIN" | "Analytics";
  image: string;
  skills: string[];
  modules: CourseModule[];
  outcomes: string[];
  practiceTasks: CoursePracticeTask[];
  quiz: CourseQuizQuestion[];
}

export interface PlacementQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface PlacementResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  level: CourseDifficulty;
  recommendedCourseIds: number[];
  completedAt: string;
}

function countLessons(modules: CourseModule[]) {
  return modules.reduce((sum, module) => sum + module.lessons.length, 0);
}

const courseModules = {
  sqlIntro: [
    {
      id: "sql-intro-1",
      title: "SQL және кесте ұғымы",
      summary: "SQL не үшін керек және кесте қалай ойланады.",
      lessons: [
        {
          id: "sql-intro-1-1",
          title: "Дерекқор деген не?",
          duration: "12 мин",
          theory: [
            "Дерекқор ақпаратты құрылымды түрде сақтайды.",
            "Кесте rows және columns-тен тұрады.",
            "SQL сол кестелермен сөйлесетін тіл болып саналады.",
          ],
          example: "Мысал: students(id, full_name, email)",
          practice: "Өзіңіз ойлаған оқу платформасы үшін 3 кестенің атын жазыңыз.",
          expectedResult: "Мысалы: students, courses, enrollments",
        },
        {
          id: "sql-intro-1-2",
          title: "SELECT және FROM негіздері",
          duration: "15 мин",
          theory: [
            "SELECT қандай бағанды алатынымызды көрсетеді.",
            "FROM дерек қай кестеден алынатынын көрсетеді.",
            "Алғашқы сұраныс ретінде SELECT * FROM table жиі қолданылады.",
          ],
          example: "SELECT full_name, email FROM students;",
          practice: "users кестесінен id және email алу сұранысын жазыңыз.",
          expectedResult: "SELECT id, email FROM users;",
        },
      ],
      quiz: [
        {
          id: "sql-intro-1-quiz-1",
          question: "SQL қай жерде қолданылады?",
          options: ["Дерекқормен жұмыс істеуде", "Тек сурет салуда", "Тек бейне монтажда"],
          correctAnswer: 0,
          explanation: "SQL мәліметтер базасын оқу, өзгерту және басқару үшін қолданылады.",
        },
      ],
    },
    {
      id: "sql-intro-2",
      title: "Нәтижені шектеу және оқу",
      summary: "LIMIT, ORDER және query нәтижесін оқу.",
      lessons: [
        {
          id: "sql-intro-2-1",
          title: "LIMIT қолдану",
          duration: "10 мин",
          theory: [
            "LIMIT нәтиженің тек алғашқы N жолын қайтарады.",
            "Үлкен кестемен жұмыс істегенде preview үшін ыңғайлы.",
          ],
          example: "SELECT * FROM courses LIMIT 5;",
          practice: "products кестесінен алғашқы 3 жолды алыңыз.",
          expectedResult: "SELECT * FROM products LIMIT 3;",
        },
        {
          id: "sql-intro-2-2",
          title: "ORDER BY түсіну",
          duration: "13 мин",
          theory: [
            "ORDER BY нәтижені реттейді.",
            "ASC өсу, DESC кему ретімен береді.",
          ],
          example: "SELECT * FROM courses ORDER BY price DESC;",
          practice: "students кестесін full_name бойынша A-Z ретімен сұрыптаңыз.",
          expectedResult: "SELECT * FROM students ORDER BY full_name ASC;",
        },
      ],
      quiz: [
        {
          id: "sql-intro-2-quiz-1",
          question: "LIMIT 5 нені білдіреді?",
          options: ["5 бағанды жасырады", "Алғашқы 5 жолды қайтарады", "Кестені өшіреді"],
          correctAnswer: 1,
          explanation: "LIMIT нәтиженің тек алғашқы N жолын қайтарады.",
        },
      ],
    },
  ] satisfies CourseModule[],
  sqlWhere: [
    {
      id: "sql-where-1",
      title: "Фильтрация",
      summary: "WHERE, AND, OR арқылы нақты жазбаларды табу.",
      lessons: [
        {
          id: "sql-where-1-1",
          title: "WHERE негізі",
          duration: "14 мин",
          theory: [
            "WHERE шартқа сай жолдарды қайтарады.",
            "Сандық және мәтіндік шарттар бірге қолданыла алады.",
          ],
          example: "SELECT * FROM courses WHERE price > 15000;",
          practice: "students кестесінен city = 'Almaty' болған жолдарды табыңыз.",
          expectedResult: "SELECT * FROM students WHERE city = 'Almaty';",
        },
        {
          id: "sql-where-1-2",
          title: "AND / OR комбинациялары",
          duration: "16 мин",
          theory: [
            "AND барлық шарт бірдей орындалғанда true береді.",
            "OR кемінде бір шарт true болса жеткілікті.",
          ],
          example: "SELECT * FROM users WHERE role = 'student' AND is_active = 1;",
          practice: "courses кестесінен difficulty='Бастауыш' немесе price < 15000 шартын жазыңыз.",
          expectedResult: "SELECT * FROM courses WHERE difficulty = 'Бастауыш' OR price < 15000;",
        },
      ],
      quiz: [
        {
          id: "sql-where-1-quiz-1",
          question: "WHERE не үшін керек?",
          options: ["Шарт бойынша сүзу үшін", "Кесте атауын өзгерту үшін", "Сурет жүктеу үшін"],
          correctAnswer: 0,
          explanation: "WHERE тек керек жазбаларды қалдыру үшін қолданылады.",
        },
      ],
    },
    {
      id: "sql-where-2",
      title: "LIKE және ORDER BY",
      summary: "Іздеу мен сұрыптауды бірге қолдану.",
      lessons: [
        {
          id: "sql-where-2-1",
          title: "LIKE арқылы іздеу",
          duration: "12 мин",
          theory: [
            "LIKE мәтіндік іздеуге арналған.",
            "% таңбасы кез келген жалғасты білдіреді.",
          ],
          example: "SELECT * FROM students WHERE full_name LIKE 'А%';",
          practice: "title ішінде SQL сөзі бар курстарды табыңыз.",
          expectedResult: "SELECT * FROM courses WHERE title LIKE '%SQL%';",
        },
        {
          id: "sql-where-2-2",
          title: "Фильтр + сұрыптау",
          duration: "15 мин",
          theory: [
            "Көп жағдайда WHERE және ORDER BY бірге жүреді.",
            "Алдымен фильтр, кейін нәтиже реттеледі.",
          ],
          example: "SELECT * FROM courses WHERE price > 10000 ORDER BY price ASC;",
          practice: "price > 12000 болатын курстарды баға бойынша кему ретімен жазыңыз.",
          expectedResult: "SELECT * FROM courses WHERE price > 12000 ORDER BY price DESC;",
        },
      ],
      quiz: [
        {
          id: "sql-where-2-quiz-1",
          question: "LIKE '%SQL%' қандай жолдарды табады?",
          options: ["Тек SQL-мен басталатынды", "Ішінде SQL бар жолдарды", "Тек бос жолды"],
          correctAnswer: 1,
          explanation: "Екі жақтағы % кез келген символдар болуы мүмкін дегенді білдіреді.",
        },
      ],
    },
  ] satisfies CourseModule[],
  joinIntro: [
    {
      id: "join-1",
      title: "Қатынастар және keys",
      summary: "Primary және foreign key логикасы.",
      lessons: [
        {
          id: "join-1-1",
          title: "Primary Key",
          duration: "11 мин",
          theory: [
            "Primary key бір жазбаны бірегей анықтайды.",
            "Әдетте id бағаны сол үшін қолданылады.",
          ],
          example: "students(id PRIMARY KEY, full_name)",
          practice: "courses кестесі үшін primary key болатын бағанды атаңыз.",
          expectedResult: "id",
        },
        {
          id: "join-1-2",
          title: "Foreign Key",
          duration: "14 мин",
          theory: [
            "Foreign key бір кестені екіншісімен байланыстырады.",
            "Ол relation орнатуға көмектеседі.",
          ],
          example: "enrollments.student_id -> students.id",
          practice: "enrollments пен courses арасындағы байланыс қай өріс арқылы болады?",
          expectedResult: "enrollments.course_id -> courses.id",
        },
      ],
      quiz: [
        {
          id: "join-1-quiz-1",
          question: "Foreign key нені орнатады?",
          options: ["Кестелер арасындағы байланысты", "Тек түс режимін", "Тек парольді"],
          correctAnswer: 0,
          explanation: "Foreign key relation орнату үшін керек.",
        },
      ],
    },
    {
      id: "join-2",
      title: "INNER JOIN практикасы",
      summary: "Екі кестеден ортақ жазбаларды алу.",
      lessons: [
        {
          id: "join-2-1",
          title: "JOIN синтаксисі",
          duration: "16 мин",
          theory: [
            "INNER JOIN тек сәйкес жазбаларды қайтарады.",
            "ON бөлімінде байланыс шарты жазылады.",
          ],
          example:
            "SELECT students.full_name, courses.title FROM enrollments INNER JOIN students ON enrollments.student_id = students.id INNER JOIN courses ON enrollments.course_id = courses.id;",
          practice: "orders және users кестесін user_id бойынша байланыстырыңыз.",
          expectedResult:
            "SELECT * FROM orders INNER JOIN users ON orders.user_id = users.id;",
        },
        {
          id: "join-2-2",
          title: "JOIN нәтижесін оқу",
          duration: "15 мин",
          theory: [
            "JOIN нәтижесінде бірнеше кестенің бағандары бірге шығады.",
            "Көрсетілетін бағандарды нақты жазу ұсынылады.",
          ],
          example:
            "SELECT users.email, orders.total FROM orders INNER JOIN users ON orders.user_id = users.id;",
          practice: "students.full_name және enrollments.created_at өрістерін шығарыңыз.",
          expectedResult:
            "SELECT students.full_name, enrollments.created_at FROM enrollments INNER JOIN students ON enrollments.student_id = students.id;",
        },
      ],
      quiz: [
        {
          id: "join-2-quiz-1",
          question: "INNER JOIN нені қайтарады?",
          options: ["Екі жақта да matching бар жолдарды", "Сол жақтың бәрін", "Оң жақтың бәрін"],
          correctAnswer: 0,
          explanation: "INNER JOIN тек сәйкес жазбаларды қайтарады.",
        },
      ],
    },
  ] satisfies CourseModule[],
  joinAdvanced: [
    {
      id: "join-adv-1",
      title: "LEFT және RIGHT JOIN",
      summary: "Missing data жағдайларын көру.",
      lessons: [
        {
          id: "join-adv-1-1",
          title: "LEFT JOIN",
          duration: "14 мин",
          theory: [
            "LEFT JOIN сол жақ кестенің барлық жолын қайтарады.",
            "Сәйкестік жоқ жерде NULL шығады.",
          ],
          example:
            "SELECT courses.title, enrollments.id FROM courses LEFT JOIN enrollments ON courses.id = enrollments.course_id;",
          practice: "users пен profiles кестесін LEFT JOIN арқылы жазыңыз.",
          expectedResult:
            "SELECT users.*, profiles.* FROM users LEFT JOIN profiles ON users.id = profiles.user_id;",
        },
        {
          id: "join-adv-1-2",
          title: "NULL бар нәтижелер",
          duration: "12 мин",
          theory: [
            "NULL мәні сәйкестік жоқ екенін көрсетеді.",
            "Reporting сұраныстарында бұл өте маңызды.",
          ],
          example: "WHERE enrollments.id IS NULL",
          practice: "Жазылмаған курстарды табу үшін қандай шарт керек?",
          expectedResult: "WHERE enrollments.id IS NULL",
        },
      ],
      quiz: [
        {
          id: "join-adv-1-quiz-1",
          question: "LEFT JOIN сәйкестік жоқ болса не көрсетеді?",
          options: ["NULL", "Тек 0", "Қате шығады"],
          correctAnswer: 0,
          explanation: "Matching жоқ болғанда байланысқан өрістерде NULL шығады.",
        },
      ],
    },
    {
      id: "join-adv-2",
      title: "Reporting cases",
      summary: "JOIN-ды аналитикалық есептерге қолдану.",
      lessons: [
        {
          id: "join-adv-2-1",
          title: "Көп кестелі есеп",
          duration: "18 мин",
          theory: [
            "Бірнеше JOIN қатар қолдануға болады.",
            "Alias жазу query-ді оқуды жеңілдетеді.",
          ],
          example:
            "SELECT s.full_name, c.title, t.full_name FROM enrollments e JOIN students s ON e.student_id = s.id JOIN courses c ON e.course_id = c.id JOIN teachers t ON c.teacher_id = t.id;",
          practice: "Үш кестені байланыстыратын шағын мысал құрыңыз.",
          expectedResult: "students, enrollments, courses кестелерін JOIN ету",
        },
        {
          id: "join-adv-2-2",
          title: "Alias пайдалану",
          duration: "10 мин",
          theory: [
            "Ұзын кесте аттарын қысқарту үшін alias керек.",
            "Бұл үлкен JOIN сұраныстарында өте пайдалы.",
          ],
          example: "SELECT c.title FROM courses c;",
          practice: "users кестесіне u alias беріңіз.",
          expectedResult: "SELECT u.email FROM users u;",
        },
      ],
      quiz: [
        {
          id: "join-adv-2-quiz-1",
          question: "Alias не үшін керек?",
          options: ["Кесте атын қысқартып, query оқуды жеңілдету үшін", "Базаны жою үшін", "Тек экспорт үшін"],
          correctAnswer: 0,
          explanation: "Alias үлкен JOIN сұраныстарын оқуды жеңілдетеді.",
        },
      ],
    },
  ] satisfies CourseModule[],
  analyticsBasic: [
    {
      id: "analytics-1",
      title: "Агрегат функциялары",
      summary: "COUNT, SUM, AVG не үшін керек.",
      lessons: [
        {
          id: "analytics-1-1",
          title: "COUNT және SUM",
          duration: "13 мин",
          theory: [
            "COUNT жол санын есептейді.",
            "SUM сандық өрістердің қосындысын табады.",
          ],
          example: "SELECT COUNT(*) FROM enrollments;",
          practice: "orders кестесіндегі total сомасының қосындысын жазыңыз.",
          expectedResult: "SELECT SUM(total) FROM orders;",
        },
        {
          id: "analytics-1-2",
          title: "AVG және MAX/MIN",
          duration: "12 мин",
          theory: [
            "AVG орташа мәнді береді.",
            "MAX және MIN шеткі мәндерді табады.",
          ],
          example: "SELECT AVG(price) FROM courses;",
          practice: "products кестесінен ең қымбат бағаны табыңыз.",
          expectedResult: "SELECT MAX(price) FROM products;",
        },
      ],
      quiz: [
        {
          id: "analytics-1-quiz-1",
          question: "COUNT(*) нені есептейді?",
          options: ["Жол санын", "Орташа мәнді", "Ең үлкен мәнді"],
          correctAnswer: 0,
          explanation: "COUNT(*) нәтижедегі жазбалар санын береді.",
        },
      ],
    },
    {
      id: "analytics-2",
      title: "GROUP BY және HAVING",
      summary: "Топтық есептер жасау.",
      lessons: [
        {
          id: "analytics-2-1",
          title: "GROUP BY негізі",
          duration: "16 мин",
          theory: [
            "GROUP BY бірдей мәндер бойынша топтайды.",
            "Ол агрегат функцияларымен бірге қолданылады.",
          ],
          example: "SELECT difficulty, COUNT(*) FROM courses GROUP BY difficulty;",
          practice: "city бойынша users санын шығарыңыз.",
          expectedResult: "SELECT city, COUNT(*) FROM users GROUP BY city;",
        },
        {
          id: "analytics-2-2",
          title: "HAVING қолдану",
          duration: "12 мин",
          theory: [
            "HAVING топталған нәтижені сүзеді.",
            "WHERE топтауға дейін, HAVING топтаудан кейін жұмыс істейді.",
          ],
          example:
            "SELECT city, COUNT(*) FROM users GROUP BY city HAVING COUNT(*) > 5;",
          practice: "2-ден көп курсы бар деңгейлерді табыңыз.",
          expectedResult:
            "SELECT difficulty, COUNT(*) FROM courses GROUP BY difficulty HAVING COUNT(*) > 2;",
        },
      ],
      quiz: [
        {
          id: "analytics-2-quiz-1",
          question: "HAVING қай кезде қолданылады?",
          options: ["Топталған нәтижені сүзгенде", "INSERT алдында", "DELETE орнына"],
          correctAnswer: 0,
          explanation: "HAVING агрегат нәтижелерін сүзуге арналған.",
        },
      ],
    },
  ] satisfies CourseModule[],
  analyticsAdvanced: [
    {
      id: "analytics-adv-1",
      title: "Subquery",
      summary: "Ішкі сұраныстарды түсіну.",
      lessons: [
        {
          id: "analytics-adv-1-1",
          title: "WHERE ішіндегі subquery",
          duration: "17 мин",
          theory: [
            "Subquery негізгі сұранысқа дерек дайындайды.",
            "Көп жағдайда WHERE немесе FROM ішінде тұрады.",
          ],
          example:
            "SELECT * FROM courses WHERE price > (SELECT AVG(price) FROM courses);",
          practice: "Орташа бағадан жоғары өнімдерді табыңыз.",
          expectedResult:
            "SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products);",
        },
        {
          id: "analytics-adv-1-2",
          title: "IN және subquery",
          duration: "13 мин",
          theory: [
            "IN арқылы subquery нәтижесін қолдануға болады.",
            "Бұл байланысқан фильтрлерге ыңғайлы.",
          ],
          example:
            "SELECT * FROM students WHERE id IN (SELECT student_id FROM enrollments);",
          practice: "Сатылған product_id тізімі арқылы products таңдаңыз.",
          expectedResult:
            "SELECT * FROM products WHERE id IN (SELECT product_id FROM order_items);",
        },
      ],
      quiz: [
        {
          id: "analytics-adv-1-quiz-1",
          question: "Subquery деген не?",
          options: ["Сұраныс ішіндегі сұраныс", "Жаңа CSS қасиеті", "Тек export форматы"],
          correctAnswer: 0,
          explanation: "Subquery негізгі query ішінде орындалатын ішкі сұраныс.",
        },
      ],
    },
    {
      id: "analytics-adv-2",
      title: "CTE және аналитикалық ойлау",
      summary: "Үлкен сұранысты бөліктерге бөлу.",
      lessons: [
        {
          id: "analytics-adv-2-1",
          title: "CTE синтаксисі",
          duration: "18 мин",
          theory: [
            "CTE WITH арқылы жазылады.",
            "Күрделі аналитиканы оқуға жеңіл етеді.",
          ],
          example:
            "WITH expensive_courses AS (SELECT * FROM courses WHERE price > 20000) SELECT * FROM expensive_courses;",
          practice: "active_users атты CTE құрыңыз.",
          expectedResult:
            "WITH active_users AS (SELECT * FROM users WHERE is_active = 1) SELECT * FROM active_users;",
        },
        {
          id: "analytics-adv-2-2",
          title: "Мини-аналитика сценарийі",
          duration: "20 мин",
          theory: [
            "Алдымен деректі дайындап, кейін есеп құру тиімді.",
            "CTE + GROUP BY өндірістік есептерге жақын.",
          ],
          example:
            "WITH monthly_sales AS (...) SELECT month, SUM(total) FROM monthly_sales GROUP BY month;",
          practice: "Өз жобаңыз үшін 2 қадамды аналитикалық сұраныс құрыңыз.",
          expectedResult: "WITH ... SELECT ... GROUP BY ...",
        },
      ],
      quiz: [
        {
          id: "analytics-adv-2-quiz-1",
          question: "CTE қай кілтсөзбен басталады?",
          options: ["WITH", "JOIN", "TABLE"],
          correctAnswer: 0,
          explanation: "CTE синтаксисі WITH арқылы басталады.",
        },
      ],
    },
  ] satisfies CourseModule[],
};

export const courses: CourseItem[] = [
  {
    id: 1,
    title: "SQL-ге Кіріспе",
    excerpt: "SQL синтаксисі, кесте ұғымы және алғашқы сұраныстар.",
    description:
      "Бұл курс SQL-мен бірінші рет танысатын студентке арналған. Мұнда кесте логикасы, базалық SELECT сұраныстары және query нәтижесін оқу үйретіледі.",
    difficulty: "Бастауыш",
    price: 0,
    duration: "2 апта",
    progressSeed: 0,
    rating: 4.8,
    lessons: countLessons(courseModules.sqlIntro),
    category: "SQL",
    image:
      "https://images.unsplash.com/photo-1555066931-bf19f8fd1085?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    skills: ["SELECT", "FROM", "LIMIT", "кесте құрылымы"],
    modules: courseModules.sqlIntro,
    outcomes: [
      "Кесте құрылымын түсіндіре аласыз",
      "Қарапайым SELECT сұранысын жаза аласыз",
      "LIMIT және ORDER BY қолдана аласыз",
    ],
    practiceTasks: [
      {
        id: "sql-intro-task-1",
        title: "Оқу платформасының кестелері",
        brief: "DB.Learn үшін базалық кестелерді ойластырыңыз.",
        steps: [
          "Кемінде 3 кесте атауын жазыңыз",
          "Әр кестеге 3 баған ұсыныңыз",
          "Қай кестеде primary key болатынын белгілеңіз",
        ],
        answerHint: "students, courses, enrollments секілді құрылым жарайды.",
      },
    ],
    quiz: [
      {
        id: "sql-intro-quiz-1",
        question: "SELECT бөлігі не үшін керек?",
        options: ["Кестені өшіру үшін", "Қандай баған шығатынын көрсету үшін", "Байланыс орнату үшін"],
        correctAnswer: 1,
        explanation: "SELECT нәтиже ретінде қай бағандар алынатынын көрсетеді.",
      },
      {
        id: "sql-intro-quiz-2",
        question: "Алғашқы 3 жолды қай оператор шектейді?",
        options: ["LIMIT 3", "TOP 3 ғана", "ORDER 3"],
        correctAnswer: 0,
        explanation: "Бұл жобада негізгі SQL синтаксисі ретінде LIMIT қолданылып тұр.",
      },
      {
        id: "sql-intro-quiz-3",
        question: "Primary key нені береді?",
        options: ["Әр жолды бірегей анықтайды", "Тек баған атын өзгертеді", "Түсті сақтайды"],
        correctAnswer: 0,
        explanation: "Primary key әр жазбаны unique түрде ажыратады.",
      },
    ],
  },
  {
    id: 2,
    title: "SELECT және WHERE Практикумы",
    excerpt: "Нақты шарттармен дерек іздеу және сүзу дағдысы.",
    description:
      "Фильтрация, мәтіндік іздеу, AND/OR және ORDER BY-пен жұмыс істеуге арналған тәжірибелік курс.",
    difficulty: "Бастауыш",
    price: 0,
    duration: "3 апта",
    progressSeed: 0,
    rating: 4.9,
    lessons: countLessons(courseModules.sqlWhere),
    category: "SQL",
    image:
      "https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    skills: ["WHERE", "LIKE", "ORDER BY", "фильтрация"],
    modules: courseModules.sqlWhere,
    outcomes: [
      "Шартпен сүзуді қолданасыз",
      "LIKE арқылы мәтіндік іздеу жасайсыз",
      "Фильтр мен сұрыптауды біріктіресіз",
    ],
    practiceTasks: [
      {
        id: "sql-where-task-1",
        title: "Бағасы бойынша фильтр",
        brief: "Курстар арасынан керек курстарды іздеңіз.",
        steps: [
          "Бағасы 15000-нан жоғары курстарды табыңыз",
          "Оларды баға бойынша кему ретімен сұрыптаңыз",
          "Тек title мен price шығарыңыз",
        ],
        answerHint: "SELECT title, price FROM courses WHERE price > 15000 ORDER BY price DESC;",
      },
    ],
    quiz: [
      {
        id: "sql-where-quiz-1",
        question: "WHERE не істейді?",
        options: ["Жолдарды сүзеді", "Кесте құрады", "Пароль хэштейді"],
        correctAnswer: 0,
        explanation: "WHERE шарт бойынша тек керек нәтижені қалдырады.",
      },
      {
        id: "sql-where-quiz-2",
        question: "LIKE '%SQL%' нені табады?",
        options: ["SQL сөзінен басталатындарды ғана", "Ішінде SQL бар жолдарды", "Тек бос жолдарды"],
        correctAnswer: 1,
        explanation: "% мәтіннің алдында да, соңында да кез келген символ болатынын білдіреді.",
      },
      {
        id: "sql-where-quiz-3",
        question: "ORDER BY price DESC деген не?",
        options: ["Бағаны өсу ретімен", "Бағаны кему ретімен", "Бағаны жасырады"],
        correctAnswer: 1,
        explanation: "DESC үлкеннен кішіге сұрыптайды.",
      },
    ],
  },
  {
    id: 3,
    title: "JOIN Негіздері",
    excerpt: "INNER JOIN арқылы бірнеше кестемен жұмыс бастау.",
    description:
      "Primary key, foreign key және INNER JOIN логикасын түсіндіріп, байланысқан кестелерден дерек алу жолын көрсетеді.",
    difficulty: "Орташа",
    price: 0,
    duration: "3 апта",
    progressSeed: 0,
    rating: 4.7,
    lessons: countLessons(courseModules.joinIntro),
    category: "JOIN",
    image:
      "https://images.unsplash.com/photo-1642356692954-3fbb84baf1a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    skills: ["INNER JOIN", "keys", "relationships", "multi-table query"],
    modules: courseModules.joinIntro,
    outcomes: [
      "Кестелер арасындағы байланысты түсінесіз",
      "Foreign key дұрыс қолданасыз",
      "INNER JOIN сұранысын өзіңіз жазасыз",
    ],
    practiceTasks: [
      {
        id: "join-task-1",
        title: "Студент және курс",
        brief: "Жазылымдар кестесі арқылы студент пен курсты біріктіріңіз.",
        steps: [
          "students, enrollments, courses кестелерін анықтаңыз",
          "student_id және course_id байланысын жазыңыз",
          "Нәтижеде student name мен course title шығарыңыз",
        ],
        answerHint:
          "SELECT s.full_name, c.title FROM enrollments e JOIN students s ON e.student_id = s.id JOIN courses c ON e.course_id = c.id;",
      },
    ],
    quiz: [
      {
        id: "join-quiz-1",
        question: "Foreign key не үшін қажет?",
        options: ["Кестелерді байланыстыру үшін", "Тек баған санын көбейту үшін", "CSS қосу үшін"],
        correctAnswer: 0,
        explanation: "Foreign key relation орнатуға мүмкіндік береді.",
      },
      {
        id: "join-quiz-2",
        question: "INNER JOIN қандай жолдарды қайтарады?",
        options: ["Екі жақта да сәйкестігі бар жолдарды", "Сол жақтың бәрін", "Оң жақтың бәрін"],
        correctAnswer: 0,
        explanation: "INNER JOIN тек matching rows қайтарады.",
      },
      {
        id: "join-quiz-3",
        question: "JOIN кезінде байланыс шарты қай бөлімде жазылады?",
        options: ["HAVING", "ON", "LIMIT"],
        correctAnswer: 1,
        explanation: "ON бөлімінде кестелерді қалай байланыстыратынымыз жазылады.",
      },
    ],
  },
  {
    id: 4,
    title: "LEFT, RIGHT, FULL JOIN",
    excerpt: "Күрделірек байланыстар мен missing data сценарийлері.",
    description:
      "LEFT JOIN, NULL мәндері және reporting сценарийлеріндегі күрделірек байланыстыру тәсілдерін үйретеді.",
    difficulty: "Орташа",
    price: 0,
    duration: "4 апта",
    progressSeed: 0,
    rating: 4.6,
    lessons: countLessons(courseModules.joinAdvanced),
    category: "JOIN",
    image:
      "https://images.unsplash.com/photo-1744868562210-fffb7fa882d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    skills: ["LEFT JOIN", "RIGHT JOIN", "NULL", "reporting"],
    modules: courseModules.joinAdvanced,
    outcomes: [
      "LEFT JOIN нәтижесін түсіндіресіз",
      "NULL мәндерімен жұмыс істейсіз",
      "Reporting query құрасыз",
    ],
    practiceTasks: [
      {
        id: "join-adv-task-1",
        title: "Жазылмаған курстар",
        brief: "Ешкім өтпеген курстарды табыңыз.",
        steps: [
          "courses кестесін сол жаққа қойыңыз",
          "enrollments кестесін LEFT JOIN арқылы қосыңыз",
          "NULL жазбаларды фильтрлеңіз",
        ],
        answerHint:
          "SELECT c.title FROM courses c LEFT JOIN enrollments e ON c.id = e.course_id WHERE e.id IS NULL;",
      },
    ],
    quiz: [
      {
        id: "join-adv-quiz-1",
        question: "LEFT JOIN нені қайтарады?",
        options: ["Сол жақ кестенің барлық жолын", "Тек matching rows", "Ештеңе қайтармайды"],
        correctAnswer: 0,
        explanation: "LEFT JOIN сол жақ кестенің барлық жолын сақтайды.",
      },
      {
        id: "join-adv-quiz-2",
        question: "Сәйкестік болмаса JOIN нәтижесінде не шығады?",
        options: ["0", "NULL", "AUTO"],
        correctAnswer: 1,
        explanation: "Matching жоқ болса, байланысты өрістерде NULL болады.",
      },
      {
        id: "join-adv-quiz-3",
        question: "Alias не үшін пайдалы?",
        options: ["Query оқуды жеңілдетеді", "Базаны жояды", "Шифрлау жасайды"],
        correctAnswer: 0,
        explanation: "Alias ұзын кесте аттарын қысқартады.",
      },
    ],
  },
  {
    id: 5,
    title: "GROUP BY және Агрегаттар",
    excerpt: "COUNT, SUM, AVG және топтастыру логикасы.",
    description:
      "Агрегат функцияларын практикамен түсіндіріп, топталған аналитикалық сұраныстарды құруды үйретеді.",
    difficulty: "Орташа",
    price: 0,
    duration: "4 апта",
    progressSeed: 0,
    rating: 4.9,
    lessons: countLessons(courseModules.analyticsBasic),
    category: "Analytics",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    skills: ["GROUP BY", "COUNT", "SUM", "HAVING"],
    modules: courseModules.analyticsBasic,
    outcomes: [
      "COUNT, SUM, AVG қолданасыз",
      "GROUP BY арқылы топтайсыз",
      "HAVING арқылы топтарды сүзесіз",
    ],
    practiceTasks: [
      {
        id: "analytics-task-1",
        title: "Қала бойынша қолданушылар саны",
        brief: "Қай қалада қанша қолданушы бар екенін есептеңіз.",
        steps: [
          "users кестесін қолданыңыз",
          "city бойынша GROUP BY жасаңыз",
          "COUNT(*) қолданыңыз",
        ],
        answerHint: "SELECT city, COUNT(*) FROM users GROUP BY city;",
      },
    ],
    quiz: [
      {
        id: "analytics-quiz-1",
        question: "COUNT(*) нені есептейді?",
        options: ["Жол санын", "Орташа мәнді", "Баған атауын"],
        correctAnswer: 0,
        explanation: "COUNT(*) нәтижедегі жазбалар санын береді.",
      },
      {
        id: "analytics-quiz-2",
        question: "GROUP BY не үшін керек?",
        options: ["Мәліметтерді топтастыру үшін", "Кестені өшіру үшін", "Пайдаланушы қосу үшін"],
        correctAnswer: 0,
        explanation: "GROUP BY бірдей мәндерді топтайды.",
      },
      {
        id: "analytics-quiz-3",
        question: "HAVING қай кезде қолданылады?",
        options: ["Топталған нәтижені сүзгенде", "INSERT кезінде", "CSS таңдағанда"],
        correctAnswer: 0,
        explanation: "HAVING агрегаттан кейінгі фильтр үшін керек.",
      },
    ],
  },
  {
    id: 6,
    title: "Күрделі SQL Аналитика",
    excerpt: "Nested query, CTE және production-style есептер.",
    description:
      "Subquery және CTE көмегімен күрделі аналитикалық ойлауды қалыптастырады, үлкен сұраныстарды құрылымды жазуға үйретеді.",
    difficulty: "Күрделі",
    price: 0,
    duration: "5 апта",
    progressSeed: 0,
    rating: 4.8,
    lessons: countLessons(courseModules.analyticsAdvanced),
    category: "Analytics",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    skills: ["subquery", "CTE", "analytics", "advanced SQL"],
    modules: courseModules.analyticsAdvanced,
    outcomes: [
      "Subquery жазасыз",
      "CTE құрылымын дұрыс қолданасыз",
      "Күрделі есептерді бөліп шығарасыз",
    ],
    practiceTasks: [
      {
        id: "analytics-adv-task-1",
        title: "Орташа бағадан жоғары курстар",
        brief: "Subquery арқылы орташа бағадан қымбат курстарды табыңыз.",
        steps: [
          "courses кестесін қолданыңыз",
          "AVG(price) бар ішкі сұраныс жазыңыз",
          "Нәтижеде title және price шығарыңыз",
        ],
        answerHint:
          "SELECT title, price FROM courses WHERE price > (SELECT AVG(price) FROM courses);",
      },
    ],
    quiz: [
      {
        id: "analytics-adv-quiz-1",
        question: "Subquery деген не?",
        options: ["Сұраныс ішіндегі сұраныс", "Тек DELETE түрі", "Баған түсі"],
        correctAnswer: 0,
        explanation: "Subquery негізгі query ішінде орындалады.",
      },
      {
        id: "analytics-adv-quiz-2",
        question: "CTE қандай кілтсөзбен басталады?",
        options: ["JOIN", "WITH", "GROUP"],
        correctAnswer: 1,
        explanation: "CTE синтаксисі WITH арқылы ашылады.",
      },
      {
        id: "analytics-adv-quiz-3",
        question: "CTE не үшін ыңғайлы?",
        options: ["Күрделі сұранысты бөліп жазуға", "Тек сурет жүктеуге", "Браузерді жабуға"],
        correctAnswer: 0,
        explanation: "CTE query-ді түсінікті блоктарға бөледі.",
      },
    ],
  },
];

export function getCourseById(courseId: number) {
  return courses.find((course) => course.id === courseId) ?? null;
}

export function getCourseLessonCount(courseId: number) {
  const course = getCourseById(courseId);
  if (!course) {
    return 0;
  }

  return course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
}

export function getAllLessonsForCourse(courseId: number) {
  const course = getCourseById(courseId);
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
}

export const placementQuestions: PlacementQuestion[] = [
  {
    id: 1,
    question: "SQL не үшін қолданылады?",
    options: [
      "Сурет салу үшін",
      "Дерекқормен жұмыс істеу үшін",
      "Видео монтаж үшін",
      "Тек дизайн үшін",
    ],
    correctAnswer: 1,
    explanation: "SQL дерекқордағы мәліметтерді оқу, өзгерту және басқару үшін қолданылады.",
  },
  {
    id: 2,
    question: "Барлық жолды алу үшін дұрыс сұраныс қайсы?",
    options: [
      "FETCH TABLE users",
      "SELECT * FROM users",
      "GET users ALL",
      "SHOW ROWS users",
    ],
    correctAnswer: 1,
    explanation: "Кестеден барлық баған мен жолды алудың негізгі түрі: SELECT * FROM users.",
  },
  {
    id: 3,
    question: "WHERE бөлімі не істейді?",
    options: [
      "Деректерді сүзеді",
      "Кестені өшіреді",
      "Жаңа база ашады",
      "Тек түсті өзгертеді",
    ],
    correctAnswer: 0,
    explanation: "WHERE нәтиже ішінен керек жолдарды шарт арқылы сүзеді.",
  },
  {
    id: 4,
    question: "INNER JOIN нәтижесі қандай болады?",
    options: [
      "Екі кестеде сәйкес келген жолдар ғана қайтады",
      "Сол жақ кестенің бәрі қайтады",
      "Оң жақ кестенің бәрі қайтады",
      "Кестелер жойылады",
    ],
    correctAnswer: 0,
    explanation: "INNER JOIN тек екі жақта да сәйкестігі бар жазбаларды қайтарады.",
  },
  {
    id: 5,
    question: "COUNT() функциясы нені есептейді?",
    options: [
      "Орташа мәнді",
      "Жолдар санын",
      "Ең үлкен мәнді",
      "Кесте атын",
    ],
    correctAnswer: 1,
    explanation: "COUNT() жазбалар санын есептейді.",
  },
  {
    id: 6,
    question: "GROUP BY не үшін қажет?",
    options: [
      "Мәліметтерді топтастыру үшін",
      "Тек өшіру үшін",
      "Тақырып бояу үшін",
      "Файл жүктеу үшін",
    ],
    correctAnswer: 0,
    explanation: "GROUP BY бірдей мәндерді топтап, агрегатпен бірге жиі қолданылады.",
  },
];

export function getPlacementLevel(percentage: number): CourseDifficulty {
  if (percentage < 50) {
    return "Бастауыш";
  }

  if (percentage < 85) {
    return "Орташа";
  }

  return "Күрделі";
}

export function getRecommendedCourseIds(level: CourseDifficulty) {
  const priorities: Record<CourseDifficulty, CourseDifficulty[]> = {
    "Бастауыш": ["Бастауыш", "Орташа", "Күрделі"],
    "Орташа": ["Орташа", "Бастауыш", "Күрделі"],
    "Күрделі": ["Күрделі", "Орташа", "Бастауыш"],
  };

  return priorities[level]
    .flatMap((difficulty) =>
      courses.filter((course) => course.difficulty === difficulty).map((course) => course.id),
    )
    .slice(0, 3);
}
