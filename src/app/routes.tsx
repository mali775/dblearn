import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import CourseLearnPage from "./pages/CourseLearnPage";
import LearningProgressPage from "./pages/LearningProgressPage";
import RegistrationPage from "./pages/RegistrationPage";
import LoginPage from "./pages/LoginPage";
import QuizPage from "./pages/QuizPage";
import AdminPage from "./pages/AdminPage";
import Lab4Page from "../pages/Lab4Page";
import Lab5Layout from "../pages/lab5/Lab5Layout";
import Lab5HomePage from "../pages/lab5/Lab5HomePage";
import Lab5CoursesPage from "../pages/lab5/Lab5CoursesPage";
import Lab5CourseDetailsPage from "../pages/lab5/Lab5CourseDetailsPage";
import Lab5LoginPage from "../pages/lab5/Lab5LoginPage";
import Lab5RegisterPage from "../pages/lab5/Lab5RegisterPage";
import Lab5ProtectedRoute from "../pages/lab5/Lab5ProtectedRoute";
import Lab5ProfilePage from "../pages/lab5/Lab5ProfilePage";
import Lab5NotFoundPage from "../pages/lab5/Lab5NotFoundPage";
import Lab6Page from "../pages/lab6/Lab6Page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/courses",
    Component: CoursesPage,
  },
  {
    path: "/courses/:courseId",
    Component: CourseLearnPage,
  },
  {
    path: "/progress",
    Component: LearningProgressPage,
  },
  {
    path: "/register",
    Component: RegistrationPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/quiz",
    Component: QuizPage,
  },
  {
    path: "/admin",
    Component: AdminPage,
  },
  {
    path: "/lab4",
    Component: Lab4Page,
  },
  {
    path: "/lab5",
    Component: Lab5Layout,
    children: [
      {
        index: true,
        Component: Lab5HomePage,
      },
      {
        path: "courses",
        Component: Lab5CoursesPage,
      },
      {
        path: "courses/:courseId",
        Component: Lab5CourseDetailsPage,
      },
      {
        path: "login",
        Component: Lab5LoginPage,
      },
      {
        path: "register",
        Component: Lab5RegisterPage,
      },
      {
        Component: Lab5ProtectedRoute,
        children: [
          {
            path: "profile",
            Component: Lab5ProfilePage,
          },
        ],
      },
      {
        path: "*",
        Component: Lab5NotFoundPage,
      },
    ],
  },
  {
    path: "/lab6",
    Component: Lab6Page,
  },
]);
