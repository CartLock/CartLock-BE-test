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
-- Table structure for table `company`
--

DROP TABLE IF EXISTS `company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` varchar(255) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `company_address` varchar(255) DEFAULT NULL,
  `company_street` varchar(255) DEFAULT NULL,
  `company_country` varchar(255) DEFAULT NULL,
  `company_zip` varchar(255) DEFAULT NULL,
  `company_e_mail` varchar(255) DEFAULT NULL,
  `poc_first_name` varchar(255) DEFAULT NULL,
  `poc_last_name` varchar(255) DEFAULT NULL,
  `poc_e_mail` varchar(255) DEFAULT NULL,
  `poc_phone_number` varchar(255) DEFAULT NULL,
  `is_deactive` enum('0','1') DEFAULT '0' COMMENT '0-NO, 1-YES',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `company_code` varchar(45) DEFAULT NULL,
  `location` varchar(45) DEFAULT NULL,
  `registratation_date` date DEFAULT NULL,
  `timezone` varchar(45) DEFAULT NULL,
  `payment_cost` double DEFAULT NULL,
  `waiting_hour` time DEFAULT NULL,
  `acc_no` varchar(45) DEFAULT NULL,
  `payment_gateway` varchar(45) DEFAULT NULL,
  `currency` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company`
--

LOCK TABLES `company` WRITE;
/*!40000 ALTER TABLE `company` DISABLE KEYS */;
INSERT INTO `company` VALUES (6,'1001','virtual employee','','','','','company@gmail.com','veeren','kumar','veer@gmail.com','0987654321','0','2021-04-06 14:17:34','2022-09-12 05:12:21','VE1001','Hyderabad',NULL,'UST',120,'10:44:00','10005','RazorPay',NULL),(27,'0000','LockCart',NULL,NULL,NULL,NULL,'goodlock@test.com',NULL,NULL,NULL,'7008679497','1','2022-08-02 04:57:45','2022-10-14 09:54:46','LockCart1001','NewYork','2022-08-02','UST',12,'10:27:00','12345678','Paypal',NULL);
/*!40000 ALTER TABLE `company` ENABLE KEYS */;
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
