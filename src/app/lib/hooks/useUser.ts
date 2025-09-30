import { User } from "@/app/types/user";
import { useEffect, useState } from "react";


export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8080/usuarios", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("No autorizado");
        const data = await res.json();
        const mail = atob(token.split(".")[1]);
        setUser(data.content.find((u: User) => u.mail === mail));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
}
