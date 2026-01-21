# Instrukcje: Offline Font Setup (Oswald i Font Awesome)

## Aktualny stan
Obecnie fonty są ładowane z CDN (wymagają połączenia internetowego):
- **Font Awesome 6.5.1** - z cdnjs.cloudflare.com
- **Oswald** - z Google Fonts
- **Roboto** - z Google Fonts

## Cel
Pobrać fonty lokalnie do katalogów projektu, aby aplikacja działała bez internetu.

---

## 1. Font Awesome 6.5.1 - Instrukcje pobierania

### Krok 1: Pobierz Font Awesome
1. Wejdź na: https://fontawesome.com/download
2. Pobierz wersję "Free for Web" (Font Awesome Free 6.5.1)
3. Rozpakuj archiwum ZIP

### Krok 2: Skopiuj pliki do projektu
Z rozpakowanego archiwum skopiuj:
```
fontawesome-free-6.5.1-web/
├── css/
│   └── all.min.css          → skopiuj do: assets/fontawesome/css/
├── webfonts/
│   ├── fa-brands-400.woff2  → skopiuj do: assets/fontawesome/webfonts/
│   ├── fa-brands-400.ttf
│   ├── fa-regular-400.woff2 → skopiuj do: assets/fontawesome/webfonts/
│   ├── fa-regular-400.ttf
│   ├── fa-solid-900.woff2   → skopiuj do: assets/fontawesome/webfonts/
│   └── fa-solid-900.ttf
```

**Struktura docelowa w projekcie:**
```
/home/user/AEP/assets/fontawesome/
├── css/
│   └── all.min.css
└── webfonts/
    ├── fa-brands-400.woff2
    ├── fa-brands-400.ttf
    ├── fa-regular-400.woff2
    ├── fa-regular-400.ttf
    ├── fa-solid-900.woff2
    └── fa-solid-900.ttf
```

---

## 2. Oswald Font - Instrukcje pobierania

### Krok 1: Pobierz Oswald z Google Fonts
1. Wejdź na: https://fonts.google.com/specimen/Oswald
2. Kliknij "Download family" (pobierze plik ZIP)
3. Rozpakuj archiwum

### Krok 2: Skopiuj pliki .ttf do projektu
Z rozpakowanego archiwum skopiuj pliki:
```
Oswald/
├── static/
│   ├── Oswald-Light.ttf       → skopiuj do: assets/fonts/
│   ├── Oswald-Regular.ttf     → skopiuj do: assets/fonts/
│   ├── Oswald-Medium.ttf      → skopiuj do: assets/fonts/
│   ├── Oswald-SemiBold.ttf    → skopiuj do: assets/fonts/
│   └── Oswald-Bold.ttf        → skopiuj do: assets/fonts/
```

**Struktura docelowa w projekcie:**
```
/home/user/AEP/assets/fonts/
├── Oswald-Light.ttf       (font-weight: 300)
├── Oswald-Regular.ttf     (font-weight: 400)
├── Oswald-Medium.ttf      (font-weight: 500)
├── Oswald-SemiBold.ttf    (font-weight: 600)
└── Oswald-Bold.ttf        (font-weight: 700)
```

---

## 3. Roboto Font (opcjonalnie) - Instrukcje pobierania

### Krok 1: Pobierz Roboto z Google Fonts
1. Wejdź na: https://fonts.google.com/specimen/Roboto
2. Kliknij "Download family"
3. Rozpakuj archiwum

### Krok 2: Skopiuj pliki
```
Roboto/
├── Roboto-Regular.ttf         → skopiuj do: assets/fonts/
├── Roboto-Medium.ttf          → skopiuj do: assets/fonts/
└── Roboto-Bold.ttf            → skopiuj do: assets/fonts/
```

---

## 4. Po skopiowaniu fontów - Aktualizacja kodu

Po skopiowaniu wszystkich plików fontów, pliki HTML i CSS zostały już zaktualizowane:

### Zaktualizowane pliki:
- ✅ `index.html` - zmienione linki na lokalne ścieżki
- ✅ `assets/oswald.css` - dodane @font-face dla Oswald
- ✅ `assets/roboto.css` - utworzony nowy plik dla Roboto (opcjonalnie)

---

## 5. Weryfikacja

Po skopiowaniu fontów:
1. Otwórz aplikację w przeglądarce
2. Otwórz DevTools (F12) → zakładka Network
3. Odśwież stronę (Ctrl+F5)
4. Sprawdź czy fonty ładują się z lokalnych ścieżek (`assets/fonts/`, `assets/fontawesome/`)
5. Sprawdź czy nie ma błędów 404 w konsoli

---

## Uwagi

- **Font Awesome**: Plik CSS `all.min.css` automatycznie odnosi się do folderu `../webfonts/`, dlatego struktura katalogów musi być zachowana
- **Format WOFF2**: Preferowany format dla przeglądarek (mniejszy rozmiar, lepsza kompresja)
- **Format TTF**: Fallback dla starszych przeglądarek
- Po skopiowaniu fontów aplikacja będzie działać w pełni offline

---

## Rozmiar do pobrania (szacunkowo)
- Font Awesome Free Web: ~5 MB
- Oswald: ~500 KB
- Roboto: ~500 KB
- **Łącznie: ~6 MB**
