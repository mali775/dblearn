import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DB_DIR, "lab6.sqlite");
const PORT = Number(process.env.PORT || 3001);
const DIFFICULTIES = new Set(["Бастауыш", "Орташа", "Күрделі"]);
const SALT_ROUNDS = 10;
const ADMIN_EMAIL = "admin@dblearn.kz";
const ADMIN_PASSWORD = "Admin123!";

fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Сұраныс көлемі тым үлкен."));
      }
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("JSON форматы қате."));
      }
    });

    req.on("error", reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-User-Role,X-User-Email",
  });
  res.end(JSON.stringify(payload));
}

function mapSessionUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    isApproved: Boolean(row.is_approved),
    createdAt: row.created_at,
  };
}

function requireAdmin(req) {
  const role = req.headers["x-user-role"];
  const email = req.headers["x-user-email"];
  return role === "admin" && email === ADMIN_EMAIL;
}

function validateCourseInput(payload) {
  const errors = {};
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const description =
    typeof payload.description === "string" ? payload.description.trim() : "";
  const difficulty =
    typeof payload.difficulty === "string" ? payload.difficulty.trim() : "";
  const price = Number(payload.price);
  const lessons = Number(payload.lessons);
  const categoryId = Number(payload.categoryId);
  const teacherId = Number(payload.teacherId);

  if (title.length < 3) {
    errors.title = "Атауы кемінде 3 таңбадан тұруы керек.";
  }
  if (description.length < 10) {
    errors.description = "Сипаттама кемінде 10 таңба болуы керек.";
  }
  if (!DIFFICULTIES.has(difficulty)) {
    errors.difficulty = "Деңгей дұрыс таңдалмады.";
  }
  if (!Number.isFinite(price) || price <= 0) {
    errors.price = "Бағасы 0-ден үлкен болуы керек.";
  }
  if (!Number.isInteger(lessons) || lessons <= 0) {
    errors.lessons = "Сабақ саны дұрыс емес.";
  }
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    errors.categoryId = "Санат таңдалуы керек.";
  }
  if (!Number.isInteger(teacherId) || teacherId <= 0) {
    errors.teacherId = "Оқытушы таңдалуы керек.";
  }

  return {
    errors,
    data: {
      title,
      description,
      difficulty,
      price,
      lessons,
      categoryId,
      teacherId,
    },
  };
}

