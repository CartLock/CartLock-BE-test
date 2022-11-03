-- MySQL dump 10.13  Distrib 8.0.31, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: lockcart
-- ------------------------------------------------------
-- Server version	8.0.31

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `setting_company`
--

DROP TABLE IF EXISTS `setting_company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `setting_company` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int DEFAULT NULL,
  `is_multi_phone_login` enum('0','1') DEFAULT '0' COMMENT '0-NO, 1-YES',
  `offline_reconect` varchar(255) DEFAULT NULL,
  `schedule_opens` text,
  `schedule_exceptions` text,
  `default_time_zone` varchar(255) DEFAULT NULL,
  `ekey_duration` varchar(255) DEFAULT NULL,
  `default_country_code` varchar(255) DEFAULT NULL,
  `fob_programmers` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `is_force_firmware_update` enum('0','1') DEFAULT '0',
  `allowed_firmware` text,
  `payment_cost` double DEFAULT NULL,
  `currency` varchar(45) DEFAULT NULL,
  `waiting_hour` time DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `setting_company_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `setting_company`
--

LOCK TABLES `setting_company` WRITE;
/*!40000 ALTER TABLE `setting_company` DISABLE KEYS */;
INSERT INTO `setting_company` VALUES (29,6,'0',NULL,'[{\"scheduleDay\":\"Monday\",\"openWholeDay\":false,\"openTime\":\"\",\"closeTime\":\"\"},{\"scheduleDay\":\"Tuesday\",\"openWholeDay\":false,\"openTime\":\"\",\"closeTime\":\"\"},{\"scheduleDay\":\"Wednesday\",\"openWholeDay\":false,\"openTime\":\"\",\"closeTime\":\"\"},{\"scheduleDay\":\"Thursday\",\"openWholeDay\":false,\"openTime\":\"\",\"closeTime\":\"\"},{\"scheduleDay\":\"Friday\",\"openWholeDay\":false,\"openTime\":\"\",\"closeTime\":\"\"},{\"scheduleDay\":\"Saturday\",\"openWholeDay\":false,\"openTime\":\"\",\"closeTime\":\"\"},{\"scheduleDay\":\"Sunday\",\"openWholeDay\":false,\"openTime\":\"\",\"closeTime\":\"\"}]','[{\"exceptionDate\":\"2022-09-04\",\"openWholeDay\":false,\"openTime\":\"\",\"closeTime\":\"\"}]','{}',NULL,NULL,NULL,'2022-09-04 14:39:48','2022-09-13 03:12:09','0',NULL,89.98,'EUR','00:05:00');
/*!40000 ALTER TABLE `setting_company` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-10-20 16:50:06
