---
id: architectuur
title: Architectuur
sidebar_position: 2
---

# Architectuur

## Globale structuur

De applicatie volgt een **3-tier architectuur** waarbij elke laag strikt gescheiden is.

| Laag | Technologie | Rol |
|---|---|---|
| **Frontend** | HTML / CSS / JavaScript | GUI voor de gebruiker |
| **Backend** | Node.js + Express.js | REST API — alle logica |
| **Database** | MariaDB | Opslag van data |

> **Belangrijk:** De GUI mag **nooit rechtstreeks met de database communiceren**. Alle communicatie verloopt via de API.

---

## Backend mapstructuur

De backend is opgesplitst volgens een duidelijke structuur:

```
src/
├── routes/         → definitie van API-endpoints (URL's)
├── controllers/    → verwerking van requests & responses
├── services/       → business logic (CB communicatie, polling, retry)
├── models/         → database interactie (SQL queries)
└── middleware/     → authenticatie (JWT) en validatie
```

Dit zorgt voor een **duidelijke scheiding van verantwoordelijkheden** (separation of concerns).

---

## Database tabellen

| Tabel | Beschrijving |
|---|---|
| `accounts` | Bankrekeningen met saldo |
| `po_out` | Uitgaande Payment Orders (als OB) |
| `po_in` | Inkomende Payment Orders (als BB) |
| `ack_in` | Ontvangen ACK's (als OB) |
| `ack_out` | Verstuurde ACK's (als BB) |
| `transactions` | Verwerkte transacties |
| `logs` | Logging van alle events en fouten |

Alle acties (success + errors) worden gelogd voor traceability.

---

## Polling worker

Een achtergrondproces draait continu en communiceert met de Clearing Bank.

Frequentie: **elke 10 seconden**

Het proces voert volgende acties uit:

- `GET /po_out` — nieuwe inkomende PO's ophalen en verwerken als BB
- `GET /ack_out` — ACK's ophalen en verwerken als OB

Dit simuleert een **real-time banksysteem zonder websockets**.

---

## Docker Compose services

De applicatie draait in containers via Docker Compose.

| Service | Image | Poort |
|---|---|---|
| `db` | mariadb:latest | 3306 |
| `app` | custom (Node.js API) | 4000 |
| `docs` | custom (Docusaurus) | 3000 |

Voordelen:
- Zelfde omgeving voor iedereen
- Makkelijk opstarten (`docker-compose up`)
- Geen installatieproblemen

---

## Gebruikte technologieën

| Categorie | Technologie |
|---|---|
| Backend | Node.js + Express.js |
| Database | MariaDB |
| Database beheer | MySQL Workbench |
| Frontend | HTML / CSS / JavaScript |
| Containerisatie | Docker + Docker Compose |
| Versiebeheer | Git + GitHub |
| Project management | Trello |
| API testen | Postman |
| API documentatie | Docusaurus |

---

## Samenvatting

De applicatie is opgebouwd volgens een **moderne webarchitectuur** met:

- Duidelijke scheiding tussen frontend, backend en database
- REST API als centrale communicatie-laag
- Docker voor consistente deployment
- Polling mechanisme voor communicatie met de Clearing Bank

Dit maakt het systeem **schaalbaar, testbaar en realistisch**.