function validateRegisterInput(payload) {
  const errors = {};
  const fullName =
    typeof payload.fullName === "string" ? payload.fullName.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!fullName) {
    errors.fullName = "Аты-жөні бос болмауы керек.";
  }
  if (!/^\d{11}$/.test(phone)) {
    errors.phone = "Телефон 11 саннан тұруы керек.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Email форматы дұрыс емес.";
  }
  if (!/^(?=.*\d).{6,}$/.test(password)) {
    errors.password = "Құпия сөз кемінде 6 таңба және 1 саннан тұруы керек.";
  }
  if (email === ADMIN_EMAIL) {
    errors.email = "Бұл email әкімші үшін сақталған.";
  }

  return {
    errors,
    data: {
      fullName,
      phone,
      email,
      password,
    },
  };
}

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      difficulty TEXT NOT NULL CHECK (difficulty IN ('Бастауыш', 'Орташа', 'Күрделі')),
      price REAL NOT NULL CHECK (price > 0),
      lessons INTEGER NOT NULL CHECK (lessons > 0),
      category_id INTEGER NOT NULL,
      teacher_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      is_approved INTEGER NOT NULL DEFAULT 1 CHECK (is_approved IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const insertCategory = db.prepare(`
    INSERT INTO categories (name)
    SELECT ?
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = ?)
  `);

  const insertTeacher = db.prepare(`
    INSERT INTO teachers (full_name, email)
    SELECT ?, ?
    WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE email = ?)
  `);

  const insertCourse = db.prepare(`
    INSERT INTO courses (title, description, difficulty, price, lessons, category_id, teacher_id)
    SELECT ?, ?, ?, ?, ?, ?, ?
    WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = ?)
  `);

  insertCategory.run("SQL", "SQL");
  insertCategory.run("JOIN", "JOIN");
  insertCategory.run("Analytics", "Analytics");

  insertTeacher.run("Айдана Серікқызы", "aidana@dblearn.kz", "aidana@dblearn.kz");
  insertTeacher.run("Нұржан Төлеген", "nurzhan@dblearn.kz", "nurzhan@dblearn.kz");
  insertTeacher.run("Мадина Ермек", "madina@dblearn.kz", "madina@dblearn.kz");

  insertCourse.run(
    "SQL негіздері",
    "SELECT, FROM және WHERE операторларымен жұмыс.",
    "Бастауыш",
    12000,
    12,
    1,
    1,
    "SQL негіздері",
  );
  insertCourse.run(
    "JOIN практикасы",
    "Байланысқан кестелерден JOIN арқылы дерек алу.",
    "Орташа",
    18500,
    16,
    2,
    2,
    "JOIN практикасы",
  );
  insertCourse.run(
    "SQL аналитика",
    "GROUP BY, COUNT және есеп беру сұраныстары.",
    "Күрделі",
    26000,
    18,
    3,
    3,
    "SQL аналитика",
  );

  const adminExists = db
    .prepare("SELECT id FROM users WHERE email = ? LIMIT 1")
    .get(ADMIN_EMAIL);

  if (!adminExists) {
    const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, SALT_ROUNDS);
    db.prepare(`
      INSERT INTO users (full_name, phone, email, password_hash, role, is_approved)
      VALUES (?, ?, ?, ?, 'admin', 1)
    `).run("DB.Learn Admin", "87000000000", ADMIN_EMAIL, passwordHash);
  }
}

initializeDatabase();

const listCoursesStatement = db.prepare(`
  SELECT
    c.id,
    c.title,
    c.description,
    c.difficulty,
    c.price,
    c.lessons,
    c.category_id AS categoryId,
    c.teacher_id AS teacherId,
    c.created_at AS createdAt,
    cat.name AS categoryName,
    t.full_name AS teacherName,
    t.email AS teacherEmail
  FROM courses c
  JOIN categories cat ON cat.id = c.category_id
  JOIN teachers t ON t.id = c.teacher_id
  WHERE (? = '' OR lower(c.title) LIKE '%' || lower(?) || '%')
  ORDER BY c.id DESC
  LIMIT ? OFFSET ?
`);

const countCoursesStatement = db.prepare(`
  SELECT COUNT(*) AS total
  FROM courses c
  WHERE (? = '' OR lower(c.title) LIKE '%' || lower(?) || '%')
`);

const courseByIdStatement = db.prepare(`
  SELECT
    c.id,
    c.title,
    c.description,
    c.difficulty,
    c.price,
    c.lessons,
    c.category_id AS categoryId,
    c.teacher_id AS teacherId,
    c.created_at AS createdAt,
    cat.name AS categoryName,
    t.full_name AS teacherName,
    t.email AS teacherEmail
  FROM courses c
  JOIN categories cat ON cat.id = c.category_id
  JOIN teachers t ON t.id = c.teacher_id
  WHERE c.id = ?
  LIMIT 1
`);

