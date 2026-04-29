-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server versie:                12.2.2-MariaDB-ubu2404 - mariadb.org binary distribution
-- Server OS:                    debian-linux-gnu
-- HeidiSQL Versie:              12.17.0.7270
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Databasestructuur van bank13_db wordt geschreven
CREATE DATABASE IF NOT EXISTS `bank13_db` /*!40100 DEFAULT CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci */;
USE `bank13_db`;

-- Structuur van  tabel bank13_db.accounts wordt geschreven
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` varchar(34) NOT NULL,
  `balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_balance_positive` CHECK (`balance` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- Dumpen data van tabel bank13_db.accounts: ~10 rows (ongeveer)
INSERT INTO `accounts` (`id`, `balance`) VALUES
	('BE00000000000000', 670.00),
	('BE11111111111111', 5000.00),
	('BE22222222222222', 1250.00),
	('BE33333333333333', 15000.00),
	('BE44444444444444', 320.50),
	('BE55555555555555', 8900.00),
	('BE66666666666666', 100.00),
	('BE77777777777777', 450.00),
	('BE88888888888888', 10500.00),
	('BE99999999999999', 2100.00);

-- Structuur van  tabel bank13_db.ack_in wordt geschreven
CREATE TABLE IF NOT EXISTS `ack_in` (
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

-- Dumpen data van tabel bank13_db.ack_in: ~10 rows (ongeveer)
INSERT INTO `ack_in` (`po_id`, `po_amount`, `po_message`, `po_datetime`, `ob_id`, `oa_id`, `ob_code`, `ob_datetime`, `cb_code`, `cb_datetime`, `bb_id`, `ba_id`, `bb_code`, `bb_datetime`) VALUES
	('15:INGBBEBB:RklWMTU=', 300.00, NULL, '2026-04-30 13:00:00', 'INGBBEBB', 'BE2222', 'EXT-77', '2026-04-30 13:01:00', 'CB-15', '2026-04-30 13:02:00', 'BMPBBEBB', 'BE3333', NULL, NULL),
	('16:KREDBEBB:U0lYMTY=', 20.00, NULL, '2026-04-30 14:00:00', 'KREDBEBB', 'BE4444', 'EXT-66', '2026-04-30 14:01:00', 'CB-16', '2026-04-30 14:02:00', 'BMPBBEBB', 'BE4444', NULL, NULL),
	('17:BNPABEBB:U0VWMTc=', 115.00, NULL, '2026-04-30 15:00:00', 'BNPABEBB', 'BE5555', 'EXT-55', '2026-04-30 15:01:00', 'CB-17', '2026-04-30 15:02:00', 'BMPBBEBB', 'BE5555', NULL, NULL),
	('18:INGBBEBB:RUlHMTg=', 45.00, NULL, '2026-04-30 16:00:00', 'INGBBEBB', 'BE6666', 'EXT-44', '2026-04-30 16:01:00', 'CB-18', '2026-04-30 16:02:00', 'BMPBBEBB', 'BE6666', NULL, NULL),
	('19:KREDBEBB:TklOMTk=', 90.00, NULL, '2026-05-01 09:00:00', 'KREDBEBB', 'BE7777', 'EXT-33', '2026-05-01 09:01:00', 'CB-19', '2026-05-01 09:02:00', 'BMPBBEBB', 'BE7777', NULL, NULL),
	('20:BNPABEBB:VFdNMjA=', 10.00, NULL, '2026-05-01 10:00:00', 'BNPABEBB', 'BE8888', 'EXT-22', '2026-05-01 10:01:00', 'CB-20', '2026-05-01 10:02:00', 'BMPBBEBB', 'BE8888', NULL, NULL),
	('21:INGBBEBB:VFcxMjE=', 60.00, NULL, '2026-05-01 11:00:00', 'INGBBEBB', 'BE9999', 'EXT-11', '2026-05-01 11:01:00', 'CB-21', '2026-05-01 11:02:00', 'BMPBBEBB', 'BE9999', NULL, NULL),
	('22:KREDBEBB:VFcyMjI=', 250.00, NULL, '2026-05-01 12:00:00', 'KREDBEBB', 'BE0000', 'EXT-01', '2026-05-01 12:01:00', 'CB-22', '2026-05-01 12:02:00', 'BMPBBEBB', 'BE0000', NULL, NULL),
	('2:KREDBEBB:UkVDRVBUMg==', 50.00, NULL, '2026-04-27 11:00:00', 'KREDBEBB', 'BE3333', 'EXT-99', '2026-04-27 11:01:00', 'CB-2', '2026-04-27 11:02:00', 'BMPBBEBB', 'BE1111', NULL, NULL),
	('8:BNPABEBB:QklMTDA4', 200.00, NULL, '2026-04-29 10:00:00', 'BNPABEBB', 'BE6666', 'EXT-88', '2026-04-29 10:01:00', 'CB-8', '2026-04-29 10:02:00', 'BMPBBEBB', 'BE9999', NULL, NULL);

-- Structuur van  tabel bank13_db.ack_out wordt geschreven
CREATE TABLE IF NOT EXISTS `ack_out` (
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

-- Dumpen data van tabel bank13_db.ack_out: ~10 rows (ongeveer)
INSERT INTO `ack_out` (`po_id`, `po_amount`, `po_message`, `po_datetime`, `ob_id`, `oa_id`, `ob_code`, `ob_datetime`, `cb_code`, `cb_datetime`, `bb_id`, `ba_id`, `bb_code`, `bb_datetime`) VALUES
	('11:BMPBBEBB:WkhFMTE=', 45.00, NULL, '2026-04-30 09:00:00', 'BMPBBEBB', 'BE1111', 'SIG-11', '2026-04-30 09:01:00', 'CB-F11', '2026-04-30 09:02:00', 'INGBBEBB', 'BE2222', 'OK-ING', '2026-04-30 09:05:00'),
	('12:BMPBBEBB:V0VMMTI=', 12.00, NULL, '2026-04-30 10:00:00', 'BMPBBEBB', 'BE2222', 'SIG-12', '2026-04-30 10:01:00', 'CB-F12', '2026-04-30 10:02:00', 'KREDBEBB', 'BE3333', 'OK-KRE', '2026-04-30 10:05:00'),
	('13:BMPBBEBB:VEhSRTM=', 150.00, NULL, '2026-04-30 11:00:00', 'BMPBBEBB', 'BE3333', 'SIG-13', '2026-04-30 11:01:00', 'CB-F13', '2026-04-30 11:02:00', 'BNPABEBB', 'BE1111', 'OK-BNP', '2026-04-30 11:05:00'),
	('14:BMPBBEBB:Rk9VMTQ=', 60.00, NULL, '2026-04-30 12:00:00', 'BMPBBEBB', 'BE4444', 'SIG-14', '2026-04-30 12:01:00', 'CB-F14', '2026-04-30 12:02:00', 'INGBBEBB', 'BE5555', 'OK-ING', '2026-04-30 12:05:00'),
	('19:KREDBEBB:TklOMTk=', 90.00, NULL, '2026-05-01 09:00:00', 'KREDBEBB', 'BE7777', 'EXT-SIG', '2026-05-01 09:01:00', 'CB-F19', '2026-05-01 09:02:00', 'BMPBBEBB', 'BE7777', 'OK-BMP', '2026-05-01 09:05:00'),
	('1:BMPBBEBB:U0VUQTAx', 100.00, NULL, '2026-04-27 10:00:00', 'BMPBBEBB', 'BE1111', 'SIG-1', '2026-04-27 10:01:00', 'CB-F1', '2026-04-27 10:02:00', 'INGBBEBB', 'BE2222', 'OK-ING', '2026-04-27 10:05:00'),
	('20:BNPABEBB:VFdNMjA=', 10.00, NULL, '2026-05-01 10:00:00', 'BNPABEBB', 'BE8888', 'EXT-SIG', '2026-05-01 10:01:00', 'CB-F20', '2026-05-01 10:02:00', 'BMPBBEBB', 'BE8888', 'OK-BMP', '2026-05-01 10:05:00'),
	('21:INGBBEBB:VFcxMjE=', 60.00, NULL, '2026-05-01 11:00:00', 'INGBBEBB', 'BE9999', 'EXT-SIG', '2026-05-01 11:01:00', 'CB-F21', '2026-05-01 11:02:00', 'BMPBBEBB', 'BE9999', 'OK-BMP', '2026-05-01 11:05:00'),
	('3:BMPBBEBB:UEFZTTAz', 250.00, NULL, '2026-04-27 12:00:00', 'BMPBBEBB', 'BE1111', 'SIG-3', '2026-04-27 12:01:00', 'CB-F3', '2026-04-27 12:02:00', 'BNPABEBB', 'BE2222', 'OK-BNP', '2026-04-27 12:05:00'),
	('6:INGBBEBB:UkVGMDA2', 75.00, NULL, '2026-04-28 15:00:00', 'INGBBEBB', 'BE9999', 'EXT-SIG', '2026-04-28 15:01:00', 'CB-F6', '2026-04-28 15:02:00', 'BMPBBEBB', 'BE6666', 'OK-BMP', '2026-04-28 15:05:00');

-- Structuur van  tabel bank13_db.log wordt geschreven
CREATE TABLE IF NOT EXISTS `log` (
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- Dumpen data van tabel bank13_db.log: ~10 rows (ongeveer)
INSERT INTO `log` (`id`, `datetime`, `message`, `type`, `po_id`, `po_amount`, `po_message`, `po_datetime`, `ob_id`, `oa_id`, `ob_code`, `ob_datetime`, `cb_code`, `cb_datetime`, `bb_id`, `ba_id`, `bb_code`, `bb_datetime`) VALUES
	(1, '2026-04-27 10:00:00', 'outgoing po created', 'po_new', '1:BMPBBEBB:U0VUQTAx', 100.00, NULL, NULL, 'BMPBBEBB', 'BE1111', NULL, NULL, NULL, NULL, 'INGBBEBB', 'BE2222', NULL, NULL),
	(2, '2026-04-27 11:00:00', 'incoming po received', 'po_in', '2:KREDBEBB:UkVDRVBUMg==', 50.00, NULL, NULL, 'KREDBEBB', 'BE3333', NULL, NULL, NULL, NULL, 'BMPBBEBB', 'BE1111', NULL, NULL),
	(3, '2026-04-27 12:00:00', 'sent to cb', 'po_out', '3:BMPBBEBB:UEFZTTAz', 250.00, NULL, NULL, 'BMPBBEBB', 'BE1111', NULL, NULL, NULL, NULL, 'BNPABEBB', 'BE2222', NULL, NULL),
	(4, '2026-04-28 09:00:00', 'ack received', 'ack_in', '4:BMPBBEBB:Rk9PMEQ0', 25.00, NULL, NULL, 'BNPABEBB', 'BE5555', NULL, NULL, NULL, NULL, 'BMPBBEBB', 'BE1111', NULL, NULL),
	(5, '2026-04-28 14:00:00', 'high value check', 'general', '5:BMPBBEBB:U0FMMDU=', 1000.00, NULL, NULL, 'BMPBBEBB', 'BE8888', NULL, NULL, NULL, NULL, 'KREDBEBB', 'BE4444', NULL, NULL),
	(6, '2026-04-28 15:00:00', 'settled', 'ack_out', '6:INGBBEBB:UkVGMDA2', 75.00, NULL, NULL, 'INGBBEBB', 'BE9999', NULL, NULL, NULL, NULL, 'BMPBBEBB', 'BE6666', NULL, NULL),
	(7, '2026-04-29 08:00:00', 'po_out record', 'po_out', '7:BMPBBEBB:V0VCMDA3', 5.00, NULL, NULL, 'BMPBBEBB', 'BE4444', NULL, NULL, NULL, NULL, 'KREDBEBB', 'BE8888', NULL, NULL),
	(8, '2026-04-29 10:00:00', 'inbound credit', 'po_in', '8:BNPABEBB:QklMTDA4', 200.00, NULL, NULL, 'BNPABEBB', 'BE6666', NULL, NULL, NULL, NULL, 'BMPBBEBB', 'BE9999', NULL, NULL),
	(9, '2026-04-29 11:00:00', 'retry process', 'general', '9:BMPBBEBB:R0lGVDA5', 30.00, NULL, NULL, 'BMPBBEBB', 'BE7777', NULL, NULL, NULL, NULL, 'BNPABEBB', 'BE1111', NULL, NULL),
	(10, '2026-04-29 12:00:00', 'webapp entry', 'po_new', '10:BMPBBEBB:T05FMTA=', 15.00, NULL, NULL, 'BMPBBEBB', 'BE0000', NULL, NULL, NULL, NULL, 'KREDBEBB', 'BE2222', NULL, NULL);

-- Structuur van  tabel bank13_db.po_in wordt geschreven
CREATE TABLE IF NOT EXISTS `po_in` (
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

-- Dumpen data van tabel bank13_db.po_in: ~10 rows (ongeveer)
INSERT INTO `po_in` (`po_id`, `po_amount`, `po_message`, `po_datetime`, `ob_id`, `oa_id`, `ob_code`, `ob_datetime`, `cb_code`, `cb_datetime`, `bb_id`, `ba_id`, `bb_code`, `bb_datetime`) VALUES
	('15:INGBBEBB:RklWMTU=', 300.00, NULL, '2026-04-30 13:00:00', 'INGBBEBB', 'BE2222', 'EXT-77', '2026-04-30 13:01:00', 'CB-15', '2026-04-30 13:02:00', 'BMPBBEBB', 'BE3333', NULL, NULL),
	('16:KREDBEBB:U0lYMTY=', 20.00, NULL, '2026-04-30 14:00:00', 'KREDBEBB', 'BE4444', 'EXT-66', '2026-04-30 14:01:00', 'CB-16', '2026-04-30 14:02:00', 'BMPBBEBB', 'BE4444', NULL, NULL),
	('17:BNPABEBB:U0VWMTc=', 115.00, NULL, '2026-04-30 15:00:00', 'BNPABEBB', 'BE5555', 'EXT-55', '2026-04-30 15:01:00', 'CB-17', '2026-04-30 15:02:00', 'BMPBBEBB', 'BE5555', NULL, NULL),
	('18:INGBBEBB:RUlHMTg=', 45.00, NULL, '2026-04-30 16:00:00', 'INGBBEBB', 'BE6666', 'EXT-44', '2026-04-30 16:01:00', 'CB-18', '2026-04-30 16:02:00', 'BMPBBEBB', 'BE6666', NULL, NULL),
	('19:KREDBEBB:TklOMTk=', 90.00, NULL, '2026-05-01 09:00:00', 'KREDBEBB', 'BE7777', 'EXT-33', '2026-05-01 09:01:00', 'CB-19', '2026-05-01 09:02:00', 'BMPBBEBB', 'BE7777', NULL, NULL),
	('20:BNPABEBB:VFdNMjA=', 10.00, NULL, '2026-05-01 10:00:00', 'BNPABEBB', 'BE8888', 'EXT-22', '2026-05-01 10:01:00', 'CB-20', '2026-05-01 10:02:00', 'BMPBBEBB', 'BE8888', NULL, NULL),
	('21:INGBBEBB:VFcxMjE=', 60.00, NULL, '2026-05-01 11:00:00', 'INGBBEBB', 'BE9999', 'EXT-11', '2026-05-01 11:01:00', 'CB-21', '2026-05-01 11:02:00', 'BMPBBEBB', 'BE9999', NULL, NULL),
	('22:KREDBEBB:VFcyMjI=', 250.00, NULL, '2026-05-01 12:00:00', 'KREDBEBB', 'BE0000', 'EXT-01', '2026-05-01 12:01:00', 'CB-22', '2026-05-01 12:02:00', 'BMPBBEBB', 'BE0000', NULL, NULL),
	('2:KREDBEBB:UkVDRVBUMg==', 50.00, NULL, '2026-04-27 11:00:00', 'KREDBEBB', 'BE3333', 'EXT-99', '2026-04-27 11:01:00', 'CB-2', '2026-04-27 11:02:00', 'BMPBBEBB', 'BE1111', NULL, NULL),
	('8:BNPABEBB:QklMTDA4', 200.00, NULL, '2026-04-29 10:00:00', 'BNPABEBB', 'BE6666', 'EXT-88', '2026-04-29 10:01:00', 'CB-8', '2026-04-29 10:02:00', 'BMPBBEBB', 'BE9999', NULL, NULL);

-- Structuur van  tabel bank13_db.po_new wordt geschreven
CREATE TABLE IF NOT EXISTS `po_new` (
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

-- Dumpen data van tabel bank13_db.po_new: ~10 rows (ongeveer)
INSERT INTO `po_new` (`po_id`, `po_amount`, `po_message`, `po_datetime`, `ob_id`, `oa_id`, `ob_code`, `ob_datetime`, `cb_code`, `cb_datetime`, `bb_id`, `ba_id`, `bb_code`, `bb_datetime`) VALUES
	('10:BMPBBEBB:T05FMTA=', 15.00, NULL, '2026-04-29 12:00:00', 'BMPBBEBB', 'BE0000', NULL, NULL, NULL, NULL, 'KREDBEBB', 'BE2222', NULL, NULL),
	('1:BMPBBEBB:U0VUQTAx', 100.00, NULL, '2026-04-27 10:00:00', 'BMPBBEBB', 'BE1111', NULL, NULL, NULL, NULL, 'INGBBEBB', 'BE2222', NULL, NULL),
	('2:KREDBEBB:UkVDRVBUMg==', 50.00, NULL, '2026-04-27 11:00:00', 'KREDBEBB', 'BE3333', NULL, NULL, NULL, NULL, 'BMPBBEBB', 'BE1111', NULL, NULL),
	('3:BMPBBEBB:UEFZTTAz', 250.00, NULL, '2026-04-27 12:00:00', 'BMPBBEBB', 'BE1111', NULL, NULL, NULL, NULL, 'BNPABEBB', 'BE2222', NULL, NULL),
	('4:BMPBBEBB:Rk9PMEQ0', 25.00, NULL, '2026-04-28 09:00:00', 'BMPBBEBB', 'BE5555', NULL, NULL, NULL, NULL, 'INGBBEBB', 'BE1111', NULL, NULL),
	('5:BMPBBEBB:U0FMMDU=', 500.00, NULL, '2026-04-28 14:00:00', 'BMPBBEBB', 'BE8888', NULL, NULL, NULL, NULL, 'KREDBEBB', 'BE4444', NULL, NULL),
	('6:INGBBEBB:UkVGMDA2', 75.00, NULL, '2026-04-28 15:00:00', 'INGBBEBB', 'BE9999', NULL, NULL, NULL, NULL, 'BMPBBEBB', 'BE6666', NULL, NULL),
	('7:BMPBBEBB:V0VCMDA3', 5.00, NULL, '2026-04-29 08:00:00', 'BMPBBEBB', 'BE4444', NULL, NULL, NULL, NULL, 'KREDBEBB', 'BE8888', NULL, NULL),
	('8:BNPABEBB:QklMTDA4', 200.00, NULL, '2026-04-29 10:00:00', 'BNPABEBB', 'BE6666', NULL, NULL, NULL, NULL, 'BMPBBEBB', 'BE9999', NULL, NULL),
	('9:BMPBBEBB:R0lGVDA5', 30.00, NULL, '2026-04-29 11:00:00', 'BMPBBEBB', 'BE7777', NULL, NULL, NULL, NULL, 'BNPABEBB', 'BE1111', NULL, NULL);

-- Structuur van  tabel bank13_db.po_out wordt geschreven
CREATE TABLE IF NOT EXISTS `po_out` (
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

-- Dumpen data van tabel bank13_db.po_out: ~10 rows (ongeveer)
INSERT INTO `po_out` (`po_id`, `po_amount`, `po_message`, `po_datetime`, `ob_id`, `oa_id`, `ob_code`, `ob_datetime`, `cb_code`, `cb_datetime`, `bb_id`, `ba_id`, `bb_code`, `bb_datetime`) VALUES
	('10:BMPBBEBB:T05FMTA=', 15.00, NULL, '2026-04-29 12:00:00', 'BMPBBEBB', 'BE0000', 'SIG-10', '2026-04-29 12:01:00', NULL, NULL, 'KREDBEBB', 'BE2222', NULL, NULL),
	('11:BMPBBEBB:WkhFMTE=', 45.00, NULL, '2026-04-30 09:00:00', 'BMPBBEBB', 'BE1111', 'SIG-11', '2026-04-30 09:01:00', NULL, NULL, 'INGBBEBB', 'BE2222', NULL, NULL),
	('12:BMPBBEBB:V0VMMTI=', 12.00, NULL, '2026-04-30 10:00:00', 'BMPBBEBB', 'BE2222', 'SIG-12', '2026-04-30 10:01:00', NULL, NULL, 'KREDBEBB', 'BE3333', NULL, NULL),
	('13:BMPBBEBB:VEhSRTM=', 150.00, NULL, '2026-04-30 11:00:00', 'BMPBBEBB', 'BE3333', 'SIG-13', '2026-04-30 11:01:00', NULL, NULL, 'BNPABEBB', 'BE1111', NULL, NULL),
	('14:BMPBBEBB:Rk9VMTQ=', 60.00, NULL, '2026-04-30 12:00:00', 'BMPBBEBB', 'BE4444', 'SIG-14', '2026-04-30 12:01:00', NULL, NULL, 'INGBBEBB', 'BE5555', NULL, NULL),
	('1:BMPBBEBB:U0VUQTAx', 100.00, NULL, '2026-04-27 10:00:00', 'BMPBBEBB', 'BE1111', 'SIG-1', '2026-04-27 10:01:00', NULL, NULL, 'INGBBEBB', 'BE2222', NULL, NULL),
	('3:BMPBBEBB:UEFZTTAz', 250.00, NULL, '2026-04-27 12:00:00', 'BMPBBEBB', 'BE1111', 'SIG-3', '2026-04-27 12:01:00', NULL, NULL, 'BNPABEBB', 'BE2222', NULL, NULL),
	('5:BMPBBEBB:U0FMMDU=', 500.00, NULL, '2026-04-28 14:00:00', 'BMPBBEBB', 'BE8888', 'SIG-5', '2026-04-28 14:01:00', NULL, NULL, 'KREDBEBB', 'BE4444', NULL, NULL),
	('7:BMPBBEBB:V0VCMDA3', 5.00, NULL, '2026-04-29 08:00:00', 'BMPBBEBB', 'BE4444', 'SIG-7', '2026-04-29 08:01:00', NULL, NULL, 'KREDBEBB', 'BE8888', NULL, NULL),
	('9:BMPBBEBB:R0lGVDA5', 30.00, NULL, '2026-04-29 11:00:00', 'BMPBBEBB', 'BE7777', 'SIG-9', '2026-04-29 11:01:00', NULL, NULL, 'BNPABEBB', 'BE1111', NULL, NULL);

-- Structuur van  tabel bank13_db.transactions wordt geschreven
CREATE TABLE IF NOT EXISTS `transactions` (
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

-- Dumpen data van tabel bank13_db.transactions: ~10 rows (ongeveer)
INSERT INTO `transactions` (`id`, `amount`, `datetime`, `po_id`, `account_id`, `isvalid`, `iscomplete`) VALUES
	('tx_001', -100.00, '2026-04-27 10:00:00', '1:BMPBBEBB:U0VUQTAx', 'BE11111111111111', 1, 1),
	('tx_002', 100.00, '2026-04-27 10:05:00', '1:BMPBBEBB:U0VUQTAx', 'BE22222222222222', 1, 1),
	('tx_003', -50.00, '2026-04-27 11:00:00', '2:KREDBEBB:UkVDRVBUMg==', 'BE33333333333333', 1, 1),
	('tx_004', 250.00, '2026-04-27 12:00:00', '3:BMPBBEBB:UEFZTTAz', 'BE11111111111111', 1, 1),
	('tx_005', -25.00, '2026-04-28 09:00:00', '4:BMPBBEBB:Rk9PMEQ0', 'BE55555555555555', 1, 1),
	('tx_006', -500.00, '2026-04-28 14:00:00', '5:BMPBBEBB:U0FMMDU=', 'BE88888888888888', 1, 0),
	('tx_007', 75.00, '2026-04-28 15:00:00', '6:INGBBEBB:UkVGMDA2', 'BE99999999999999', 1, 1),
	('tx_008', -5.00, '2026-04-29 08:00:00', '7:BMPBBEBB:V0VCMDA3', 'BE44444444444444', 1, 1),
	('tx_009', 200.00, '2026-04-29 10:00:00', '8:BNPABEBB:QklMTDA4', 'BE66666666666666', 1, 1),
	('tx_010', -30.00, '2026-04-29 11:00:00', '9:BMPBBEBB:R0lGVDA5', 'BE77777777777777', 1, 0);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
