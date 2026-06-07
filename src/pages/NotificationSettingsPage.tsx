import { useState } from "react";

type SpittoType = "500" | "1000" | "2000";

interface NotificationCondition {
  id: string;
  spittoType: SpittoType;
  releaseRate: number;
  firstPrizeMin: number;
  secondPrizeMin: number;
  enabled: boolean;
}

const SPITTO_TYPES = [
  { value: "500" as SpittoType, label: "스피또 500", faceValue: 500 },
  { value: "1000" as SpittoType, label: "스피또 1000", faceValue: 1000 },
  { value: "2000" as SpittoType, label: "스피또 2000", faceValue: 2000 },
];

function calcExpectedValue(
  faceValue: number,
  releaseRate: number,
  firstPrize: number,
  secondPrize: number,
): number {
  const base = faceValue * (releaseRate / 100);
  const bonus = firstPrize * faceValue * 0.05 + secondPrize * faceValue * 0.02;
  return Math.round(base + bonus);
}

function CounterButton({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-zinc-700">{label}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 text-lg font-medium text-zinc-600 transition-colors hover:bg-zinc-50 active:bg-zinc-100"
        >
          −
        </button>
        <span className="w-24 text-center text-sm font-semibold text-zinc-900">
          {value}장 이상
        </span>
        <button
          onClick={() => onChange(value + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 text-lg font-medium text-zinc-600 transition-colors hover:bg-zinc-50 active:bg-zinc-100"
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
  const [savedConditions, setSavedConditions] = useState<NotificationCondition[]>([]);

  const currentSpitto = SPITTO_TYPES.find((t) => t.value === selectedType)!;
  const expectedValue = calcExpectedValue(
    currentSpitto.faceValue,
    releaseRate,
    firstPrizeMin,
    secondPrizeMin,
  );
  const expectedDiff = expectedValue - currentSpitto.faceValue;
  const expectedPct = ((expectedDiff / currentSpitto.faceValue) * 100).toFixed(0);

  function handleAdd() {
    setSavedConditions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        spittoType: selectedType,
        releaseRate,
        firstPrizeMin,
        secondPrizeMin,
        enabled: true,
      },
    ]);
  }

  function handleToggle(id: string) {
    setSavedConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)),
    );
  }

  function handleDelete(id: string) {
    setSavedConditions((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="py-10">
      <div className="mx-auto max-w-lg space-y-6 px-4">
        {/* 새로운 알림 조건 만들기 */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-5 py-4">
            <h2 className="text-base font-semibold text-zinc-900">
              새로운 알림 조건 만들기
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
            />

            {/* 2등 잔여 수량 */}
            <CounterButton
              label="🥈 2등 잔여 수량 (최소)"
              value={secondPrizeMin}
              onChange={setSecondPrizeMin}
            />

            {/* 예상 기댓값 */}
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="mb-1 text-xs text-zinc-500">
                💡 현재 조건의 예상 기댓값
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-[#0066b3]">
                  {expectedValue.toLocaleString()}원
                </span>
                <span
                  className={`text-sm font-medium ${
                    expectedDiff >= 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  (정상가 {currentSpitto.faceValue.toLocaleString()}원 대비{" "}
                  {expectedDiff >= 0 ? "+" : ""}
                  {expectedPct}%)
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
        {savedConditions.length > 0 && (
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
                const spitto = SPITTO_TYPES.find(
                  (t) => t.value === cond.spittoType,
                )!;
                const ev = calcExpectedValue(
                  spitto.faceValue,
                  cond.releaseRate,
                  cond.firstPrizeMin,
                  cond.secondPrizeMin,
                );
                return (
                  <div key={cond.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <span>🎫</span>
                        <span className="text-sm font-semibold text-zinc-900">
                          {spitto.label}
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggle(cond.id)}
                        className={[
                          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                          cond.enabled
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200",
                        ].join(" ")}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            cond.enabled ? "bg-green-500" : "bg-zinc-400"
                          }`}
                        />
                        {cond.enabled ? "ON" : "OFF"}
                      </button>
                    </div>

                    <ul className="mt-2 space-y-0.5 pl-6 text-xs text-zinc-500">
                      <li>• 출고율: {cond.releaseRate}% 이상</li>
                      <li>
                        • 잔여: 1등 {cond.firstPrizeMin}장 이상 / 2등{" "}
                        {cond.secondPrizeMin}장 이상
                      </li>
                      <li>• 기댓값 조건: {ev.toLocaleString()}원 이상</li>
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
