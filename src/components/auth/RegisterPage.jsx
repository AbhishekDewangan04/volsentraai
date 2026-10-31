import { useEffect } from "react";

export function RegisterPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);
  return null;
}
