---
id: errorcodes
title: Errorcodes
sidebar_position: 9
---

# Errorcodes

Overzicht van alle codes die gebruikt worden door RPH Bank in de `ob_code` en `bb_code` velden van een **Payment Order (PO)**.

:::info
De Clearing Bank (CB) gebruikt eigen codes in `cb_code`. Raadpleeg de documentatie van de CB voor deze errorcodes.
:::

---

## OB codes (`ob_code`)

Codes gebruikt door de **Originator Bank (OB)** tijdens validatie van een Payment Order.

| Code | Beschrijving |
|---|---|
| `OB_OK` | Validatie geslaagd |
| `OB_UNKNOWN_OA` | Onbekende originator account (OA) |
| `OB_INSUFFICIENT_FUNDS` | Onvoldoende saldo (rekening zou negatief gaan) |
| `OB_AMOUNT_EXCEEDED` | Bedrag groter dan €500 |
| `OB_INVALID_IBAN` | Ongeldig IBAN formaat |
| `OB_INVALID_BIC` | Ongeldig BIC formaat |
| `OB_NEGATIVE_AMOUNT` | Bedrag is negatief of nul |
| `OB_CB_UNREACHABLE` | Clearing Bank niet bereikbaar na maximum retries |

---

## BB codes (`bb_code`)

Codes gebruikt door de **Beneficiary Bank (BB)** bij verwerking van een inkomende Payment Order.

| Code | Beschrijving |
|---|---|
| `BB_OK` | Validatie geslaagd, bedrag gecrediteerd op BA |
| `BB_UNKNOWN_BA` | Onbekende beneficiary account (BA) |
| `BB_INVALID_IBAN` | Ongeldig IBAN formaat van BA |
| `BB_INVALID_AMOUNT` | Ongeldig bedrag (bv. negatief of 0) |

---

## Statussen (`po_out` / `po_in`)

Statusvelden geven de **huidige toestand van een Payment Order** weer.

| Status | Beschrijving |
|---|---|
| `reserved` | Bedrag gereserveerd, wacht op ACK |
| `success` | Betaling volledig verwerkt (ACK ontvangen) |
| `failed` | Betaling gefaald |
| `pending_retry` | CB niet bereikbaar, retry mechanisme actief |

---

## Opmerkingen

- `ob_code` wordt gezet tijdens validatie bij de originator bank
- `bb_code` wordt gezet tijdens verwerking bij de beneficiary bank
- `cb_code` komt van de Clearing Bank
- Samen bepalen deze codes de uiteindelijke status van een betaling
- Deze codes zijn essentieel voor foutafhandeling, logging, debugging en analyse van de payment flow