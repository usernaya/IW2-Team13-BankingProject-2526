-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
-- RPH Bank — Team 13 — PingFin 2026
-- Generated with valid Belgian IBANs

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE IF NOT EXISTS `bank13_db`;
USE `bank13_db`;

-- --------------------------------------------------------
-- accounts
-- --------------------------------------------------------

DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `ack_out`;
DROP TABLE IF EXISTS `ack_in`;
DROP TABLE IF EXISTS `po_out`;
DROP TABLE IF EXISTS `po_in`;
DROP TABLE IF EXISTS `po_new`;
DROP TABLE IF EXISTS `log`;
DROP TABLE IF EXISTS `accounts`;

CREATE TABLE `accounts` (
  `id` varchar(34) NOT NULL,
  `balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_balance_positive` CHECK (`balance` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- 20 accounts with valid Belgian IBANs and €5000 starting balance
-- Alice Janssen
-- Bob Peeters
-- Clara Dubois
-- David Maes
-- Eva Claes
-- Frank Willems
-- Grace Leclercq
-- Hamid Bouzid
-- Ilse Vermeersch
-- Jonas Declercq
-- Karima Ouali
-- Lars Bogaert
-- Mona Smet
-- Nabil El Idrissi
-- Olivia Goossens
-- Pieter Desmet
-- Quintien Baert
-- Roos Vandenberghe
-- Sander Nijs
-- Tine Wouters

INSERT INTO `accounts` (`id`, `balance`) VALUES
('BE94746018424092', 5000.00),
('BE63120840661487', 5000.00),
('BE93320510284854', 5000.00),
('BE75123433217228', 5000.00),
('BE92984123769773', 5000.00),
('BE02875328857155', 5000.00),
('BE30687388599717', 5000.00),
('BE98618997024900', 5000.00),
('BE26334262116128', 5000.00),
('BE64585681439656', 5000.00),
('BE15058517905592', 5000.00),
('BE68081358409569', 5000.00),
('BE86032244013961', 5000.00),
('BE53120014812591', 5000.00),
('BE98506972887833', 5000.00),
('BE67367321493206', 5000.00),
('BE08246593883112', 5000.00),
('BE94039611399721', 5000.00),
('BE64543619071636', 5000.00),
('BE29598300196864', 5000.00);

-- --------------------------------------------------------
-- ack_in
-- --------------------------------------------------------

CREATE TABLE `ack_in` (
  `po_id` varchar(255) NOT NULL,
  `po_amount` decimal(15,2) NOT NULL,
  `po_message` text DEFAULT NULL,
  `po_datetime` datetime NOT NULL,
  `ob_id` varchar(11) NOT NULL,
  `oa_id` varchar(34) NOT NULL,
  `ob_code` varchar(100) NOT NULL,
  `ob_datetime` datetime NOT NULL,
  `cb_code` varchar(100) NOT NULL,
  `cb_datetime` datetime NOT NULL,
  `bb_id` varchar(11) NOT NULL,
  `ba_id` varchar(34) NOT NULL,
  `bb_code` varchar(100) DEFAULT NULL,
  `bb_datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`po_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------
-- ack_out
-- --------------------------------------------------------

CREATE TABLE `ack_out` (
  `po_id` varchar(255) NOT NULL,
  `po_amount` decimal(15,2) NOT NULL,
  `po_message` text DEFAULT NULL,
  `po_datetime` datetime NOT NULL,
  `ob_id` varchar(11) NOT NULL,
  `oa_id` varchar(34) NOT NULL,
  `ob_code` varchar(100) NOT NULL,
  `ob_datetime` datetime NOT NULL,
  `cb_code` varchar(100) NOT NULL,
  `cb_datetime` datetime NOT NULL,
  `bb_id` varchar(11) NOT NULL,
  `ba_id` varchar(34) NOT NULL,
  `bb_code` varchar(100) NOT NULL,
  `bb_datetime` datetime NOT NULL,
  PRIMARY KEY (`po_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------
-- log
-- --------------------------------------------------------

CREATE TABLE `log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `datetime` datetime NOT NULL,
  `message` text DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `po_id` varchar(255) DEFAULT NULL,
  `po_amount` decimal(15,2) DEFAULT NULL,
  `po_message` text DEFAULT NULL,
  `po_datetime` datetime DEFAULT NULL,
  `ob_id` varchar(11) DEFAULT NULL,
  `oa_id` varchar(34) DEFAULT NULL,
  `ob_code` varchar(100) DEFAULT NULL,
  `ob_datetime` datetime DEFAULT NULL,
  `cb_code` varchar(100) DEFAULT NULL,
  `cb_datetime` datetime DEFAULT NULL,
  `bb_id` varchar(11) DEFAULT NULL,
  `ba_id` varchar(34) DEFAULT NULL,
  `bb_code` varchar(100) DEFAULT NULL,
  `bb_datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------
-- po_in
-- --------------------------------------------------------

CREATE TABLE `po_in` (
  `po_id` varchar(255) NOT NULL,
  `po_amount` decimal(15,2) NOT NULL,
  `po_message` text DEFAULT NULL,
  `po_datetime` datetime NOT NULL,
  `ob_id` varchar(11) NOT NULL,
  `oa_id` varchar(34) NOT NULL,
  `ob_code` varchar(100) NOT NULL,
  `ob_datetime` datetime NOT NULL,
  `cb_code` varchar(100) NOT NULL,
  `cb_datetime` datetime NOT NULL,
  `bb_id` varchar(11) NOT NULL,
  `ba_id` varchar(34) NOT NULL,
  `bb_code` varchar(100) DEFAULT NULL,
  `bb_datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`po_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------
-- po_new
-- --------------------------------------------------------

CREATE TABLE `po_new` (
  `po_id` varchar(255) NOT NULL,
  `po_amount` decimal(15,2) NOT NULL,
  `po_message` text DEFAULT NULL,
  `po_datetime` datetime NOT NULL,
  `ob_id` varchar(11) NOT NULL,
  `oa_id` varchar(34) NOT NULL,
  `ob_code` varchar(100) DEFAULT NULL,
  `ob_datetime` datetime DEFAULT NULL,
  `cb_code` varchar(100) DEFAULT NULL,
  `cb_datetime` datetime DEFAULT NULL,
  `bb_id` varchar(11) NOT NULL,
  `ba_id` varchar(34) NOT NULL,
  `bb_code` varchar(100) DEFAULT NULL,
  `bb_datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`po_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------
-- po_out
-- --------------------------------------------------------

CREATE TABLE `po_out` (
  `po_id` varchar(255) NOT NULL,
  `po_amount` decimal(15,2) NOT NULL,
  `po_message` text DEFAULT NULL,
  `po_datetime` datetime NOT NULL,
  `ob_id` varchar(11) NOT NULL,
  `oa_id` varchar(34) NOT NULL,
  `ob_code` varchar(100) NOT NULL,
  `ob_datetime` datetime NOT NULL,
  `cb_code` varchar(100) DEFAULT NULL,
  `cb_datetime` datetime DEFAULT NULL,
  `bb_id` varchar(11) NOT NULL,
  `ba_id` varchar(34) NOT NULL,
  `bb_code` varchar(100) DEFAULT NULL,
  `bb_datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`po_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------
-- transactions
-- --------------------------------------------------------

CREATE TABLE `transactions` (
  `id` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `datetime` datetime NOT NULL,
  `po_id` varchar(255) DEFAULT NULL,
  `account_id` varchar(34) NOT NULL,
  `isvalid` tinyint(1) DEFAULT NULL,
  `iscomplete` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_tx_acc` (`account_id`),
  CONSTRAINT `fk_tx_acc` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- RPH Bank Team 13 — PingFin 2026 — Odisee Hogeschool
