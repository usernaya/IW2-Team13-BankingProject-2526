---
id: login
title: Login
---

# POST /auth/login

Inloggen als bankmedewerker.
Dit endpoint geeft een **JWT token** terug dat gebruikt moet worden als Bearer token voor beveiligde endpoints.

Dit endpoint heeft **geen impact op de payment flow** (PO/ACK).

---

## Request body

| Veld | Type | Verplicht | Beschrijving |
|---|---|---|---|
| `username` | string | ja | Gebruikersnaam van de medewerker |
| `password` | string | ja | Wachtwoord |

---

## Voorbeeld request

```json
{
  "username": "michael",
  "password": "geheim123"
}
```

---

## Response 200 — Succes

```json
{
  "ok": true,
  "status": 200,
  "code": null,
  "message": "Login succesvol",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

De token moet meegestuurd worden in volgende requests:

```
Authorization: Bearer <token>
```

---

## Response 400 — Bad Request

```json
{
  "ok": false,
  "status": 400,
  "code": "INVALID_REQUEST",
  "message": "Username en password zijn verplicht",
  "data": null
}
```

---

## Response 401 — Unauthorized

```json
{
  "ok": false,
  "status": 401,
  "code": "AUTH_FAILED",
  "message": "Ongeldige gebruikersnaam of wachtwoord",
  "data": null
}
```

---

## Statuscodes

| Code | Betekenis |
|---|---|
| `200` | Login geslaagd, JWT token teruggegeven |
| `400` | Ontbrekende of ongeldige velden |
| `401` | Ongeldige credentials |