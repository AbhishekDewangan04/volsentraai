import { useEffect } from "react";

export function ResetPasswordPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);
  return null;
}
