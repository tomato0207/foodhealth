import Link from "next/link";
import AuthLayout from "../AuthLayout";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  const registrationOpen = process.env.ALLOW_REGISTRATION !== "false";

  if (!registrationOpen) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl">
            🔒
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">目前未開放註冊</h1>
          <p className="text-sm text-gray-500">
            這個系統暫時不開放自行註冊,請聯絡管理員為你建立帳號。
          </p>
          <p className="mt-6 text-sm text-gray-500">
            已經有帳號?{" "}
            <Link href="/login" className="font-medium text-emerald-600 underline hover:text-emerald-700">
              登入
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return <RegisterForm />;
}
