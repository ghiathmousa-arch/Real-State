import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/dashboard/Login";
import AdminRoute from "./AdminRoute";
// Dashboard pages (سنضيفها لاحقاً)
import Overview from "../pages/dashboard/Overview";




export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },

  {
    path: "/dashboard",
    element: (
      <AdminRoute>
        <Overview />
      </AdminRoute>
    ),
  },
]);