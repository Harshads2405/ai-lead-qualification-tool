import LeadQualificationForm from "@/components/LeadQualificationForm";

export default function Home() {
  return (
    <main className="min-h-screen px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-3 py-1 text-xs font-bold text-violet-700">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              AI-powered qualification
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">LeadLens</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Turn inbound lead details into a clear qualification, reasoning, missing information, and next action.
            </p>
          </div>
        </header>

        <LeadQualificationForm />

        <footer className="mt-10 text-center text-xs text-slate-400">
          Built as a focused technical assessment • AI recommendations are decision support, not final sales decisions.
        </footer>
      </div>
    </main>
  );
}