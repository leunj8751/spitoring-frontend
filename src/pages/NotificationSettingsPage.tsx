import { useEffect, useState } from "react";

type SpittoType = "500" | "1000" | "2000";
type ApiSpittoType = "SP500" | "SP1000" | "SP2000";

interface NotificationCondition {
  id: number;
  spittoType: ApiSpittoType;
  releaseRate: number;
  rnk1RemainingMin: number | null;
  rnk2RemainingMin: number | null;
  createdAt: string;
}

const API_SPITTO_MAP: Record<ApiSpittoType, SpittoType> = {
  SP500: "500",
  SP1000: "1000",
  SP2000: "2000",
};

const SPITTO_TYPES = [
  { value: "500" as SpittoType, label: "스피또 500", faceValue: 500, avgPblcnQty: 20_000_000 },
  { value: "1000" as SpittoType, label: "스피또 1000", faceValue: 1000, avgPblcnQty: 57_500_000 },
  { value: "2000" as SpittoType, label: "스피또 2000", faceValue: 2000, avgPblcnQty: 35_000_000 },
];

function calcProbability(numerator: number, denominator: number): number {
  return denominator > 0 ? (numerator / denominator) * 100 : 0;
}

function CounterButton({
  label,
  value,
  onChange,
  selected,
  onSelect,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div className={selected ? "" : "opacity-40"}>
      <label className="mb-2 flex cursor-pointer items-center gap-2">
        <input
          type="radio"
          checked={selected}
          onChange={onSelect}
          className="h-4 w-4 cursor-pointer accent-[#0066b3]"
        />
        <span className="text-sm font-medium text-zinc-700">{label}</span>
      </label>
      <div className="flex items-center gap-3 pl-6">
        <button
          disabled={!selected}
          onClick={() => onChange(Math.max(1, value - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 text-lg font-medium text-zinc-600 transition-colors hover:bg-zinc-50 active:bg-zinc-100 disabled:cursor-not-allowed"
        >
          −
        </button>
        <span className="w-24 text-center text-sm font-semibold text-zinc-900">
          {value}장 이상
        </span>
        <button
          disabled={!selected}
          onClick={() => onChange(value + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 text-lg font-medium text-zinc-600 transition-colors hover:bg-zinc-50 active:bg-zinc-100 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function NotificationSettingsPage() {
  const [selectedType, setSelectedType] = useState<SpittoType>("1000");
  const [releaseRate, setReleaseRate] = useState(80);
  const [firstPrizeMin, setFirstPrizeMin] = useState(2);
  const [secondPrizeMin, setSecondPrizeMin] = useState(5);
  const [prizeTarget, setPrizeTarget] = useState<"rnk1" | "rnk2">("rnk1");
  const [savedConditions, setSavedConditions] = useState<NotificationCondition[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchNotifications() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) {
        setSavedConditions(json.data);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  const currentSpitto = SPITTO_TYPES.find((t) => t.value === selectedType)!;
  const remainingTickets = currentSpitto.avgPblcnQty * (1 - releaseRate / 100);
  const activeCount = prizeTarget === "rnk1" ? firstPrizeMin : secondPrizeMin;
  const currentProb = calcProbability(activeCount, remainingTickets);
  const baseProb = calcProbability(activeCount, currentSpitto.avgPblcnQty);
  const probDiff = currentProb - baseProb;

  async function handleAdd() {
    const body = {
      spittoType: selectedType,
      releaseRate,
      rnk1RemainingMin: prizeTarget === "rnk1" ? firstPrizeMin : null,
      rnk2RemainingMin: prizeTarget === "rnk2" ? secondPrizeMin : null,
    };

    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      alert("알림 추가에 실패했습니다.");
      return;
    }

    await fetchNotifications();
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("알림 삭제에 실패했습니다.");
      return;
    }
    setSavedConditions((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="py-10">
      <div className="mx-auto max-w-lg space-y-6 px-4">
        {/* 새로운 알림 조건 만들기 */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-5 py-4">
            <h2 className="text-base font-semibold text-zinc-900">
              🔔 알림설정
            </h2>
          </div>

          <div className="space-y-6 px-5 py-5">
            {/* 스피또 종류 */}
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700">
                스피또 종류 선택
              </p>
              <div className="flex gap-2">
                {SPITTO_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={[
                      "flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors",
                      selectedType === type.value
                        ? "border-[#0066b3] bg-[#0066b3] text-white"
                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50",
                    ].join(" ")}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 출고율 슬라이더 */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-700">
                  🎯 출고율 (최소 퍼센트)
                </p>
                <span className="text-sm font-semibold text-[#0066b3]">
                  {releaseRate}% 이상
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={releaseRate}
                onChange={(e) => setReleaseRate(Number(e.target.value))}
                className="w-full accent-[#0066b3]"
              />
              <div className="mt-1 flex justify-between text-xs text-zinc-400">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* 1등 잔여 수량 */}
            <CounterButton
              label="🏆 1등 잔여 수량 (최소)"
              value={firstPrizeMin}
              onChange={setFirstPrizeMin}
              selected={prizeTarget === "rnk1"}
              onSelect={() => setPrizeTarget("rnk1")}
            />

            {/* 2등 잔여 수량 */}
            <CounterButton
              label="🥈 2등 잔여 수량 (최소)"
              value={secondPrizeMin}
              onChange={setSecondPrizeMin}
              selected={prizeTarget === "rnk2"}
              onSelect={() => setPrizeTarget("rnk2")}
            />

            {/* 예상 기댓값 */}
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="mb-1 text-xs text-zinc-500">
                💡 현재 조건의 예상 기댓값
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-[#0066b3]">
                  {currentProb.toFixed(6)}%
                </span>
                <span
                  className={`text-sm font-medium ${
                    probDiff >= 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  (정상가 대비 {probDiff >= 0 ? "+" : ""}{probDiff.toFixed(6)}%)
                </span>
              </div>
              <p className="mt-1.5 text-xs text-zinc-400">
                * 위 조건 만족 시 앱 푸시 알림이 발송됩니다.
              </p>
            </div>

            {/* 추가 버튼 */}
            <button
              onClick={handleAdd}
              className="w-full rounded-lg bg-[#0066b3] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005a9e] active:bg-[#004f8a]"
            >
              ➕ 이 조건으로 알림 추가하기
            </button>
          </div>
        </div>

        {/* 저장된 알림 목록 */}
        {isLoading ? (
          <div className="rounded-xl border border-zinc-200 bg-white px-5 py-8 text-center text-sm text-zinc-400 shadow-sm">
            알림 목록을 불러오는 중...
          </div>
        ) : savedConditions.length > 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-5 py-4">
              <h2 className="text-base font-semibold text-zinc-900">
                저장된 알림 목록{" "}
                <span className="text-sm font-normal text-zinc-400">
                  ({savedConditions.length}개)
                </span>
              </h2>
            </div>

            <div className="divide-y divide-zinc-100">
              {savedConditions.map((cond) => {
                const spittoValue = API_SPITTO_MAP[cond.spittoType];
                const spitto = SPITTO_TYPES.find((t) => t.value === spittoValue)!;
                const remaining = spitto.avgPblcnQty * (1 - cond.releaseRate / 100);
                const condCount =
                  (cond.rnk1RemainingMin ?? 0) + (cond.rnk2RemainingMin ?? 0);
                const prob = calcProbability(condCount, remaining);
                return (
                  <div key={cond.id} className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span>🎫</span>
                      <span className="text-sm font-semibold text-zinc-900">
                        {spitto.label}
                      </span>
                    </div>

                    <ul className="mt-2 space-y-0.5 pl-6 text-xs text-zinc-500">
                      <li>• 출고율: {cond.releaseRate}% 이상</li>
                      {cond.rnk1RemainingMin !== null && (
                        <li>• 1등 잔여: {cond.rnk1RemainingMin}장 이상</li>
                      )}
                      {cond.rnk2RemainingMin !== null && (
                        <li>• 2등 잔여: {cond.rnk2RemainingMin}장 이상</li>
                      )}
                      <li>• 당첨확률: {prob.toFixed(6)}% 이상</li>
                    </ul>

                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleDelete(cond.id)}
                        className="text-xs text-zinc-400 transition-colors hover:text-red-500"
                      >
                        삭제 🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
