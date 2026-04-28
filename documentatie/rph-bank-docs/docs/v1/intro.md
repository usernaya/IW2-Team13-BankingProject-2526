---
id: intro
title: Introductie
sidebar_position: 1
---

# RPH Bank — API Documentatie

Welkom bij de officiële API-documentatie van **RPH Bank**.

> *Reliable. Professional. Human.*

Deze documentatie beschrijft alle interne en externe API-endpoints van de RPH Bank applicatie, ontwikkeld tijdens de **PingFin 2026** projectweek van Odisee Hogeschool.

---

## Over het project

RPH Bank simuleert een echte bank binnen het **SEPA-betalingssysteem**.

In dit systeem communiceren banken via een **Clearing Bank (CB)**. Betalingen worden dus niet rechtstreeks verstuurd, maar gaan altijd via deze tussenbank.

Elke betaling (**Payment Order - PO**) doorloopt deze flow:

1. Validatie bij de Originator Bank (OB)
2. Versturen naar de Clearing Bank (CB)
3. Validatie door de CB
4. Doorsturen naar de Beneficiary Bank (BB)
5. Verwerking van de betaling
6. Terugsturen van een bevestiging (ACK)

`OB → CB → BB → ACK terug`

---

## Team

| Naam | Rol |
|---|---|
| Boutaarourte Aya | Backend / API / Project lead |
| Maalmi Yamine | Backend / Database |
| Tenjiti Imane | Frontend / UI |
| Vanschoenbeek Yelle | Testing / Documentatie |

**BIC:** `BMPBBEBB` | **Team:** 13 | **Coaches:** Sam Van Buggenhout & Jens Baetens

---

## Base URL

Alle endpoints zijn beschikbaar via:

```
http://localhost:4000/api
```

---

## Authenticatie

De meeste endpoints vereisen een Bearer token.

**1. Token ophalen:**

```
POST /auth/login
```

**2. Gebruik in requests:**

```
Authorization: Bearer <jouw_token>
```

Zonder geldig token krijg je een `401 Unauthorized` response.

---

## Architectuur (kort)

Onze applicatie bestaat uit:

- **API** — Node.js + Express
- **Database** — accounts, transacties, logs
- **GUI** — frontend

De frontend praat nooit rechtstreeks met de database, enkel via de API.

---

## Belangrijke concepten

| Afkorting | Betekenis |
|---|---|
| **PO** | Payment Order — een betaling |
| **ACK** | Acknowledgement — bevestiging |
| **OB** | Originator Bank |
| **CB** | Clearing Bank |
| **BB** | Beneficiary Bank |
| **IBAN** | Rekeningnummer |
| **BIC** | Bankcode |

---

## Business rules

- Max bedrag per betaling: **€500**
- Saldo mag nooit onder **€0** gaan
- PO ID moet uniek zijn en begint met `BMPBBEBB_xxxxx` (max 50 karakters)
- Max **2 cijfers** na de komma
- Datetime formaat: `YYYY-MM-DD HH:MM:SS`
- Elke betaling moet binnen **1 uur** een ACK krijgen
- Alles wordt gelogd (errors + success)

---

## Payment Flow (simpel)

```
Client → OB → CB → BB → CB → OB → Client
```

- **OB** valideert en stuurt
- **CB** controleert en routeert
- **BB** verwerkt
- ACK gaat terug

---

## Foutafhandeling

Het systeem detecteert:

- Ongeldig IBAN / BIC
- Bedrag > €500
- Negatief bedrag
- Onvoldoende saldo
- Bank of account bestaat niet
- Geen response van CB (timeout)

Alle fouten worden opgeslagen in de logs.

---

## Wat bevat deze documentatie?

- API endpoints met JSON request & response
- Voorbeelden per endpoint
- Flow uitleg per use case
- Error handling & errorcodes

---

## Doel van deze API

- Betalingen simuleren tussen banken
- Realistische bankflow bouwen
- Errors correct behandelen
- Stabiel systeem maken voor testing