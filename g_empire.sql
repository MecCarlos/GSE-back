-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 17, 2025 at 05:57 AM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `g_empire`
--

-- --------------------------------------------------------

--
-- Table structure for table `commandes`
--

DROP TABLE IF EXISTS `commandes`;
CREATE TABLE IF NOT EXISTS `commandes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `adresseLivraison` json NOT NULL,
  `paiement` enum('paypal','espece','carte') COLLATE utf8mb3_unicode_ci NOT NULL,
  `cardData` json DEFAULT NULL,
  `items` json NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `etat` enum('en_attente','validée','en_livraison','livrée','annulée') COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT 'en_attente',
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `commandes`
--

INSERT INTO `commandes` (`id`, `userId`, `adresseLivraison`, `paiement`, `cardData`, `items`, `total`, `createdAt`, `updatedAt`, `etat`) VALUES
(1, 1, '{\"ville\": \"Cotonou\", \"adresse\": \"figjrossè centre\", \"codePostal\": \"fzrer\"}', 'espece', NULL, '[{\"nom\": \"Web cam 3FRF\", \"prix\": 4000, \"options\": {\"Connexion\": \"USB-C\", \"Résolution\": \"1080p\"}, \"quantite\": 1, \"productId\": 3}]', 4000.00, '2025-09-21 14:34:28', '2025-10-02 10:54:53', 'livrée'),
(2, 1, '{\"ville\": \"Cotonou\", \"adresse\": \"figjrossè centre\", \"codePostal\": \"czd\"}', 'espece', NULL, '[{\"nom\": \"Web cam 3FRF\", \"prix\": 4000, \"options\": {\"Connexion\": \"USB-C\", \"Résolution\": \"1080p\"}, \"quantite\": 1, \"productId\": 3}]', 4000.00, '2025-09-21 14:38:53', '2025-10-02 10:55:04', 'annulée'),
(3, 1, '{\"ville\": \"Cotonou\", \"adresse\": \"figjrossè centre\", \"codePostal\": \"ddd\"}', 'paypal', NULL, '[{\"nom\": \"Samsung A15\", \"prix\": 63998, \"options\": {\"Model\": \"Standard\", \"Couleur\": \"Rose\", \"Stockage\": \"128 Go\"}, \"quantite\": 1, \"productId\": 5}]', 63998.00, '2025-09-21 14:42:44', '2025-10-02 10:14:47', 'livrée'),
(4, 1, '{\"ville\": \"Cotonou\", \"adresse\": \"figjrossè centre\", \"codePostal\": \"frdd\"}', 'espece', NULL, '[{\"nom\": \"Samsung A15\", \"prix\": 63998, \"options\": {\"Model\": \"Standard\", \"Couleur\": \"Rose\", \"Stockage\": \"128 Go\"}, \"quantite\": 1, \"productId\": 5}, {\"nom\": \"Panneau solaire\", \"prix\": 25000, \"options\": {\"Type\": \"Monocristallin\", \"Tension\": \"24V\", \"Capacité\": \"100 Ah\", \"Puissance\": \"50W\", \"Dimensions\": \"150x75 cm\"}, \"quantite\": 3, \"productId\": 6}]', 138998.00, '2025-09-21 14:45:59', '2025-10-02 10:55:01', 'livrée'),
(5, 1, '{\"ville\": \"Cotonou\", \"adresse\": \"figjrossè centre\", \"codePostal\": \"DO765\"}', 'paypal', NULL, '[{\"nom\": \"Panneau solaire\", \"prix\": 25000, \"options\": {\"Type\": \"Monocristallin\", \"Tension\": \"24V\", \"Capacité\": \"100 Ah\", \"Puissance\": \"50W\", \"Dimensions\": \"150x75 cm\"}, \"quantite\": 1, \"productId\": 6}]', 25000.00, '2025-09-25 09:01:56', '2025-10-02 10:14:55', 'annulée'),
(6, 1, '{\"ville\": \"Cotonou\", \"adresse\": \"figjrossè centre\", \"codePostal\": \"SD43\"}', 'espece', NULL, '[{\"nom\": \"Iphone 17\", \"prix\": 65000, \"options\": {\"Model\": \"Air\", \"Couleur\": \"Noir\", \"Stockage\": \"256 Go\"}, \"quantite\": 6, \"productId\": 2}]', 390000.00, '2025-10-01 14:29:52', '2025-10-02 10:15:05', 'en_livraison'),
(7, 2, '{\"ville\": \"Cotonou\", \"adresse\": \"figjrossè centre\", \"codePostal\": \"LC007\"}', 'espece', NULL, '[{\"nom\": \"Lampe veilleuse\", \"prix\": 4000, \"options\": {\"Type\": \"Ampoule\", \"Couleur\": \"Blanc\", \"Tension\": \"220V\", \"Puissance\": \"50W\"}, \"quantite\": 1, \"productId\": 4}, {\"nom\": \"Samsung A15\", \"prix\": 63998, \"options\": {\"Model\": \"Standard\", \"Couleur\": \"Rose\", \"Stockage\": \"128 Go\"}, \"quantite\": 1, \"productId\": 5}]', 67998.00, '2025-10-02 11:23:18', '2025-10-02 11:23:18', 'en_attente'),
(8, 2, '{\"ville\": \"Cotonou\", \"adresse\": \"figjrossè centre\", \"codePostal\": \"LC007\"}', 'paypal', NULL, '[{\"nom\": \"Iphone 17\", \"prix\": 65000, \"options\": {\"Model\": \"Air\", \"Couleur\": \"Noir\", \"Stockage\": \"256 Go\"}, \"quantite\": 1, \"productId\": 2}]', 65000.00, '2025-10-02 11:29:43', '2025-10-02 11:29:43', 'en_attente');

-- --------------------------------------------------------

--
-- Table structure for table `produits`
--

DROP TABLE IF EXISTS `produits`;
CREATE TABLE IF NOT EXISTS `produits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(200) COLLATE utf8mb3_unicode_ci NOT NULL,
  `categorie` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb3_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `produits`
