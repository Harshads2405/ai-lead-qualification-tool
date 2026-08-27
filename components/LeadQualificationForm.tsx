"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, CircleAlert, Loader2, Sparkles } from "lucide-react";

type Result = {
  qualification: "High" | "Medium" | "Low";
  score: number;
  reasoning: string;
  missing_information: string[];
  next_best_action: string;
};

type FormState = {
  company: string;
  website: string;
  service: string;
  budget: string;
  goal: string;
};

const initialForm: FormState = {
  company: "",
  website: "",
  service: "",
  budget: "",
  goal: ""
};

function validate(form: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (form.company.trim().length < 2) errors.company = "Enter a company name.";
  if (!/^https?:\/\/.+/i.test(form.website.trim())) errors.website = "Use a full URL, e.g. https://example.com";
  if (form.service.trim().length < 3) errors.service = "Describe the service needed.";
  if (form.budget.trim().length < 1) errors.budget = "Enter a budget or say 'Not decided'.";
  if (form.goal.trim().length < 8) errors.goal = "Describe the business goal in a little more detail.";
  return errors;
}

export default function LeadQualificationForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function update(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setResult(null);
    setApiError("");

    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to qualify this lead.");

      setResult(data.result);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const qualificationClass = result ? `pill pill-${result.qualification.toLowerCase()}` : "";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
      <section className="card rounded-3xl p-6 sm:p-8">
        <div className="mb-7">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-violet-700">
            <Sparkles size={17} /> New inbound lead
          </div>
          <h2 className="text-2xl font-black tracking-tight">Qualify a lead</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Give the model enough context to make a practical first-pass sales recommendation.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5" noValidate>
          <div>
            <label className="label" htmlFor="company">Company</label>
            <input id="company" className="field" value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Acme Inc." />
            {errors.company && <p className="error">{errors.company}</p>}
          </div>

          <div>
            <label className="label" htmlFor="website">Website</label>
            <input id="website" className="field" value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://acme.com" />
            {errors.website && <p className="error">{errors.website}</p>}
          </div>

          <div>
            <label className="label" htmlFor="service">Service needed</label>
            <input id="service" className="field" value={form.service} onChange={(e) => update("service", e.target.value)} placeholder="Website redesign and SEO" />
            {errors.service && <p className="error">{errors.service}</p>}
          </div>

          <div>
            <label className="label" htmlFor="budget">Budget</label>
            <input id="budget" className="field" value={form.budget} onChange={(e) => update("budget", e.target.value)} placeholder="₹2–4 lakh / month" />
            {errors.budget && <p className="error">{errors.budget}</p>}
          </div>

          <div>
            <label className="label" htmlFor="goal">Primary goal</label>
            <textarea id="goal" className="field min-h-28 resize-y" value={form.goal} onChange={(e) => update("goal", e.target.value)} placeholder="Increase qualified demo requests by 30% over the next quarter." />
            {errors.goal && <p className="error">{errors.goal}</p>}
          </div>

          {apiError && (
            <div className="flex gap-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              <CircleAlert size={18} className="mt-0.5 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <><Loader2 size={17} className="animate-spin" /> Analyzing lead…</> : <>Qualify with AI <ArrowRight size={17} /></>}
          </button>
        </form>
      </section>

      <section className="card min-h-[520px] rounded-3xl p-6 sm:p-8">
        {!result && !loading && (
          <div className="flex h-full min-h-[460px] flex-col items-center justify-center text-center">
            <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-violet-50 text-violet-600">
              <Sparkles size={28} />
            </div>
            <h2 className="text-xl font-black">Your qualification will appear here</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              The result will include a qualification, confidence score, reasoning, missing information, and next best action.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex h-full min-h-[460px] flex-col items-center justify-center text-center">
            <Loader2 size={32} className="animate-spin text-violet-600" />
            <h2 className="mt-5 text-xl font-black">Analyzing the lead</h2>
            <p className="mt-2 text-sm text-slate-500">Evaluating fit, budget clarity, intent, and information gaps…</p>
          </div>
        )}

        {result && (
          <div>
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">AI qualification</p>
                <div className="mt-2 flex items-center gap-3">
                  <h2 className="text-3xl font-black">{result.qualification}</h2>
                  <span className={qualificationClass}>{result.score}/100</span>
                </div>
              </div>
              <CheckCircle2 className="text-emerald-500" />
            </div>

            <div className="space-y-7 pt-6">
              <div>
                <h3 className="text-sm font-black">Why this qualification?</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{result.reasoning}</p>
              </div>

              <div>
                <h3 className="text-sm font-black">Missing information</h3>
                {result.missing_information.length ? (
                  <ul className="mt-3 space-y-2">
                    {result.missing_information.map((item, index) => (
                      <li key={index} className="flex gap-2 text-sm leading-6 text-slate-600">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No major information gaps identified.</p>
                )}
              </div>

              <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Next best action</p>
                <p className="mt-2 text-sm font-semibold leading-6">{result.next_best_action}</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}