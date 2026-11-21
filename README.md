# Ocak: Soyun Çağları

Buzul Çağı'ndan Tunç Çağı krallıklarına uzanan tarihî hanedan oyunu (iOS, Capacitor).

- `app/index.html` — oyunun tamamı (tek dosya, çevrimdışı)
- `mobile/` — iOS sarmalayıcı
- `.github/workflows/ios.yml` — derleme; commit mesajında `[testflight]` varsa TestFlight'a yükler
- `.github/workflows/appstore.yml` — App Store Connect işlemleri (hazirlik / bilgiler / gonder / durum)

Gerekli gizli anahtarlar: `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8`, `IOS_TEAM_ID`
