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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `dispay_name` varchar(255) NOT NULL,
  `e_mail` varchar(255) NOT NULL,
  `phone_number` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `user_notes` text,
  `is_sentinel` enum('0','1') DEFAULT '0' COMMENT '0-NO, 1-YES',
  `is_installer` enum('0','1') DEFAULT '0' COMMENT '0-NO, 1-YES',
  `is_fob` enum('0','1') DEFAULT '0' COMMENT '0-NO, 1-YES',
  `is_inactive` enum('0','1') DEFAULT '0' COMMENT '0-NO, 1-YES',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `language` varchar(255) DEFAULT 'en',
  `unique_code` varchar(45) DEFAULT NULL,
  `token` text,
  `is_supervisor` enum('0','1') DEFAULT '0',
  `is_housekeeping` enum('0','1') DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_36` FOREIGN KEY (`company_id`) REFERENCES `company` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `users_ibfk_37` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=152 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (132,6,1,'Falgun ','Tanwar','Falgun Tanwar','falguntanwar@virtualemployee.com','25643444444444','1234','','0','0','0','0','2022-09-12 04:46:40','2022-09-12 06:08:46','en','DBA8IZQC21',NULL,'0','0'),(133,6,1,'Saurav ','Satpathy','Saurav Satpathy','saurav.satpathy98@gmail.com','7008679497','1234','','0','0','0','0','2022-09-12 06:48:46','2022-09-29 07:11:01','en','EX3ST3J1KF',NULL,'0','1'),(150,27,4,'LockCart','Admin','Lockcart Adminstartion','admin@gmail.com','1234','1234',NULL,'0','0','0','0','2022-09-28 10:19:01','2022-10-14 09:53:33','en','58CU2KTCAM',NULL,'0','0'),(151,6,1,'Jonas','Bonder','Jonas Bonder','jb@bonder.dk','1455421','1234',NULL,'0','0','0','0','2022-09-28 10:19:01','2022-10-14 09:53:33','en','58CU2KTCAM',NULL,'1','0');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-10-20 16:50:07
