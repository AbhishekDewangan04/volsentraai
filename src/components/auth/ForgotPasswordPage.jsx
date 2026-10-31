import { useEffect } from "react";

export function ForgotPasswordPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);
  return null;
}
