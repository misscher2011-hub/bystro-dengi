"use client";

import { useState } from "react";
import { formatNumber, formatRub } from "@/lib/commission";

export type ChartPoint = { label: string; gross: number; net: number; fee: number };

export default function EarningsChart({ data }: { data: ChartPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.gross), 1);
  const totalGross = data.reduce((s, d) => s + d.gross, 0);
  const totalFee = data.reduce((s, d) => s + d.fee, 0);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Динамика за 6 месяцев</h3>
          <p className="mt-1 text-xs text-slate-400">
            Оборот {formatRub(totalGross)} · комиссия сервиса {formatRub(totalFee)}
          </p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-2 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-emerald-500 to-lime-300" />
            На руки
          </span>
          <span className="flex items-center gap-2 text-slate-400">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-600" />
            Комиссия
          </span>
        </div>
      </div>

      <div className="mt-8 flex h-56 items-end gap-3 sm:gap-5">
        {data.map((point, i) => {
          const totalH = (point.gross / max) * 100;
          const netH = point.gross > 0 ? (point.net / point.gross) * 100 : 0;
          return (
            <div
              key={`${point.label}-${i}`}
              className="group relative flex h-full flex-1 flex-col justify-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {hover === i && point.gross > 0 && (
                <div className="absolute -top-2 left-1/2 z-10 w-36 -translate-x-1/2 rounded-xl border border-white/15 bg-[#0b1220] p-3 text-[11px] shadow-xl">
                  <div className="font-bold text-white">{formatNumber(point.gross)} ₽</div>
                  <div className="mt-1 text-lime-300">
                    на руки {formatNumber(point.net)} ₽
                  </div>
                  <div className="text-slate-400">
                    комиссия {formatNumber(point.fee)} ₽
                  </div>
                </div>
              )}
              <div
                className="relative w-full overflow-hidden rounded-t-xl bg-slate-700/60 transition-all duration-500"
                style={{ height: `${Math.max(totalH, 2)}%` }}
              >
                <div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 to-lime-300"
                  style={{ height: `${netH}%` }}
                />
              </div>
              <div className="mt-2 text-center text-[11px] capitalize text-slate-400">
                {point.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
