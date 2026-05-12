export default function Sessions() {
  return (
    <div className="flex flex-col flex-1 p-8">
      <main className="flex flex-1 flex-col">
        <h1 className="text-2xl font-semibold mb-6">Sessions</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center rounded-lg border border-solid border-black/[.08] dark:border-white/[.145] p-8 min-h-[120px] bg-white dark:bg-black transition-colors hover:bg-black/[.04] dark:hover:bg-[#1a1a1a]"
            >
              <p className="text-zinc-500 dark:text-zinc-400">Session {i + 1}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
