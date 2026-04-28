---
id: po-flow
title: Payment Flow
sidebar_position: 3
---

# Payment Flow

## Overzicht

```
Klant → OB → CB → BB → CB → OB
```

Elke betaling (**Payment Order - PO**) doorloopt dezelfde flow.
Op elk niveau wordt de betaling:

- gevalideerd
- voorzien van een timestamp
- doorgestuurd naar de volgende stap

---

## Use case 1 — OB validatie faalt

**Voorbeeld:** onbekende OA-rekening

```
PO_NEW → validatie FAALT → TX (failed)
```

- De betaling stopt onmiddellijk bij de Originator Bank (OB)
- De Clearing Bank (CB) en Beneficiary Bank (BB) worden niet bereikt
- Het saldo blijft ongewijzigd
- De klant krijgt direct een foutmelding

---

## Use case 2 — Interne betaling

**Voorbeeld:** OA en BA zitten bij dezelfde bank

```
PO_NEW → validatie OK → TX → ACCOUNTS (OA ↓, BA ↑)
```

- Geen communicatie met de CB nodig
- De betaling wordt volledig intern verwerkt
- Saldo van OA daalt, saldo van BA stijgt

---

## Use case 3 — CB validatie faalt

**Voorbeeld:** onbekende BB-bank

```
PO_NEW → PO_OUT → CB PO_IN → validatie FAALT
                            → CB ACK_OUT → ACK_IN → TX (failed)
```

- De CB weigert de betaling
- De BB wordt nooit bereikt
- De CB stuurt een **error ACK** terug naar de OB
- De OB markeert de transactie als failed

---

## Use case 4 — BB validatie faalt

**Voorbeeld:** onbekende BA-rekening

```
PO_NEW → PO_OUT → CB PO_IN → CB PO_OUT → BB PO_IN → validatie FAALT
                                                    → BB ACK_OUT
                                        → CB ACK_IN → CB ACK_OUT
                            → ACK_IN → TX (failed)
```

- De BB weigert de betaling
- De ACK gaat terug via CB naar OB
- De OB verwerkt de fout en zet de status op failed

---

## Use case 5 — Happy path

**Alle validaties slagen**

```
PO_NEW → PO_OUT → CB PO_IN → CB PO_OUT → BB PO_IN → TX → ACCOUNTS (BA ↑)
                                                    → BB ACK_OUT
                                        → CB ACK_IN → CB ACK_OUT
                            → ACK_IN → TX (success) → ACCOUNTS (OA ↓)
```

- De betaling wordt succesvol verwerkt
- BA ontvangt geld
- OA wordt pas verminderd na succesvolle ACK

---

## Geldreservering

| Moment | Wat gebeurt er |
|---|---|
| PO verstuurd naar CB | Bedrag wordt **gereserveerd** |
| Succesvolle ACK ontvangen | Bedrag wordt **definitief afgeschreven** |
| Error ACK of timeout | Reservering wordt **opgeheven** |

> **Regel:** De reservering mag nooit groter zijn dan het beschikbare saldo (saldo - lopende reserveringen).

---

## Uitzonderingen

### Exceptie 1 — CB API is down

- Bedrag wordt eerst gereserveerd
- Retry-mechanisme probeert opnieuw elke **30 seconden**
- Maximum **3 pogingen**
- Indien alle retries falen:
  - reservering wordt opgeheven
  - status wordt `failed`

---

### Exceptie 2 — Geen polling / gemiste ACK

- Bedrag blijft gereserveerd zolang er geen ACK is
- Bij herstart van de applicatie:
  - wordt onmiddellijk gepollt
  - gemiste ACK's worden opgehaald en verwerkt

---

## Samenvatting

- Elke betaling volgt een vaste flow via OB → CB → BB
- Validatie gebeurt op elk niveau
- ACK's bepalen het eindresultaat
- Reservering voorkomt negatieve saldi
- Fouten worden correct afgehandeld en gelogd