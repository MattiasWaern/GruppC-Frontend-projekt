Visningar
GET /api/viewings

Hämtar alla visningar, sorterade efter datum och starttid (stigande).

Parametrar: Inga

Svar 200 OK

json
[
  {
    "viewingId": 1,
    "theaterId": 2,
    "viewing_date": "2026-10-20",
    "viewing_start_time": "18:00:00"
  },
  {
    "viewingId": 2,
    "theaterId": 1,
    "viewing_date": "2026-10-20",
    "viewing_start_time": "20:30:00"
  }
]

Felsvar

Status	Svar	Orsak
500	{ "error": "Kunde inte hämta visningar" }	Databasfel / serverfel
GET /api/viewings/:id

Hämtar en enskild visning.

Path-parametrar

Parameter	Typ	Obligatorisk	Beskrivning
id	number	Ja	Visningens ID (heltal större än 0)

Exempel

GET /api/viewings/1

Svar 200 OK

json
{
  "viewingId": 1,
  "theaterId": 2,
  "viewing_date": "2026-10-20",
  "viewing_start_time": "18:00:00"
}

Felsvar

Status	Svar	Orsak
400	{ "error": "Ogiltigt visings-ID" }	id är inte ett positivt heltal
404	{ "error": "Visningen hittades inte" }	Ingen visning med angivet ID finns
500	{ "error": "Kunde inte hämta visningen" }	Databasfel / serverfel
GET /api/viewings/:id/seats

Hämtar alla stolar i salongen som visningen sker i, och markerar vilka som är bokade för just den visningen. Endast bokningar med booking_confirmation = 'confirmed' räknas som bokade.

Stolarna sorteras efter row och därefter seatnumber.

Path-parametrar

Parameter	Typ	Obligatorisk	Beskrivning
id	number	Ja	Visningens ID (heltal större än 0)

Exempel

GET /api/viewings/1/seats

Svar 200 OK

json
[
  {
    "seatId": 10,
    "theaterId": 2,
    "row": 1,
    "seatnumber": 1,
    "booked": false
  },
  {
    "seatId": 11,
    "theaterId": 2,
    "row": 1,
    "seatnumber": 2,
    "booked": true
  }
]

Felsvar

Status	Svar	Orsak
400	{ "error": "Ogiltigt visnings ID" }	id är inte ett positivt heltal
404	{ "error": "Visningen hittades inte" }	Ingen visning med angivet ID finns
500	{ "error": "Kunde inte hämta visningens stolar" }	Databasfel / serverfel

Implementationsdetaljer

Salongen hämtas från visningen (viewing.theaterId).
Bokade stolar läses från kolumnen booking.seats, som är en kommaseparerad sträng med seatId (t.ex. "10,11,12").
Ogiltiga eller tomma värden i strängen ignoreras.
Stolar

GET /api/seats/theater/:theaterId

Hämtar alla stolar i en salong, sorterade efter row och seatnumber.

Path-parametrar

Parameter	Typ	Obligatorisk	Beskrivning
theaterId	number	Ja	Salongens ID (heltal större än 0)

Exempel

GET /api/seats/theater/2

Svar 200 OK

json
[
  {
    "seatId": 10,
    "theaterId": 2,
    "row": 1,
    "seatnumber": 1
  },
  {
    "seatId": 11,
    "theaterId": 2,
    "row": 1,
    "seatnumber": 2
  }
]

Felsvar

Status	Svar	Orsak
400	{ "error": "Ogiltigt salongs ID" }	theaterId är inte ett positivt heltal
500	{ "error": "Kunde inte hämta stolar" }	Databasfel / serverfel

En salong utan stolar (eller ett ID som inte finns) returnerar 200 OK med en tom lista [].

Felhantering

Alla fel returneras som JSON med följande form:

json
{
  "error": "Beskrivning av felet"
}
Status	Betydelse
400	Ogiltig indata (t.ex. ogiltigt ID)
404	Resursen hittades inte
500	Internt serverfel (databas eller annat)