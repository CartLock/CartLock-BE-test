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
-- Table structure for table `service_ticket`
--

DROP TABLE IF EXISTS `service_ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_ticket` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `ticket_number` varchar(255) DEFAULT NULL,
  `phone_model` varchar(255) DEFAULT NULL,
  `active_lock` text,
  `reporting_date_time` datetime DEFAULT NULL,
  `sentinel_date_time` datetime DEFAULT NULL,
  `bluetooth_status` varchar(255) DEFAULT NULL,
  `ekey` varchar(255) DEFAULT NULL,
  `phone_gps` varchar(255) DEFAULT NULL,
  `problem_description` varchar(255) DEFAULT NULL,
  `ticket_status` enum('0','1') DEFAULT '1' COMMENT '0-CLOSED, 1-OPEN',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `software_version` varchar(255) DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `service_ticket_ibfk_2_idx` (`customer_id`),
  CONSTRAINT `service_ticket_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `service_ticket_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_ticket`
--

LOCK TABLES `service_ticket` WRITE;
/*!40000 ALTER TABLE `service_ticket` DISABLE KEYS */;
INSERT INTO `service_ticket` VALUES (19,NULL,'Lock1001',NULL,NULL,'2022-08-16 00:00:00',NULL,NULL,NULL,'Odisha','6$ need to debitgahdhewscehwsbcwehqbcjhwebcjhwbcjhwjkhjkiwiwaeWA','1','2022-08-25 10:58:05','2022-09-28 09:57:48','7008679497',NULL,'dummy',4);
/*!40000 ALTER TABLE `service_ticket` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-10-20 16:50:04
