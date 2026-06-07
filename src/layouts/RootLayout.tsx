import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";

export function RootLayout() {
  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900">
      <Header />
      <Outlet />
    </div>
  );
}