const insertCourseStatement = db.prepare(`
  INSERT INTO courses (title, description, difficulty, price, lessons, category_id, teacher_id)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const updateCourseStatement = db.prepare(`
  UPDATE courses
  SET title = ?, description = ?, difficulty = ?, price = ?, lessons = ?, category_id = ?, teacher_id = ?
  WHERE id = ?
`);

const deleteCourseStatement = db.prepare("DELETE FROM courses WHERE id = ?");

const categoriesStatement = db.prepare(`
  SELECT id, name, created_at AS createdAt
  FROM categories
  ORDER BY name ASC
`);

const teachersStatement = db.prepare(`
  SELECT id, full_name AS fullName, email, created_at AS createdAt
  FROM teachers
  ORDER BY full_name ASC
`);

const statsStatement = db.prepare(`
  SELECT
    (SELECT COUNT(*) FROM categories) AS categoriesCount,
    (SELECT COUNT(*) FROM teachers) AS teachersCount,
    (SELECT COUNT(*) FROM courses) AS coursesCount,
    (SELECT COUNT(*) FROM courses WHERE difficulty = 'Бастауыш') AS beginnerCount,
    (SELECT COUNT(*) FROM courses WHERE difficulty = 'Орташа') AS intermediateCount,
    (SELECT COUNT(*) FROM courses WHERE difficulty = 'Күрделі') AS advancedCount,
    (SELECT COUNT(*) FROM users WHERE role = 'user') AS usersCount
`);

const userByEmailStatement = db.prepare(`
  SELECT id, full_name, phone, email, password_hash, role, is_approved, created_at
  FROM users
  WHERE email = ?
  LIMIT 1
`);

const insertUserStatement = db.prepare(`
  INSERT INTO users (full_name, phone, email, password_hash, role, is_approved)
  VALUES (?, ?, ?, ?, 'user', 1)
`);

const usersListStatement = db.prepare(`
  SELECT
    id,
    full_name AS fullName,
    phone,
    email,
    role,
    is_approved AS isApproved,
    created_at AS createdAt
  FROM users
  ORDER BY created_at DESC
`);

const server = createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendJson(res, 400, { message: "Сұраныс дұрыс емес." });
    return;
  }

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  const url = new URL(req.url, "http://localhost");
  const pathname = url.pathname;

  try {
    if (req.method === "GET" && pathname === "/api/lab6/health") {
      sendJson(res, 200, {
        status: "ok",
        database: DB_PATH,
        stats: statsStatement.get(),
      });
      return;
    }

    if (req.method === "GET" && pathname === "/api/lab6/categories") {
      sendJson(res, 200, categoriesStatement.all());
      return;
    }

    if (req.method === "GET" && pathname === "/api/lab6/teachers") {
      sendJson(res, 200, teachersStatement.all());
      return;
    }

    if (req.method === "GET" && pathname === "/api/lab6/stats") {
      sendJson(res, 200, statsStatement.get());
      return;
    }

    if (req.method === "GET" && pathname === "/api/lab6/courses") {
      const page = Math.max(1, Number(url.searchParams.get("page") || 1));
      const pageSize = Math.min(20, Math.max(1, Number(url.searchParams.get("pageSize") || 5)));
      const search = (url.searchParams.get("search") || "").trim();
      const offset = (page - 1) * pageSize;
      const countRow = countCoursesStatement.get(search, search);
      const total = Number(countRow.total || 0);
      const items = listCoursesStatement.all(search, search, pageSize, offset);

      sendJson(res, 200, {
        items,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      });
      return;
    }

    const courseIdMatch = pathname.match(/^\/api\/lab6\/courses\/(\d+)$/);

    if (req.method === "GET" && courseIdMatch) {
      const course = courseByIdStatement.get(Number(courseIdMatch[1]));
      if (!course) {
        sendJson(res, 404, { message: "Курс табылмады." });
        return;
      }

      sendJson(res, 200, course);
      return;
    }

    if (req.method === "POST" && pathname === "/api/lab6/courses") {
      const payload = await parseJsonBody(req);
      const { errors, data } = validateCourseInput(payload);

      if (Object.keys(errors).length > 0) {
        sendJson(res, 422, { message: "Валидация қатесі.", errors });
        return;
      }

      const result = insertCourseStatement.run(
        data.title,
        data.description,
        data.difficulty,
        data.price,
        data.lessons,
        data.categoryId,
        data.teacherId,
      );

      sendJson(res, 201, {
        message: "Курс сәтті қосылды.",
        item: courseByIdStatement.get(result.lastInsertRowid),
      });
      return;
    }

    if (req.method === "PUT" && courseIdMatch) {
      const id = Number(courseIdMatch[1]);
      const existing = courseByIdStatement.get(id);

      if (!existing) {
        sendJson(res, 404, { message: "Өңделетін курс табылмады." });
        return;
      }

      const payload = await parseJsonBody(req);
      const { errors, data } = validateCourseInput(payload);

      if (Object.keys(errors).length > 0) {
        sendJson(res, 422, { message: "Валидация қатесі.", errors });
        return;
      }

      updateCourseStatement.run(
        data.title,
        data.description,
        data.difficulty,
        data.price,
        data.lessons,
        data.categoryId,
        data.teacherId,
        id,
      );

      sendJson(res, 200, {
        message: "Курс сәтті жаңартылды.",
        item: courseByIdStatement.get(id),
      });
      return;
    }

    if (req.method === "DELETE" && courseIdMatch) {
      const id = Number(courseIdMatch[1]);
      const existing = courseByIdStatement.get(id);

      if (!existing) {
        sendJson(res, 404, { message: "Жойылатын курс табылмады." });
        return;
      }

      deleteCourseStatement.run(id);
      sendJson(res, 200, { message: "Курс жойылды." });
      return;
    }

    if (req.method === "POST" && pathname === "/api/auth/register") {
      const payload = await parseJsonBody(req);
      const { errors, data } = validateRegisterInput(payload);

      if (Object.keys(errors).length > 0) {
        sendJson(res, 422, { message: "Валидация қатесі.", errors });
        return;
      }

      const existingUser = userByEmailStatement.get(data.email);
      if (existingUser) {
        sendJson(res, 409, { message: "Бұл email арқылы тіркелгі бұрыннан бар." });
        return;
      }

      const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
      const result = insertUserStatement.run(
        data.fullName,
        data.phone,
        data.email,
        passwordHash,
      );

      const createdUser = db
        .prepare(`
          SELECT id, full_name, email, role, is_approved, created_at
          FROM users
          WHERE id = ?
          LIMIT 1
        `)
        .get(result.lastInsertRowid);

      sendJson(res, 201, {
        message: "Тіркелу сәтті аяқталды.",
        user: mapSessionUser(createdUser),
      });
      return;
    }

    if (req.method === "POST" && pathname === "/api/auth/login") {
      const payload = await parseJsonBody(req);
      const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
      const password = typeof payload.password === "string" ? payload.password : "";

      if (!email || !password) {
        sendJson(res, 422, { message: "Email және құпия сөз міндетті." });
        return;
      }

      const user = userByEmailStatement.get(email);
      if (!user) {
        sendJson(res, 401, { message: "Email немесе құпия сөз қате." });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        sendJson(res, 401, { message: "Email немесе құпия сөз қате." });
        return;
      }

      sendJson(res, 200, {
        message: "Кіру сәтті орындалды.",
        user: mapSessionUser(user),
      });
      return;
    }

    if (req.method === "GET" && pathname === "/api/auth/users") {
      if (!requireAdmin(req)) {
        sendJson(res, 403, { message: "Бұл ресурс тек әкімшіге ашық." });
        return;
      }

      sendJson(res, 200, usersListStatement.all());
      return;
    }

    sendJson(res, 404, { message: "Маршрут табылмады." });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        sendJson(res, 409, { message: "Бұл дерек база ішінде қайталанып тұр." });
        return;
      }
    }

    const message =
      error instanceof Error ? error.message : "Серверде белгісіз қате пайда болды.";

    sendJson(res, 500, { message });
  }
});

server.listen(PORT, () => {
  console.log(`Lab 6 API іске қосылды: http://localhost:${PORT}`);
  console.log(`SQLite файлы: ${DB_PATH}`);
});
