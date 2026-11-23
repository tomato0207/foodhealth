function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
        {n}
      </span>
      <div className="flex flex-col gap-1.5 text-sm text-gray-700">
        <p className="font-medium text-gray-900">{title}</p>
        {children}
      </div>
    </li>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export default function SetupGuide() {
  return (
    <section id="guide" className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white/90 p-5 shadow-sm backdrop-blur">
      <h2 className="text-lg font-semibold text-gray-900">📖 設定教學:用 ngrok 連到別台電腦的 LM Studio</h2>
      <p className="text-sm text-gray-500">
        以下步驟在「跑 LM Studio 的那台電腦」上操作。做完後,把得到的<strong>網址</strong>、<strong>金鑰</strong>、
        <strong>模型名稱</strong>填到上方表單,按「測試連線」確認成功再儲存。
      </p>

      <ol className="flex flex-col gap-5">
        <Step n={1} title="在 LM Studio 載入視覺模型">
          <p>
            開啟 LM Studio,下載並載入一個<strong>支援圖片輸入</strong>的模型(例如 Qwen2-VL、Qwen2.5-VL、LLaVA、Gemma 3)。
            一般文字模型看不懂照片。
          </p>
        </Step>

        <Step n={2} title="啟動 LM Studio 伺服器">
          <p>
            點左側的 <strong>Developer</strong>(開發者)分頁 → 把 <strong>Status</strong> 切到 <strong>Running</strong>。
            畫面上會顯示 <Code>http://localhost:1234</Code>,1234 就是 port。
          </p>
        </Step>

        <Step n={3} title="開啟金鑰保護,取得「API 金鑰」(強烈建議)">
          <p>
            ngrok 網址是公開的,任何拿到網址的人都能用你的電腦跑模型,所以建議開啟驗證:
          </p>
          <p>
            在 Developer 分頁點 <strong>Server Settings</strong> → 打開 <strong>Require Authentication</strong> →
            建立一組 API Token 並複製(按鈕依版本可能叫 Manage Tokens 或 API Tokens)。這組金鑰就是表單裡的「API 金鑰」。
          </p>
          <p className="text-xs text-gray-500">沒開這個選項的話,表單的金鑰欄位留空即可。</p>
        </Step>

        <Step n={4} title="用 ngrok 把 LM Studio 開放到外網,取得「網址」">
          <p>
            到 <Code>ngrok.com</Code> 註冊並安裝 ngrok,依官網指示執行一次 <Code>ngrok config add-authtoken &lt;你的 token&gt;</Code>。
            接著在終端機執行:
          </p>
          <pre className="overflow-x-auto rounded-lg bg-gray-900 px-3 py-2 font-mono text-xs text-gray-100">ngrok http 1234</pre>
          <p>
            畫面上 <strong>Forwarding</strong> 那一行的 <Code>https://xxxx.ngrok-free.app</Code> 就是要填的網址
            (結尾的 <Code>/v1</Code> 可以不打,系統會自動補上)。
          </p>
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            ⚠️ 免費版每次重開 ngrok 網址都會變,變了就要回來這裡更新。建議在 ngrok 後台 <strong>Domains</strong> 申請一個免費固定網址,
            之後改用 <Code>ngrok http --url=你的固定網址 1234</Code>,網址就不會再變。
          </p>
        </Step>

        <Step n={5} title="填入表單、測試、儲存">
          <p>
            把網址和金鑰貼到上方,按 <strong>測試連線</strong>。成功的話會列出 LM Studio 目前載入的模型,點一下就能填入「模型名稱」。
            最後把辨識引擎選成 <strong>LM Studio</strong>(或「讓使用者自選」),按 <strong>儲存設定</strong>。
          </p>
        </Step>
      </ol>

      <details className="rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
        <summary className="cursor-pointer font-medium text-gray-900">🔧 測試連線失敗怎麼辦?</summary>
        <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5">
          <li>
            <strong>無法連線 / 逾時</strong>:對方電腦可能睡眠或關機,或 ngrok 視窗被關掉了。重新執行 ngrok 後記得確認網址有沒有變。
          </li>
          <li>
            <strong>404 找不到</strong>:ngrok 網址已失效(重開後換了網址),請貼上新網址。
          </li>
          <li>
            <strong>金鑰錯誤</strong>:確認貼的是 LM Studio 建立的 API Token,不是 ngrok 的 authtoken。
          </li>
          <li>
            <strong>回應不是 LM Studio 的格式</strong>:ngrok 轉發的 port 不對,要跟 LM Studio 顯示的 port(預設 1234)一樣。
          </li>
          <li>
            <strong>測試成功但辨識失敗</strong>:載入的模型可能不支援圖片,換一個視覺模型(名稱常帶有 VL、Vision)。
          </li>
        </ul>
      </details>

      <details className="rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
        <summary className="cursor-pointer font-medium text-gray-900">☁️ 想改用 Gemini?</summary>
        <p className="mt-2">
          Gemini 的金鑰是伺服器環境變數 <Code>GEMINI_API_KEY</Code>(到 Google AI Studio 申請),需要在 Vercel 的
          Environment Variables 設定後 Redeploy,無法在這個頁面修改。設定好後,上方的 Gemini 選項就會顯示「已設定」。
        </p>
      </details>
    </section>
  );
}