--

INSERT INTO `produits` (`id`, `nom`, `categorie`, `description`, `created_at`) VALUES
(1, 'Router 3XGE', 'Routeur', 'zedr', '2025-09-20 09:28:42'),
(2, 'Iphone 17', 'Telephone', 'apple', '2025-09-20 09:29:38'),
(3, 'Web cam 3FRF', 'Webcam', 'daqd', '2025-09-20 10:57:11'),
(4, 'Lampe veilleuse', 'Lampe', 'lampe', '2025-09-20 10:58:24'),
(5, 'Samsung A15', 'Telephone', 'phone', '2025-09-20 11:00:11'),
(6, 'Panneau solaire', 'Panneau_solaire', 'panel', '2025-09-20 11:02:10'),
(7, 'Souris', 'souris', 'mousse', '2025-09-20 11:03:10'),
(8, 'Fibre optique', 'cable', 'cable', '2025-09-20 11:04:50'),
(9, 'Webcam GF4S', 'Webcam', 'web cam', '2025-10-04 15:30:54'),
(10, 'Disque dur', 'Disque_dur', 'ssd', '2025-10-04 15:36:04'),
(11, 'routeur F3UJD', 'Routeur', 'roureur', '2025-10-04 15:37:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `statue` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `statue`, `created_at`) VALUES
(1, 'lana ley', 'lana@gmail.com', '$2b$10$0SDOKXNretGdkMfTQfXGMO02t/rDVEVKYb979VaimNoo1pXpTa.1K', 1, '2025-09-20 09:26:49'),
(2, 'Carlos Leboney', 'leboney@gmail.com', '$2b$10$zJRk8J83Vj26O2it0L7.2ewuVIlGqO4BoUASj/M/vccHQmvBAgbj2', 1, '2025-10-02 11:21:41');

-- --------------------------------------------------------

--
-- Table structure for table `variantes`
--

DROP TABLE IF EXISTS `variantes`;
CREATE TABLE IF NOT EXISTS `variantes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `produit_id` int NOT NULL,
  `options` json DEFAULT NULL,
  `quantite` int DEFAULT '0',
  `prix` decimal(10,2) NOT NULL,
  `prix_promo` decimal(10,2) DEFAULT NULL,
  `image_principale` varchar(255) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `image_1` varchar(255) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `image_2` varchar(255) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `produit_id` (`produit_id`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `variantes`
--

INSERT INTO `variantes` (`id`, `produit_id`, `options`, `quantite`, `prix`, `prix_promo`, `image_principale`, `image_1`, `image_2`, `created_at`) VALUES
(1, 1, '{\"Type\": \"ADSL\", \"Vitesse\": \"1 Gbps\"}', 10, 123000.00, 34000.00, '1758360522430.jpg', NULL, NULL, '2025-09-20 09:28:42'),
(2, 2, '{\"Model\": \"Air\", \"Couleur\": \"Noir\", \"Stockage\": \"256 Go\"}', 6, 654000.00, 65000.00, '1758360578046.webp', NULL, NULL, '2025-09-20 09:29:38'),
(3, 3, '{\"Connexion\": \"USB-C\", \"Résolution\": \"1080p\"}', 12, 12000.00, 4000.00, '1758365830651.jpg', NULL, NULL, '2025-09-20 10:57:11'),
(4, 4, '{\"Type\": \"Ampoule\", \"Couleur\": \"Blanc\", \"Tension\": \"220V\", \"Puissance\": \"50W\"}', 10, 4000.00, 4000.00, '1758365904362.jpeg', NULL, NULL, '2025-09-20 10:58:24'),
(5, 5, '{\"Model\": \"Standard\", \"Couleur\": \"Rose\", \"Stockage\": \"128 Go\"}', 11, 120000.00, 63998.00, '1758366011241.webp', NULL, NULL, '2025-09-20 11:00:11'),
(6, 6, '{\"Type\": \"Monocristallin\", \"Tension\": \"24V\", \"Capacité\": \"100 Ah\", \"Puissance\": \"50W\", \"Dimensions\": \"150x75 cm\"}', 20, 346000.00, 25000.00, '1758366129973.jpg', NULL, NULL, '2025-09-20 11:02:10'),
(7, 6, '{\"Type\": \"Polycristallin\", \"Tension\": \"48V\", \"Capacité\": \"100 Ah\", \"Puissance\": \"100W\", \"Dimensions\": \"150x75 cm\"}', 10, 70000.00, 50000.00, '1758366129996.jpg', NULL, NULL, '2025-09-20 11:02:10'),
(8, 7, '{\"Type\": \"Optique\", \"Connectique\": \"USB\"}', 8, 5000.00, 4000.00, '1758366190803.jpg', NULL, NULL, '2025-09-20 11:03:10'),
(9, 8, '{\"section\": \"10mm\", \"Longueur\": \"30 m\", \"Connectivité\": \"Fiber\"}', 5, 45000.00, 39997.00, '1758366290256.webp', '1758366290258.jpg', NULL, '2025-09-20 11:04:50'),
(10, 9, '{\"Connexion\": \"USB-C\", \"Résolution\": \"4K\"}', 4, 4000.00, 4000.00, '1759591854892.png', NULL, NULL, '2025-10-04 15:30:54'),
(11, 10, '{\"Type\": \"SSD SATA\", \"Stockage\": \"1 To\", \"Connectique\": \"NVMe\"}', 2, 30000.00, 23000.00, '1759592164530.jpg', NULL, NULL, '2025-10-04 15:36:04'),
(12, 11, '{\"Type\": \"Fiber\", \"Vitesse\": \"300 Mbps\"}', 3, 210933.00, 213999.00, '1759592220307.png', NULL, NULL, '2025-10-04 15:37:00');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
