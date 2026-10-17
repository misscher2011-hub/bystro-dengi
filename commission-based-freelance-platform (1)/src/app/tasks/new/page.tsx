import NewTaskForm from "@/components/NewTaskForm";

export const metadata = {
  title: "Разместить задание бесплатно — Быстро Деньги",
  description: "Размещение задания и отклики — 0 ₽. Без подписок.",
};

export default function NewTaskPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-lime-300/30 bg-lime-300/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
          Размещение · 0 ₽
        </span>
        <h1 className="mt-5 text-3xl font-black text-white sm:text-5xl">
          Опишите задачу — исполнители придут сами
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          Никаких подписок и платных пакетов. Вы платите только исполнителю, а
          сервис берёт свой процент с него — и только после успешной сдачи
          работы.
        </p>
      </div>

      <div className="mt-10">
        <NewTaskForm />
      </div>
    </div>
  );
}
