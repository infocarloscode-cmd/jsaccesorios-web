import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import PublicSite from "./PublicSite";
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminProductList from "./admin/AdminProductList";
import AdminProductForm from "./admin/AdminProductForm";
import AdminSettings from "./admin/AdminSettings";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminProductList />} />
              <Route path="productos/nuevo" element={<AdminProductForm />} />
              <Route path="productos/:id" element={<AdminProductForm />} />
              <Route path="configuracion" element={<AdminSettings />} />
            </Route>
            <Route path="/*" element={<PublicSite />} />
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
