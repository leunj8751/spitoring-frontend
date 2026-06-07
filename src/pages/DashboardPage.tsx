import { useId, useState } from "react";

const SAMPLE_ROWS = [
  {
    name: "스피또 1000 1회차",
    releaseRate: 0.73,
    totalTickets: 10000,
    prize1: { remaining: 2, total: 6 },
    prize2: { remaining: 10, total: 20 },
  },
  {
    name: "스피또 1000 2회차",
    releaseRate: 0.61,
    totalTickets: 10000,
    prize1: { remaining: 3, total: 6 },
    prize2: { remaining: 14, total: 20 },
  },
  {
    name: "스피또 2000 1회차",
    releaseRate: 0.85,
    totalTickets: 6000,
    prize1: { remaining: 1, total: 4 },
    prize2: { remaining: 5, total: 12 },
  },
  {
    name: "스피또 2000 2회차",
    releaseRate: 0.49,
    totalTickets: 6000,
    prize1: { remaining: 4, total: 4 },
    prize2: { remaining: 9, total: 12 },
  },
  {
    name: "스피또 500 1회차",
    releaseRate: 0.58,
    totalTickets: 15000,
    prize1: { remaining: 5, total: 10 },
    prize2: { remaining: 18, total: 30 },
  },
  {
    name: "스피또 500 2회차",
    releaseRate: 0.32,
    totalTickets: 15000,
    prize1: { remaining: 8, total: 10 },
    prize2: { remaining: 25, total: 30 },
  },
];

const SORT_OPTIONS = [
  { value: "expected_value_desc", label: "기대값 높은 순" },
  { value: "expected_value_asc", label: "기대값 낮은 순" },
  { value: "release_rate_desc", label: "출고율 높은 순" },
] as const;

type Row = (typeof SAMPLE_ROWS)[number];

function calcProbabilities(row: Row) {
  const remainingTickets = row.totalTickets * (1 - row.releaseRate);
  const base1 = (row.prize1.total / row.totalTickets) * 100;
  const current1 = (row.prize1.remaining / remainingTickets) * 100;
  const base2 = (row.prize2.total / row.totalTickets) * 100;
  const current2 = (row.prize2.remaining / remainingTickets) * 100;
  return { base1, current1, base2, current2 };
}

function ProbCell({
  label,
  base,
  current,
}: {
  label: string;
  base: number;
  current: number;
}) {
  const diff = current - base;
  const isUp = diff > 0;
  const diffText = `${isUp ? "+" : ""}${diff.toFixed(4)}%p`;

  return (
    <div>
      <p className="mb-1 text-xs text-zinc-400">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-semibold tabular-nums text-zinc-700">
          {current.toFixed(4)}%
        </span>
        <span
          className={`text-xs tabular-nums font-medium ${isUp ? "text-rose-500" : "text-blue-500"}`}
        >
          {diffText}
        </span>
      </div>
      <p className="mt-0.5 text-xs tabular-nums text-zinc-400">
        기준 {base.toFixed(4)}%
      </p>
    </div>
  );
}

function AccordionItem({ row }: { row: Row }) {
  const [open, setOpen] = useState(false);
  const { base1, current1, base2, current2 } = calcProbabilities(row);

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-2 py-3.5 text-left hover:bg-zinc-50"
      >
        <span className="font-medium text-zinc-800">{row.name}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">
            출고율{" "}
            <span className="font-semibold text-zinc-800">
              {(row.releaseRate * 100).toFixed(0)}%
            </span>
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
            <ProbCell label="1등 당첨확률" base={base1} current={current1} />
            <p className="mt-1.5 text-xs tabular-nums text-zinc-400">
              잔여 {row.prize1.remaining}/{row.prize1.total}장
            </p>
          </div>
          <div>
            <ProbCell label="2등 당첨확률" base={base2} current={current2} />
            <p className="mt-1.5 text-xs tabular-nums text-zinc-400">
              잔여 {row.prize2.remaining}/{row.prize2.total}장
            </p>
          </div>
        </div>
      )}
    </li>
  );
}

export function DashboardPage() {
  const sortFieldId = useId();
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]["value"]>(
    "expected_value_desc",
  );

  return (
    <div className="py-10">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="mb-3 flex justify-end">
          <select
            id={sortFieldId}
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as (typeof SORT_OPTIONS)[number]["value"])
            }
            className="min-w-[11rem] rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/30"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <ul className="divide-y divide-zinc-100">
          {SAMPLE_ROWS.map((row, i) => (
            <AccordionItem key={i} row={row} />
          ))}
        </ul>
      </div>
    </div>
  );
}
