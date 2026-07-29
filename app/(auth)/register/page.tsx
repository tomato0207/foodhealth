import Link from "next/link";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  const registrationOpen = process.env.ALLOW_REGISTRATION !== "false";

  if (!registrationOpen) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4 text-center">
        <h1 className="mb-3 text-2xl font-semibold">目前未開放註冊</h1>
        <p className="text-sm text-gray-500">
          這個系統暫時不開放自行註冊,請聯絡管理員為你建立帳號。
        </p>
        <p className="mt-4 text-sm">
          已經有帳號?{" "}
          <Link href="/login" className="text-emerald-600 underline hover:text-emerald-700">
            登入
          </Link>
        </p>
      </div>
    );
  }

  return <RegisterForm />;
}
