import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import { cn } from "@/lib/utils";

import Dashboard from "./pages/Dashboard";
import LocationDetail from "./pages/LocationDetail";
import DataEntry from "./pages/DataEntry";
import Alerts from "./pages/Alerts";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

function AppShell() {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <div className={cn("min-h-screen app-gradient", !isLogin && "flex")}>
      {!isLogin && <Sidebar />}
      <main
        className={cn(
          "flex-1",
          isLogin ? "flex min-h-screen items-stretch" : "overflow-y-auto"
        )}
      >
        <div
          className={cn(
            "mx-auto w-full",
            isLogin ? "flex flex-1 items-center justify-center px-4 py-12" : "max-w-7xl px-4 py-6 md:px-8 md:py-8 lg:px-10"
          )}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/locations/:id" element={<LocationDetail />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/data-entry"
              element={
                <ProtectedRoute roles={["administrator", "data_manager"]}>
                  <DataEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute roles={["administrator"]}>
                  <Alerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["administrator"]}>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
