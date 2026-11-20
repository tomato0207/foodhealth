// Digital Asset Links: proves the Android (TWA) app and this site belong together, so the app opens
// full-screen without Chrome's address bar. Values come from env so the signing key can change without a code edit:
//   TWA_PACKAGE_NAME          e.g. "app.vercel.foodhealth.twa" (the packageId chosen in `bubblewrap init`)
//   TWA_SHA256_FINGERPRINTS   comma-separated SHA-256 cert fingerprints (`bubblewrap fingerprint list`,
//                             plus the Play Console "App signing key" one if published on Google Play)
export function GET() {
  const packageName = process.env.TWA_PACKAGE_NAME?.trim();
  const fingerprints = (process.env.TWA_SHA256_FINGERPRINTS ?? "")
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  if (!packageName || fingerprints.length === 0) {
    return Response.json([]);
  }

  return Response.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: packageName,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ]);
}
