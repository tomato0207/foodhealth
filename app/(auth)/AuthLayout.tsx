import HealthIllustration from "@/app/_components/HealthIllustration";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col items-center justify-center gap-6 overflow-hidden bg-gradient-to-br from-emerald-100 via-emerald-50 to-amber-50 p-12 lg:flex">
        <HealthIllustration className="w-full max-w-sm drop-shadow-sm" />
        <div className="max-w-sm text-center">
          <h2 className="text-2xl font-semibold text-emerald-900">吃得健康,從記錄開始</h2>
          <p className="mt-3 text-sm leading-relaxed text-emerald-800/70">
            拍張照片,AI 幫你估算這餐的營養素;每天回顧攝取量與目標的差距,離健康的自己更近一步。
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm animate-fade-in-up">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="text-xl" aria-hidden>
              🌿
            </span>
            <span className="font-semibold text-emerald-800">營養管家</span>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white/90 p-8 shadow-xl shadow-emerald-900/5 backdrop-blur">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
