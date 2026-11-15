const base = process.env.BASE_URL || "http://localhost:3000";

const paths = [
  "/uz",
  "/ru",
  "/uz/insult",
  "/ru/faq",
  "/uz/contacts",
  "/uz/reviews",
  "/uz/about-tlns",
  "/uz/institutions",
  "/uz/news",
  "/uz/rent",
  "/uz/diseases",
  "/uz/useful",
  "/uz/privacy",
  "/uz/admin",
];

let failed = 0;
for (const path of paths) {
  const res = await fetch(`${base}${path}`);
  const ok = res.status === 200;
  console.log(`${ok ? "OK" : "FAIL"} ${res.status} ${path}`);
  if (!ok) failed += 1;
}

const leadRes = await fetch(`${base}/api/leads`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Smoke",
    phone: "+998900000000",
    message: "automated",
    consent: true,
  }),
});
console.log(`${leadRes.ok ? "OK" : "FAIL"} lead ${leadRes.status}`);
if (!leadRes.ok) failed += 1;

if (failed) {
  console.error(`Smoke failed: ${failed}`);
  process.exit(1);
}
console.log("Smoke passed");
