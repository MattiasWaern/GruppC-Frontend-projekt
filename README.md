# Filmvisarna

Filmvisarna är en webbaserad biografapplikation där besökare kan utforska filmer, se kommande visningar och boka biobiljetter. Projektet är utvecklat med React och TypeScript i frontend samt Node.js, Express och MySQL i backend.

Målet med projektet är att skapa ett bokningssystem där användaren enkelt kan gå från att välja film till att genomföra en bokning.

## Funktioner

### Filmer och visningar

- Visa filmer med titel, beskrivning, affisch och speltid.
- Se information om filmernas genrer och åldersgränser.
- Visa trailers och detaljerad filminformation.
- Se tillgängliga visningar med datum och starttid.
- Visa filmernas information och tillhörande visningar dynamiskt från databasen.

### Biljettbokning

- Välja filmvisning och antal biljetter.
- Välja platser i en interaktiv salongskarta.
- Få automatiska platsförslag baserat på tillgängliga platser.
- Se vilka platser som är lediga, bokade eller tillfälligt reserverade.
- Välja och ändra platser manuellt.
- Reservera platser tillfälligt under bokningsprocessen.
- Visa en nedräkning för reservationstiden.
- Förhindra dubbelbokningar genom kontroller i backend.
- Kontrollera åldersgränser vid bokning.
- Generera ett unikt bokningsnummer.
- Skicka bokningsbekräftelse via e-post.

### Användarkonton

- Registrering och inloggning.
- Autentisering med JWT.
- Personlig profilsida.
- Visa kommande och tidigare bokningar.
- Hämta bokningar kopplade till den inloggade användaren.

## Tekniker

### Frontend

| Teknik | Användningsområde |
|---|---|
| React | Komponentbaserat användargränssnitt |
| TypeScript | Typkontroll och utveckling |
| Vite | Utvecklingsserver och byggverktyg |
| React Router | Navigering mellan sidor |
| Tailwind CSS | Styling och responsiv design |
| Fetch API | Kommunikation med backend |

### Backend

| Teknik | Användningsområde |
|---|---|
| Node.js | Servermiljö |
| Express | REST API |
| TypeScript | Typad backendutveckling |
| MySQL | Relationsdatabas |
| mysql2 | Databaskommunikation |
| JWT | Autentisering |
| Node.js Crypto | Generering av bokningsnummer och reservationstoken |

Projektet använder MySQL för att lagra information om filmer, användare, visningar och bokningar.

Några av de centrala tabellerna är:

| Tabell | Beskrivning |
|---|---|
| `movies` | Information om filmer |
| `genre` | Filmgenrer |
| `movie_genre` | Koppling mellan filmer och genrer |
| `viewing` | Filmvisningar och tider |
| `theater` | Biografsalonger |
| `seats` | Platser i salongerna |
| `seat_hold` | Tillfälliga platsreservationer |
| `booking` | Genomförda bokningar |
| `bokad_stol` | Koppling mellan bokade platser och visningar |
| `users` | Användarkonton |
| `tickettype` | Biljettyper och priser |
| `event` | Evenemang |
| `eventcategory` | Evenemangskategorier |

Databasen använder relationer mellan tabellerna för att koppla filmer till visningar, salonger och bokningar.

## API

Backend är uppbyggd som ett REST API med Express.

Exempel på endpoints som används i projektet:

| Metod | Endpoint | Beskrivning |
|---|---|---|
| GET | `/api/movies` | Hämta filmer |
| GET | `/api/movies/:id` | Hämta en specifik film |
| GET | `/api/viewings` | Hämta filmvisningar |
| GET | `/api/viewings/:id/seat-status` | Hämta platsstatus |
| GET | `/api/tickets` | Hämta biljettyper |
| POST | `/api/holds` | Skapa en tillfällig reservation |
| DELETE | `/api/holds/:token` | Ta bort en reservation |
| POST | `/api/bookings` | Skapa en bokning |
| GET | `/api/bookings/mine` | Hämta användarens bokningar |
| POST | `/api/auth/login` | Logga in |

## Installation

För att köra projektet lokalt behövs Node.js, npm och en MySQL-databas.

### 1. Klona projektet

```bash
git clone https://github.com/MattiasWaern/GruppC-Frontend-projekt.git
```

### 2. Installera beroenden

Gå till respektive projektmapp för frontend och backend och installera beroendena:

```bash
npm install
```

### 3. Konfigurera databasen

Skapa en MySQL-databas och importera projektets databasschema.

Backend behöver konfigureras med databasanslutning och andra nödvändiga miljövariabler, exempelvis en hemlig nyckel för JWT.

### 4. Starta backend

```bash
npm run dev
```

Backend är konfigurerad att köras på port 3000 under lokal utveckling.

### 5. Starta frontend

```bash
npm run dev
```

Frontend körs via Vite, normalt på:

`http://localhost:5173`

Under lokal utveckling används Vites proxy för att vidarebefordra anrop från `/api` till backend på port 3000.


## Om projektet

Filmvisarna är utvecklat som ett grupprojekt inom utbildningen till frontendutvecklare.

Projektet har gett oss möjlighet att arbeta med både frontend och backend och bygga en applikation där flera olika systemdelar behöver fungera tillsammans.

## Skapat av
```
Luna,
Sofia,
Teddy,
Helena,
Rasmus
Mattias
```
