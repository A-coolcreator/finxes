import { useState } from "react";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import ForgotPage from "./ForgotPage";

type Page = "login" | "signup" | "forgot";

export default function AuthApp() {
  const [page, setPage] = useState<Page>("login");
  return (
    <>
      {page === "login"  && <LoginPage  onNavigate={setPage} />}
      {page === "signup" && <SignupPage onNavigate={setPage} />}
      {page === "forgot" && <ForgotPage onNavigate={setPage} />}
    </>
  );
}
