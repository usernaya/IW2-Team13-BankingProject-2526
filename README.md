# RPH Bank — PingFin 2026

**Team 13 — Odisee Toegepaste Informatica**

RPH Bank is een simulatie van een bank binnen het SEPA-betalingssysteem.  
De applicatie verwerkt betalingen via een Clearing Bank (CB) en volgt een realistische bankflow.

---

## Functionaliteiten

- Accounts ophalen
- Betalingen uitvoeren (Payment Orders)
- Communicatie met de Clearing Bank (CB)
- Inkomende betalingen verwerken
- Uitgaande betalingen beheren
- Acknowledgements (ACK) verwerken
- Transacties en logs bekijken
- Simpele frontend (HTML + JavaScript)

---

## Architectuur

```
Frontend (HTML/JS)
       ↓
Express API (Node.js)
       ↓
  MySQL Database
       ↓
Clearing Bank (extern)
```

---

## Belangrijkste Endpoints

| Endpoint               | Methode | Beschrijving          |
|------------------------|---------|-----------------------|
| `/api/accounts`        | GET     | Alle accounts         |
| `/api/payments/new`    | POST    | Nieuwe betaling       |
| `/api/payments/outgoing` | GET   | Uitgaande betalingen  |
| `/api/payments/incoming` | GET   | Inkomende betalingen  |
| `/api/acks/out`        | GET     | ACKs ophalen          |
| `/api/acks/in`         | POST    | ACKs ontvangen        |
| `/api/transactions`    | GET     | Transacties           |
| `/api/logs`            | GET     | Logs                  |

---

## Setup

### 1. Installatie

```bash
npm install
```

### 2. Environment variabelen

Maak een `.env` bestand op basis van `.env.example`.

### 3. Start met Docker

```bash
docker-compose up --build
```

### Toegang

- **Frontend:** http://localhost:8080
- **API:** http://localhost:8080/api
- **API Documentatie** https://rph-bank-2labjdves-usernayas-projects.vercel.app/v1/intro

---

## Belangrijke regels

- Max bedrag: €500
- Geen negatieve balans
- IBAN moet geldig zijn
- Elke betaling krijgt een ACK
- Alle acties worden gelogd

---

## Team

| Naam                  | Rol               |
|-----------------------|-------------------|
| Aya Boutaarourte      | Backend           |
| Yamine Maalmi         | Frontend          |
| Imane Tenjiti         | UI / Documentatie |
| Yelle Vanschoenbeek   | Backend           |

---

## Doel

- Realistische bankflow simuleren
- Werken met APIs en Docker
- Integratie met externe systemen
