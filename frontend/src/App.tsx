import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import AuthPage from "./components/AuthPage";
import HomePage from "./components/HomePage";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={<AuthPage initialPanel="login" accountType="customer" />}
            />
            <Route
              path="/signup"
              element={
                <AuthPage initialPanel="signup" accountType="customer" />
              }
            />
            <Route
              path="/vendor/login"
              element={<AuthPage initialPanel="login" accountType="vendor" />}
            />
            <Route
              path="/vendor/register"
              element={<AuthPage initialPanel="signup" accountType="vendor" />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
