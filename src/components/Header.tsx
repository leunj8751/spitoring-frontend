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
          <NavLink to="/notifications" className={navLinkClass} aria-label="알림 설정">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.91V4a1 1 0 0 0-2 0v1.09A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </NavLink>
          <NavLink to="/purchases" className={navLinkClass} aria-label="구매 기록">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-5 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
            </svg>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
