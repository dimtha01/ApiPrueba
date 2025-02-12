-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 11, 2025 at 01:22 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `proyecto_valesco`
--

-- --------------------------------------------------------

--
-- Table structure for table `avance_financiero`
--

CREATE TABLE `avance_financiero` (
  `id` int NOT NULL,
  `id_proyecto` int DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `numero_valuacion` varchar(50) DEFAULT NULL,
  `monto_usd` decimal(15,2) DEFAULT NULL,
  `numero_factura` varchar(50) DEFAULT NULL,
  `ofertado` decimal(15,2) DEFAULT NULL,
  `costo_planificado` decimal(15,2) DEFAULT NULL,
  `id_estatus_proceso` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `avance_financiero`
--

INSERT INTO `avance_financiero` (`id`, `id_proyecto`, `fecha`, `numero_valuacion`, `monto_usd`, `numero_factura`, `ofertado`, `costo_planificado`, `id_estatus_proceso`) VALUES
(1, 1, '2024-02-10', '00001', 1000.00, 'F-12345', 1200.00, 1100.00, 1),
(2, 2, '2024-02-12', '00002', 1500.00, 'F-67890', 1700.00, 1600.00, 2);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `avance_financiero`
--
ALTER TABLE `avance_financiero`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_proyecto` (`id_proyecto`),
  ADD KEY `id_estatus_proceso` (`id_estatus_proceso`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `avance_financiero`
--
ALTER TABLE `avance_financiero`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `avance_financiero`
--
ALTER TABLE `avance_financiero`
  ADD CONSTRAINT `avance_financiero_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `avance_financiero_ibfk_2` FOREIGN KEY (`id_estatus_proceso`) REFERENCES `estatus_proceso` (`id_estatus`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
