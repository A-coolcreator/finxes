import { useState } from "react";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import ForgotPage from "./ForgotPage";

type Page = "login" | "signup" | "forgot";

interface AuthAppProps {
  onLoginSuccess?: (creds: { email?: string; password?: string }) => void;
}

export default function AuthApp({ onLoginSuccess }: AuthAppProps) {
  const [page, setPage] = useState<Page>("login");
  return (
    <>
      {page === "login"  && <LoginPage  onNavigate={setPage} onLoginSuccess={onLoginSuccess} />}
      {page === "signup" && <SignupPage onNavigate={setPage} />}
      {page === "forgot" && <ForgotPage onNavigate={setPage} />}
    </>
  );
}
