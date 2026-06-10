import { useEffect, useId, useState } from "react";

interface DashboardItem {
  gameTypeCd: string;
  gameTypeNm: string;
  draw: number;
  stockRate: number;
  rnk1Remaining: number;
  rnk1Total: number;
  rnk2Remaining: number;
  rnk2Total: number;
  rnk1AvgWinProbability: number;
  rnk1CurrentWinProbability: number;
  rnk2AvgWinProbability: number;
  rnk2CurrentWinProbability: number;
}

const SORT_OPTIONS = [
  { value: "game_type", label: "스피또 종류 순" },
  { value: "current_prob_desc", label: "현재 당첨확률 높은 순" },
] as const;

function ProbCell({ label, avg, current }: { label: string; avg: number; current: number }) {
  const diff = current - avg;
  const isUp = diff > 0;

  return (
    <div>
      <p className="mb-1 text-xs text-zinc-400">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-semibold tabular-nums text-zinc-700">
          {current.toFixed(6)}%
        </span>
        <span className={`text-xs tabular-nums font-medium ${isUp ? "text-rose-500" : "text-blue-500"}`}>
          {isUp ? "+" : ""}{diff.toFixed(6)}%p
        </span>
      </div>
      <p className="mt-0.5 text-xs tabular-nums text-zinc-400">기준 {avg.toFixed(6)}%</p>
    </div>
  );
}

function AccordionItem({ item }: { item: DashboardItem }) {
  const [open, setOpen] = useState(false);

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-2 py-3.5 text-left hover:bg-zinc-50"
      >
        <span className="font-medium text-zinc-800">
          {item.gameTypeNm} {item.draw}회차
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">
            출고율 <span className="font-semibold text-zinc-800">{item.stockRate}%</span>
          </span>
          <svg
            className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {open && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-2 pb-4 pt-1">
          <div>
            <ProbCell label="1등 당첨확률" avg={item.rnk1AvgWinProbability} current={item.rnk1CurrentWinProbability} />
            <p className="mt-1.5 text-xs tabular-nums text-zinc-400">
              잔여 {item.rnk1Remaining}/{item.rnk1Total}장
            </p>
          </div>
          <div>
            <ProbCell label="2등 당첨확률" avg={item.rnk2AvgWinProbability} current={item.rnk2CurrentWinProbability} />
            <p className="mt-1.5 text-xs tabular-nums text-zinc-400">
              잔여 {item.rnk2Remaining}/{item.rnk2Total}장
            </p>
          </div>
        </div>
      )}
    </li>
  );
}

function sortItems(items: DashboardItem[], sortBy: (typeof SORT_OPTIONS)[number]["value"]) {
  return [...items].sort((a, b) => {
    if (sortBy === "game_type") return a.gameTypeCd.localeCompare(b.gameTypeCd);
    if (sortBy === "current_prob_desc") return b.rnk1CurrentWinProbability - a.rnk1CurrentWinProbability;
    return 0;
  });
}

export function DashboardPage() {
  const sortFieldId = useId();
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]["value"]>("game_type");
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/lottery/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
        return res.json();
      })
      .then((json) => {
        if (json.success) setItems(json.data.items);
        else throw new Error("데이터를 불러오지 못했습니다.");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const sorted = sortItems(items, sortBy);

  return (
    <div className="py-10">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="mb-3 flex justify-end">
          <select
            id={sortFieldId}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as (typeof SORT_OPTIONS)[number]["value"])}
            className="min-w-[11rem] rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/30"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <p className="py-10 text-center text-sm text-zinc-400">불러오는 중...</p>
        )}

        {error && (
          <p className="py-10 text-center text-sm text-rose-500">{error}</p>
        )}

        {!loading && !error && (
          <ul className="divide-y divide-zinc-100">
            {sorted.map((item) => (
              <AccordionItem key={`${item.gameTypeCd}-${item.draw}`} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
