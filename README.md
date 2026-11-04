# Soy ve Beton
Ameleden hanedana 3D inşaat, hayat ve aile simülasyonu. Fikir ve oynanış: Serhat Tutak. Geliştirme: Claude.

    npm install
    npm test                # 130 yıllık otomatik kampanyalar
    npm run build           # dist/index.html, tek dosyalık oyun
    npm run build:artifact  # dist/artifact.html
    node tools/sim.mjs 16 150      # denge raporu
    node tools/ui-smoke.mjs --shots  # gerçek tarayıcı testi

## Kurallar
- Oyun durumu (`World`) düz JSON. Kartlar `{id,a}` olarak durur, metin ve seçenekler `core/events.ts`te.
- Rastgelelik yalnızca `util.rnd(w)` ile. Çekirdek (`src/core`) arayüzü bilmez.
- `confirm/alert` kullanılmaz. TestFlight'a yükleme yalnızca Serhat açıkça isterse.
- Şehir, ekonomi ve depremler kurgusaldır.

## Dosyalar
`core/data.ts` 30 aşama, ev, araba, yatırım, senaryo tabloları · `core/sim.ts` aylık motor, eylemler, veraset, test botu · `core/events.ts` olay kartları ve hikâye yayları · `ui/city3d.ts` canlı 3D şehir · `ui/app.ts` arayüz.
