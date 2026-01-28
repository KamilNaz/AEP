# AEP Fullstack - Arkusz Ewidencji Prewencyjnej

Pełna wersja systemu AEP zbudowana z wykorzystaniem nowoczesnych technologii fullstack.

## Stos technologiczny

### Backend
- **Node.js** + **Express.js** - serwer API
- **TypeScript** - typowanie statyczne
- **Prisma** - ORM dla bazy danych
- **PostgreSQL** - baza danych
- **JWT** - autoryzacja tokenowa
- **bcryptjs** - hashowanie haseł

### Frontend
- **React 18** - biblioteka UI
- **TypeScript** - typowanie statyczne
- **Vite** - bundler
- **TailwindCSS** - stylowanie
- **React Router** - routing
- **React Query** - zarządzanie stanem serwera
- **Zustand** - zarządzanie stanem aplikacji
- **Recharts** - wykresy
- **Leaflet** - mapy

## Wymagania

- Node.js 18+
- PostgreSQL 14+
- npm lub yarn

## Instalacja

### 1. Baza danych PostgreSQL

Utwórz bazę danych PostgreSQL:

```bash
# Zaloguj się do PostgreSQL
psql -U postgres

# Utwórz bazę danych
CREATE DATABASE aep_db;
```

### 2. Backend

```bash
cd fullstack/backend

# Zainstaluj zależności
npm install

# Skonfiguruj zmienne środowiskowe
cp .env.example .env
# Edytuj .env i ustaw DATABASE_URL

# Wygeneruj klienta Prisma
npm run prisma:generate

# Uruchom migracje
npm run prisma:migrate

# (Opcjonalnie) Załaduj dane testowe
npm run db:seed

# Uruchom serwer deweloperski
npm run dev
```

### 3. Frontend

```bash
cd fullstack/frontend

# Zainstaluj zależności
npm install

# Uruchom serwer deweloperski
npm run dev
```

## Konfiguracja

### Backend (.env)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aep_db?schema=public"
JWT_SECRET="twoj-super-tajny-klucz-zmien-w-produkcji"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001/api
```

## Uruchamianie

### Tryb deweloperski

Terminal 1 (Backend):
```bash
cd fullstack/backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd fullstack/frontend
npm run dev
```

Aplikacja będzie dostępna pod adresem:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Tryb produkcyjny

```bash
# Backend
cd fullstack/backend
npm run build
npm start

# Frontend
cd fullstack/frontend
npm run build
npm run preview
```

## Domyślne konta użytkowników

Po uruchomieniu `npm run db:seed`:

| Email | Hasło | Rola |
|-------|-------|------|
| admin@aep.pl | admin123 | ADMIN |
| user@aep.pl | user123 | USER |

## Struktura projektu

```
fullstack/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Definicja modeli bazy danych
│   │   └── seed.ts            # Dane testowe
│   ├── src/
│   │   ├── controllers/       # Kontrolery (w przyszłości)
│   │   ├── middleware/        # Middleware (auth, etc.)
│   │   ├── routes/            # Definicje endpointów API
│   │   ├── services/          # Logika biznesowa (w przyszłości)
│   │   ├── types/             # Typy TypeScript
│   │   ├── utils/             # Funkcje pomocnicze
│   │   └── index.ts           # Punkt wejścia serwera
│   ├── .env                   # Zmienne środowiskowe
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Komponenty współdzielone
│   │   │   ├── layout/        # Layout, Sidebar, Header
│   │   │   ├── tables/        # Komponenty tabel
│   │   │   ├── forms/         # Formularze
│   │   │   ├── charts/        # Wykresy
│   │   │   └── map/           # Komponenty mapy
│   │   ├── pages/             # Strony aplikacji
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # Komunikacja z API
│   │   ├── store/             # Stan aplikacji (Zustand)
│   │   ├── types/             # Typy TypeScript
│   │   ├── utils/             # Funkcje pomocnicze
│   │   ├── App.tsx            # Główny komponent
│   │   └── main.tsx           # Punkt wejścia
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

## API Endpoints

### Autoryzacja
- `POST /api/auth/register` - Rejestracja
- `POST /api/auth/login` - Logowanie
- `GET /api/auth/me` - Pobierz dane użytkownika
- `PUT /api/auth/password` - Zmień hasło

### Moduły (CRUD)
Każdy moduł posiada standardowe endpointy:
- `GET /api/{modul}` - Lista z paginacją i filtrami
- `GET /api/{modul}/:id` - Szczegóły rekordu
- `POST /api/{modul}` - Utwórz rekord
- `PUT /api/{modul}/:id` - Aktualizuj rekord
- `DELETE /api/{modul}/:id` - Usuń rekord
- `POST /api/{modul}/bulk` - Operacje masowe

Dostępne moduły:
- `/api/patrole`
- `/api/wykroczenia`
- `/api/wkrd`
- `/api/sankcje`
- `/api/konwoje`
- `/api/spb`
- `/api/pilotaze`
- `/api/zdarzenia`
- `/api/kalendarz`
- `/api/map`

### Dashboard
- `GET /api/dashboard/stats` - Statystyki
- `GET /api/dashboard/recent` - Ostatnie aktywności
- `GET /api/dashboard/charts` - Dane do wykresów

## Licencja

Projekt wewnętrzny - wszelkie prawa zastrzeżone.
