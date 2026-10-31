export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Cynbit Full Stack Assessment
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          Smart Project Inquiry Builder
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Next.js App Router, TypeScript, and Tailwind CSS initialized successfully.
        </p>
      </div>
    </main>
  );
}
