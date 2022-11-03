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
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int DEFAULT NULL,
  `permission_add` tinyint(1) DEFAULT '0' COMMENT '0-No, 1-Yes',
  `permission_modifly` tinyint(1) DEFAULT '0' COMMENT '0-No, 1-Yes',
  `permission_delete` tinyint(1) DEFAULT '0' COMMENT '0-No, 1-Yes',
  `permission_module` text,
  `permission_all` tinyint(1) DEFAULT '0' COMMENT '0-No, 1-Yes',
  `permission_title` varchar(255) DEFAULT NULL,
  `permission_description` text,
  `permission_view` tinyint(1) DEFAULT '0' COMMENT '0-No, 1-Yes',
  PRIMARY KEY (`id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (2,4,0,0,0,'{\"users\":false,\"devices\":false,\"device_group\":false,\"activity\":false,\"support\":false,\"company_settings\":true,\"change_password\":true,\"company\":true, \"role\":false}',0,NULL,NULL,0),(3,3,1,1,1,'{\"users\":true,\"devices\":true,\"device_group\":true,\"activity\":true,\"support\":true,\"company_settings\":true,\"change_password\":true,\"company\":false,\"role\":false}',0,NULL,NULL,1),(9,2,1,1,1,'{\"users\":true,\"devices\":true,\"device_group\":true,\"activity\":true,\"support\":true,\"company_settings\":false,\"change_password\":true,\"company\":false,\"role\":true}',0,'','',1),(36,1,1,1,1,'{\"users\":true,\"devices\":true,\"device_group\":true,\"activity\":true,\"support\":true,\"company_settings\":true,\"change_password\":true,\"company\":true,\"role\":false}',0,'','',1);
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
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
