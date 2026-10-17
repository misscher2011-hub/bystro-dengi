import Link from "next/link";
import TaskBoard from "@/components/TaskBoard";
import { getDemoUser, getTasks } from "@/lib/data";
import { formatRub } from "@/lib/commission";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Лента заданий — Быстро Деньги",
  description: "Бесплатные отклики, комиссия только с полученных денег.",
};

export default async function TasksPage() {
  const [tasks, user] = await Promise.all([getTasks(), getDemoUser()]);
  const totalBudget = tasks.reduce((sum, t) => sum + t.budget, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-black text-white sm:text-5xl">
            Лента заданий
          </h1>
          <p className="mt-3 max-w-xl text-slate-400">
            {tasks.length} открытых задач на {formatRub(totalBudget)}. Отклик
            бесплатный, подписок нет — сервис берёт процент только когда вы уже
            получили деньги.
          </p>
        </div>
        <Link
          href="/tasks/new"
          className="rounded-2xl bg-gradient-to-r from-lime-300 to-emerald-400 px-6 py-3.5 font-extrabold text-[#04150f] transition hover:brightness-110"
        >
          Разместить задание · 0 ₽
        </Link>
      </div>

      <div className="mt-10">
        <TaskBoard tasks={tasks} userEarned={user.totalEarned} />
      </div>
    </div>
  );
}
