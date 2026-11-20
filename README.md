# 營養管家

個人化營養素追蹤網站:依個人資料計算每日營養素目標、支援拍照(食物照片 / 營養標示照片)由 AI 估算這餐的營養素、記錄每日/歷史飲食,並區分一般使用者與管理員(管理員可維護食物資料庫、營養素定義與使用者帳號)。

食物資料庫直接匯入衛福部[食品營養成分資料庫(TFND)](https://consumer.fda.gov.tw/Food/TFND.aspx?nodeID=178)的官方開放資料(2181 筆食品、103 項營養素),其餘由管理員後台持續新增維護。

## 技術棧

- Next.js 16(App Router)+ TypeScript + Tailwind CSS
- Prisma 7 + [Supabase](https://supabase.com/)(PostgreSQL,`@prisma/adapter-pg`)
- 自建帳密登入(bcrypt 雜湊密碼 + session cookie,無第三方 Auth 服務)
- AI 拍照辨識可切換兩種後端:[LM Studio](https://lmstudio.ai/) 本機伺服器(完全離線、免費)或 [Gemini API](https://ai.google.dev/)(雲端、需要網路與 API Key),由 `.env` 的 `AI_PROVIDER` 決定

## 開始使用

### 1. 安裝套件

```bash
npm install
```

### 2. 設定環境變數

到 Supabase 專案點右上角 **Connect** → **Direct** 分頁 → 選 **Transaction pooler**,複製那組字串(port 6543),填入 `.env` 的 `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres.<你的專案ID>:<你的資料庫密碼>@aws-0-<region>.pooler.supabase.com:6543/postgres"

# 只有跑 `prisma migrate` 時手動用得到(見下方說明),app 執行時不會用到
DIRECT_URL="postgresql://postgres:<你的資料庫密碼>@db.<你的專案ID>.supabase.co:5432/postgres"

AI_PROVIDER="gemini"   # 或 "lmstudio"

LMSTUDIO_BASE_URL="http://localhost:1234/v1"
LMSTUDIO_MODEL="qwen2-vl-7b-instruct"

GEMINI_API_KEY="<你的 Gemini API Key>"
GEMINI_MODEL="gemini-2.5-flash"

ALLOW_REGISTRATION="true"   # 公開部署時建議設為 "false",見下方「部署到 Vercel」

SUPABASE_URL="https://<你的專案ID>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<Settings → API → service_role secret key>"
```

`SUPABASE_SERVICE_ROLE_KEY` 擁有繞過 RLS 的完整權限,只能用在伺服器端(這裡是 Route Handler / script),絕對不能出現在任何 Client Component 或瀏覽器看得到的地方。

**為什麼一定要用 pooler、不能用直連:** Supabase 的直連字串(`db.<專案ID>.supabase.co:5432`)只支援 IPv6,Vercel 的 serverless function 沒有 IPv6 對外連線能力,直連字串在 Vercel 上會連不到資料庫(本機開發若有 IPv6 則直連也能動,但為了跟正式環境一致、避免「本機正常、線上壞掉」,建議本機也直接用 pooler)。

`prisma migrate` 這類需要 DDL 鎖的指令,在走 transaction-mode pooler 時可能不穩定,所以遇到要跑 migration 時,手動把 `DATABASE_URL` 換成 `.env` 裡的 `DIRECT_URL`(直連字串)執行,例如:

```bash
DATABASE_URL="$DIRECT_URL" npx prisma migrate deploy
```

跑完後把 `DATABASE_URL` 換回 pooler 字串即可(日常開發/執行 app 不需要這麼做,只有動到 schema 才需要)。

`LMSTUDIO_MODEL` 請填寫你在 LM Studio 中實際載入的**視覺(vision)模型**名稱。

### 3. 建立資料庫、寫入種子資料、匯入 TFND 食品資料

```bash
DATABASE_URL="$DIRECT_URL" npx prisma migrate deploy   # 或開發時用 migrate dev；migration 需要直連,見上方說明
npx prisma db seed
npx tsx prisma/import-tfnd.ts
npx tsx scripts/setup-storage.ts   # 建立存放拍照照片用的 Supabase Storage bucket
```

- `db seed` 會建立:103 個營養素定義(`prisma/tfnd-nutrients.ts`)、一組管理員帳號 `admin@example.com` / `Admin1234!`(建議正式使用前更改密碼)
- `import-tfnd.ts` 會從 [data.gov.tw 開放資料集(8543)](https://data.gov.tw/dataset/8543) 下載官方 CSV(政府資料開放授權條款-第1版,免費),匯入全部 2181 筆食品與其營養成分(以每 100 克為基準)。**不會**爬 `consumer.fda.gov.tw` 網頁——該站 `robots.txt` 禁止爬蟲,改用政府開放資料的整批下載管道。此腳本以食品的 TFND 整合編號做 upsert key,可重複執行來更新資料,不會產生重複食品。
- 103 個營養素中,只有台灣營養標示常見的 8 項(熱量、蛋白質、脂肪、飽和脂肪、反式脂肪、碳水化合物、糖、鈉)會顯示在使用者的每日目標、`/today`、AI 拍照估算與手動輸入表單;其餘 95 項(其他維生素/礦物質、胺基酸與脂肪酸細項等)只保留在食物資料裡供查詢,不會出現在上述畫面(可在 `/admin/nutrients` 個別調整「可追蹤」設定,勾選後即可讓更多營養素出現在追蹤畫面)。

### 4. 設定「拍照估算營養素」的 AI 後端

`AI_PROVIDER` 決定用哪個後端,兩者共用同一套 prompt 與回傳格式(`lib/ai/`):

- **`gemini`**(雲端):到 [Google AI Studio](https://aistudio.google.com/apikey) 申請 API Key,填入 `GEMINI_API_KEY`。需要網路連線,依用量計費(有免費額度)。辨識準確度通常優於本機小型模型。
- **`lmstudio`**(本機、離線、免費):
  1. 開啟 LM Studio,載入一個支援影像輸入的模型(例如 Qwen2-VL、LLaVA 等)
  2. 啟動本機伺服器(Local Server),確認位址與 `.env` 的 `LMSTUDIO_BASE_URL` 一致

`AI_PROVIDER` 只是預設值:兩種後端的環境變數都設好時,使用者可以在「新增紀錄 → 拍照」畫面每次自行切換「辨識引擎」;沒設定好的後端會顯示為「未設定」、無法選取(Gemini 看 `GEMINI_API_KEY`,LM Studio 看 `LMSTUDIO_MODEL`)。

**用別台電腦(例如同學)的 LM Studio + ngrok:**

1. 對方在 LM Studio 載入視覺模型並啟動伺服器(預設 port 1234),再執行 `ngrok http 1234`(建議在 ngrok 後台申請免費固定網址,改用 `ngrok http --url=<固定網址> 1234`,網址才不會每次重開都變)
2. 在 Vercel 設定 `LMSTUDIO_BASE_URL="https://<ngrok 網址>/v1"`(結尾要有 `/v1`)與 `LMSTUDIO_MODEL`,然後 Redeploy
3. 若對方在 LM Studio 開了「Require Authentication」,把它產生的金鑰填到 `LMSTUDIO_API_KEY`;ngrok 網址是公開的,建議開啟

不論哪種後端,若呼叫失敗(未設定 Key、LM Studio 未啟動、額度用盡等),拍照辨識會顯示明確錯誤訊息,並保留已上傳的照片供你改用「手動輸入」完成紀錄。

### 5. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。未登入會導向 `/login`,一般使用者登入後導向 `/today`,管理員登入後導向 `/admin/foods`。

## 功能頁面

使用者:
- `/profile` 個人資訊:填寫性別/年齡/身高/體重/活動量/目標,系統自動計算每日營養素目標(可個別覆寫、亦可重設回系統建議值)
- `/today` 今日營養素:今日各營養素攝取量 vs 目標、今日紀錄列表
- `/today/log/new` 新增紀錄:拍照(食物 / 營養標示)AI 估算後可修改再儲存,或從食物資料庫搜尋 / 自訂輸入
- `/records` 紀錄:依日期區間查看歷史用餐紀錄

管理員(需 `ADMIN` 角色):
- `/admin/foods` 食物管理(可依名稱搜尋 2000+ 筆食物、新增/編輯/刪除,含每份營養素數值)
- `/admin/nutrients` 營養素管理(新增/編輯/刪除,含「可追蹤」設定)
- `/admin/users` 使用者管理(調整角色、啟用/停用帳號、手動新增使用者——`ALLOW_REGISTRATION="false"` 關閉自行註冊時仍可由此新增)

## 專案結構重點

- `prisma/schema.prisma`、`prisma/seed.ts` — 資料庫結構與種子資料
- `prisma/tfnd-nutrients.ts` — TFND 分析項 ↔ 本系統 Nutrient key 對照表(含可追蹤設定),`seed.ts` 與 `import-tfnd.ts` 共用
- `prisma/import-tfnd.ts` — 從官方開放資料下載並匯入全部食品與營養成分,可重複執行
- `lib/auth.ts` — session 登入/登出、`requireUser` / `requireAdmin`
- `lib/nutrition.ts` — Mifflin-St Jeor BMR/TDEE 計算與每日營養素目標
- `lib/ai/` — 拍照辨識:`index.ts` 依 `AI_PROVIDER` 分派到 `gemini.ts` 或 `lmstudio.ts`,`types.ts` 是共用的 prompt 組裝與 JSON 正規化邏輯
- `lib/uploads.ts` — 上傳照片存於 Supabase Storage 私有 bucket(`meal-photos`),需經授權的 API route(`/api/uploads/[id]`)才能讀取
- `scripts/setup-storage.ts` — 建立 `meal-photos` bucket(一次性,可重複執行)
- `app/(app)/*`、`app/(admin)/admin/*` — 使用者端與管理員端頁面
- `app/api/**` — 對應的 API Route Handlers

## 建置

```bash
npm run build
```

## 部署到 Vercel

1. 把上面 `.env` 的所有變數,設定到 Vercel 專案的 **Settings → Environment Variables**。
2. **`ALLOW_REGISTRATION` 建議設為 `"false"`**:公開部署後任何人都能連到你的網站,若自行註冊是開放的,任何人註冊後都能觸發拍照辨識、消耗你的 `GEMINI_API_KEY` 額度/費用。關閉後,新使用者只能由管理員在 `/admin/users` 手動新增。
3. **`DATABASE_URL` 一定要用 pooler 字串,不能用直連**——Vercel 沒有 IPv6 對外連線,直連字串在 Vercel 上會出現 `Can't reach database server`(P1001)錯誤,只有 pooler(port 6543)支援 IPv4。`DIRECT_URL` 不需要設到 Vercel,只有本機跑 migration 時才用得到。
4. 拍照上傳的照片存在 Supabase Storage(不是本機檔案系統),所以在 Vercel 這種無狀態的 serverless 環境下可以正常運作;記得先跑過 `scripts/setup-storage.ts` 建立 bucket,並在 Vercel 設定 `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`。
5. Migration/seed/匯入腳本(`prisma migrate deploy`、`prisma db seed`、`import-tfnd.ts`)請在本機或 CI 執行一次,對正式的 Supabase 資料庫跑過即可,不需要在 Vercel 上執行。

## Android App(PWA + TWA)

網站本身是 PWA(`app/manifest.ts`、`public/icons/`),Android 手機用 Chrome 開啟後可「加到主畫面」。要產生可安裝的 APK / 上架 Google Play 的 AAB,使用 Google 的 [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) 把網站包成 Trusted Web Activity(TWA)——App 內容就是 Vercel 上的網站,網站更新後 App 自動跟著更新,不必重新打包。

1. 在**專案資料夾以外**建一個資料夾(裡面會有簽章金鑰,不要放進 git),執行:
   ```bash
   npx @bubblewrap/cli init --manifest https://<你的網域>/manifest.webmanifest
   ```
   第一次會詢問是否自動下載 JDK 與 Android SDK,都選 Yes;接著依提示確認 App 名稱、套件名稱(packageId,例如 `app.vercel.foodhealth.twa`),並建立簽章金鑰(keystore)。**keystore 檔與密碼務必備份**,遺失就無法再更新同一個 App。
2. 產生 APK:
   ```bash
   npx @bubblewrap/cli build
   ```
   完成後資料夾內的 `app-release-signed.apk` 可直接傳到手機安裝;`app-release-bundle.aab` 用於上架 Google Play。
3. 讓 App 全螢幕顯示(隱藏 Chrome 網址列):執行 `npx @bubblewrap/cli fingerprint list` 取得 SHA-256 指紋,在 Vercel 設定以下環境變數後 Redeploy,`/.well-known/assetlinks.json` 就會自動產生對應內容:
   ```env
   TWA_PACKAGE_NAME="app.vercel.foodhealth.twa"   # 與 init 時的 packageId 相同
   TWA_SHA256_FINGERPRINTS="AB:CD:..."             # 多個以逗號分隔;上架 Play 時再加上 Play Console「應用程式簽署金鑰」的指紋
   ```
   沒設定時 App 仍可使用,只是上方會多一條網址列。
