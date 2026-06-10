"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api/client'
import { MockTestConfigAdminResponse, UpdateMockTestConfigRequest } from '@/lib/types/mock-test'
import { ArrowLeft, Loader2, Settings, AlertCircle, CheckCircle2 } from 'lucide-react'

interface LicenceCategory {
  id: number
  name: string
  code: string
}

function Field({
  label, hint, required, children,
}: {
  label: string;
  hint?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs uppercase tracking-widest text-white/35 font-medium">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-white/25 font-light">{hint}</p>}
    </div>
  );
}

const inputClass = `
  w-full px-4 py-2.5 rounded-xl text-sm text-[#f0f0f5] font-light
  bg-white/[0.04] border border-white/[0.09]
  focus:outline-none focus:border-emerald-300/40 focus:bg-white/[0.06]
  transition-colors duration-200
`;

export default function EditMockTestConfigPage() {
  const router = useRouter();
  const params = useParams();
  const configId = Number(params.id);

  const [config, setConfig] = useState<MockTestConfigAdminResponse | null>(null);
  const [licenceCategories, setLicenceCategories] = useState<LicenceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateMockTestConfigRequest>({});

  useEffect(() => {
    fetchConfig();
    fetchLicenceCategories();
  }, [configId]);

  useEffect(() => {
    if (formData.totalQuestions !== undefined && formData.passPercentage !== undefined) {
      const calculated = Math.ceil((formData.totalQuestions * formData.passPercentage) / 100);
      setFormData((prev) => ({ ...prev, passMark: calculated }));
    }
  }, [formData.totalQuestions, formData.passPercentage]);

  const fetchConfig = async () => {
    setIsFetching(true);
    try {
      const response = await api.get(`/api/v1/admin/mock-test-configs/${configId}`);
      const data = response.data.data ?? response.data;
      setConfig(data);
      setFormData({
        licenceCategoryId: data.licenceCategoryId,
        totalQuestions: data.totalQuestions,
        durationMinutes: data.durationMinutes,
        passPercentage: data.passPercentage,
        passMark: data.passMark,
        active: data.active,
      });
    } catch (err) {
      console.error('Failed to fetch configuration:', err);
      setError('Failed to load configuration');
    } finally {
      setIsFetching(false);
    }
  };

  const fetchLicenceCategories = async () => {
    try {
      const response = await api.get('/api/v1/admin/licence-categories');
      const data = response.data.data ?? response.data;
      setLicenceCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch licence categories:', err);
      setLicenceCategories([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setError(null)
    try {
      await api.patch(`/api/v1/admin/mock-test-configs/${configId}`, formData)
      router.push('/backoffice/mock-tests/configs')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const patch = (fields: Partial<UpdateMockTestConfigRequest>) =>
    setFormData((prev) => ({ ...prev, ...fields }))

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isFetching) {
    return (
      <div className="font-dm flex items-center justify-center min-h-[40vh]">
        <Loader2 size={24} className="animate-spin text-emerald-300/50" />
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.35s ease both; }
        .delay-1 { animation-delay: 0.07s; }
      `}</style>

      <div className="font-dm text-[#f0f0f5] max-w-2xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 animate-fade-up">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl shrink-0
                       text-white/35 border border-white/[0.08] bg-white/[0.03]
                       hover:text-white/70 hover:border-white/15
                       transition-all duration-200"
          >
            <ArrowLeft size={15} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20
                            flex items-center justify-center shrink-0">
              <Settings size={14} className="text-emerald-300" />
            </div>
            <div>
              <h1 className="font-syne font-bold text-xl sm:text-2xl tracking-tight leading-tight">
                Edit Configuration
              </h1>
              {config && (
                <p className="text-xs text-white/35 font-light">{config.jurisdictionName}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-xl border
                          bg-red-400/[0.07] border-red-400/20 animate-fade-up">
            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400/90 font-light">{error}</p>
          </div>
        )}

        {/* ── Form ── */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#181920] border border-white/[0.07] rounded-2xl
                     shadow-[0_4px_24px_rgba(0,0,0,0.25)] overflow-hidden animate-fade-up delay-1"
        >
          <div className="px-6 py-5 border-b border-white/[0.06] space-y-5">

            {/* Questions + Duration */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Total Questions" required hint="Min 1 — Max 200">
                <input
                  type="number"
                  min={1} max={200}
                  value={formData.totalQuestions ?? ''}
                  onChange={(e) => patch({ totalQuestions: Number(e.target.value) })}
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Duration (min)" required hint="Min 1 — Max 300">
                <input
                  type="number"
                  min={1} max={300}
                  value={formData.durationMinutes ?? ''}
                  onChange={(e) => patch({ durationMinutes: Number(e.target.value) })}
                  required
                  className={inputClass}
                />
              </Field>
            </div>

            {/* Pass percentage */}
            <Field label="Pass Percentage (%)" required hint="Min 1% — Max 100%">
              <input
                type="number"
                min={1} max={100}
                value={formData.passPercentage ?? ''}
                onChange={(e) => patch({ passPercentage: Number(e.target.value) })}
                required
                className={inputClass}
              />
            </Field>

            {/* Pass mark — read only */}
            <Field label="Pass Mark (auto-calculated)">
              <input
                type="number"
                value={formData.passMark ?? ''}
                readOnly
                className={`${inputClass} opacity-50 cursor-not-allowed`}
              />
              <div className="flex items-center gap-2 mt-2 px-3 py-2.5 rounded-xl
                              bg-emerald-300/[0.06] border border-emerald-300/[0.12]">
                <CheckCircle2 size={13} className="text-emerald-300/70 shrink-0" />
                <p className="text-xs text-emerald-300/70 font-light">
                  Learners must answer{' '}
                  <span className="font-medium text-emerald-300">{formData.passMark}</span>
                  {' '}of{' '}
                  <span className="font-medium text-emerald-300">{formData.totalQuestions}</span>
                  {' '}questions correctly to pass
                </p>
              </div>
            </Field>

            {/* Active toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  checked={formData.active ?? false}
                  onChange={(e) => patch({ active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 rounded-full border border-white/[0.12] bg-white/[0.06]
                                peer-checked:bg-emerald-300/80 peer-checked:border-emerald-300/40
                                transition-all duration-200" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40
                                peer-checked:translate-x-[18px] peer-checked:bg-[#12131a]
                                transition-all duration-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#f0f0f5]/80
                               group-hover:text-[#f0f0f5] transition-colors duration-200">
                  Active
                </p>
                <p className="text-[11px] text-white/25 font-light">
                  Enable this configuration for learners
                </p>
              </div>
            </label>

          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 bg-white/[0.02] flex gap-2.5">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                         text-white/55 border border-white/[0.09] bg-white/[0.03]
                         hover:text-white/85 hover:border-white/20
                         disabled:opacity-40 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                         flex items-center justify-center gap-2
                         text-[#12131a] bg-emerald-300
                         hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-200
                         [box-shadow:0_0_20px_rgba(110,231,183,0.25)]"
            >
              {isLoading
                ? <><Loader2 size={14} className="animate-spin" />Updating…</>
                : 'Update Configuration'}
            </button>
          </div>
        </form>

      </div>
    </>
  )
}