import { Link, NavLink } from "react-router-dom";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "text-sm font-medium transition-colors",
    isActive ? "text-white" : "text-white/80 hover:text-white",
  ].join(" ");

export function Header() {
  return (
    <header className="h-[52px] border-b border-[#005a9e] bg-[#0066b3]">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        <Link
          to="/"
          className="text-base font-semibold tracking-tight text-white hover:text-white/90"
        >
          스피또링
        </Link>
        <nav className="flex items-center gap-6" aria-label="주요 메뉴">
          <NavLink to="/notifications" className={navLinkClass}>
            알림 설정
          </NavLink>
          <NavLink to="/purchases" className={navLinkClass}>
            구매 기록
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
