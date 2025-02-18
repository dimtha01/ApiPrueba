-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 18, 2025 at 04:57 PM
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
(15, 25, '2025-02-17', '0001', 100.00, NULL, NULL, NULL, 5),
(16, 25, '2025-02-17', '0002', 100.00, NULL, NULL, NULL, 5),
(17, 25, '2025-02-17', '0003', 100.00, NULL, NULL, NULL, 4),
(18, 26, '2025-02-17', '0001', 100.00, 'f-1233', NULL, NULL, 6),
(19, 26, '2025-02-17', '0002', 100.00, NULL, NULL, NULL, 5),
(20, 26, '2025-02-17', '0003', 100.00, 'f-1233', NULL, NULL, 6),
(21, 27, '2025-02-17', '0001', 1000.00, NULL, NULL, NULL, 4),
(22, 25, '2025-02-17', '0006', 100.02, NULL, NULL, NULL, 4),
(23, 25, '2025-02-17', '0010', 100.00, 'f-1233', NULL, NULL, 6),
(24, 26, '2025-02-17', '0004', 100.00, NULL, NULL, NULL, 4),
(25, 28, '2025-02-18', '0001', 1000.00, NULL, NULL, NULL, 4);

-- --------------------------------------------------------

--
-- Table structure for table `avance_fisico`
--

CREATE TABLE `avance_fisico` (
  `id` int NOT NULL,
  `id_proyecto` int DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `avance_real` varchar(255) DEFAULT NULL,
  `avance_planificado` varchar(255) DEFAULT NULL,
  `puntos_atencion` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `avance_fisico`
--

INSERT INTO `avance_fisico` (`id`, `id_proyecto`, `fecha`, `avance_real`, `avance_planificado`, `puntos_atencion`) VALUES
(36, 25, '2025-02-17', '10', '20', 'ninguno'),
(37, 25, '2025-02-17', '11', '20', 'ninguno'),
(38, 26, '2025-02-18', '10', '20', 'ninguno'),
(39, 28, '2025-02-18', '10', '20', 'ninguno'),
(40, 28, '2025-02-18', '20', '30', 'ninguno');

-- --------------------------------------------------------

--
-- Table structure for table `clientes`
--

CREATE TABLE `clientes` (
  `id` int NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` text,
  `unidad_negocio` varchar(255) DEFAULT NULL,
  `razon_social` varchar(255) NOT NULL,
  `nombre_comercial` varchar(255) DEFAULT NULL,
  `direccion_fiscal` text,
  `pais` varchar(100) DEFAULT NULL,
  `id_region` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `clientes`
--

INSERT INTO `clientes` (`id`, `nombre`, `email`, `telefono`, `direccion`, `unidad_negocio`, `razon_social`, `nombre_comercial`, `direccion_fiscal`, `pais`, `id_region`) VALUES
(4, 'Cliente Ejemplo', 'cliente@example.com', '1234567890', 'Calle Secundaria, Zona', 'Unidad 1', 'Ejemplo SA', 'Ejemplo Comercial', 'Av. Principal, Ciudad', 'Venezuela', 1),
(7, 'RICHARSON', 'admin@example.com', '00000000', 'algo', 'unidad 2', 'cliente', 'cliente', 'cliente', 'venezuela', 2),
(8, 'RICHARSON2', 'admin@example.com', '00000000', 'algo', 'unidad 2', 'cliente', 'cliente', 'cliente', 'venezuela', 1);

-- --------------------------------------------------------

--
-- Table structure for table `costos_proyectos`
--

CREATE TABLE `costos_proyectos` (
  `id` int NOT NULL,
  `id_proyecto` int NOT NULL,
  `fecha` date NOT NULL,
  `costo` decimal(10,2) NOT NULL,
  `monto_sobrepasado` decimal(10,2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `costos_proyectos`
--

INSERT INTO `costos_proyectos` (`id`, `id_proyecto`, `fecha`, `costo`, `monto_sobrepasado`) VALUES
(3, 26, '2025-02-18', 100.00, 0.00),
(4, 26, '2025-02-18', 900.00, 0.00),
(5, 26, '2025-02-18', 100.00, 100.00),
(6, 26, '2025-02-18', 500.00, 600.00),
(7, 26, '2025-02-18', 100.00, 700.00),
(8, 26, '2025-02-18', 50.00, 750.00),
(9, 25, '2025-02-18', 100.00, 0.00),
(10, 25, '2025-02-18', 1000.00, 100.00);

-- --------------------------------------------------------

--
-- Table structure for table `estatus_proceso`
--

CREATE TABLE `estatus_proceso` (
  `id_estatus` int NOT NULL,
  `nombre_estatus` varchar(50) NOT NULL,
  `descripcion` text,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `estatus_proceso`
--

INSERT INTO `estatus_proceso` (`id_estatus`, `nombre_estatus`, `descripcion`, `fecha_creacion`, `activo`) VALUES
(1, 'En Elaboración de Valuación', 'El proceso está en la fase inicial de elaboración.', '2025-02-10 16:55:47', 1),
(2, 'En Revisión por el Cliente', 'El cliente está revisando la valuación.', '2025-02-10 16:55:47', 1),
(3, 'Valuación Aprobada', 'La valuación ha sido aprobada por el cliente.', '2025-02-10 16:55:47', 1),
(4, 'Por Valuar', 'aluar implica evaluar el valor de un bien o activo de manera objetiva y precisa, utilizando métodos y técnicas específicas según el contexto', '2025-02-11 18:11:48', 1),
(5, 'Por Facturar', 'El proceso está listo para ser facturado.', '2025-02-10 16:55:47', 1),
(6, 'Facturado', 'El proceso ha sido facturado completamente.', '2025-02-10 16:55:47', 1);

-- --------------------------------------------------------

--
-- Table structure for table `proyectos`
--

CREATE TABLE `proyectos` (
  `id` int NOT NULL,
  `numero` varchar(50) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `id_cliente` int DEFAULT NULL,
  `id_responsable` int DEFAULT NULL,
  `id_region` int DEFAULT NULL,
  `id_contrato` varchar(100) DEFAULT NULL,
  `costo_estimado` decimal(15,2) DEFAULT NULL,
  `monto_ofertado` decimal(15,2) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_final` date DEFAULT NULL,
  `duracion` int DEFAULT NULL,
  `id_estatus` int NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `proyectos`
--

INSERT INTO `proyectos` (`id`, `numero`, `nombre`, `id_cliente`, `id_responsable`, `id_region`, `id_contrato`, `costo_estimado`, `monto_ofertado`, `fecha_inicio`, `fecha_final`, `duracion`, `id_estatus`) VALUES
(25, '0001', 'Proyecto de web', 4, 2, 1, NULL, 1000.00, 1000.00, '2025-02-18', '2025-02-25', 7, 1),
(26, '0002', 'Proyecto de Web 2', 4, 2, 2, NULL, 1000.00, 1000.00, '2025-02-18', '2025-02-25', 7, 1),
(27, '0003', 'Proyecto de Web 3', 4, 2, 3, NULL, 1000.00, 1000.00, '2025-02-26', '2025-03-07', 9, 1),
(28, 'PROY-0021', 'Proyecto de Web 4', 4, 2, 1, NULL, 1000.00, 12000.00, '2025-02-26', '2025-03-05', 7, 1),
(29, 'PROY-0026', 'Proyecto de web 5', 4, 2, 2, NULL, 12000.00, 10000.00, '2025-02-27', '2025-03-07', 8, 1),
(30, 'PROY-0024', 'Proyecto de Web 6', 4, 2, 2, NULL, 12000.00, 1000.00, '2025-02-25', '2025-03-07', 10, 1),
(31, 'PROY-0027', 'Proyecto de web 7', 4, 2, 3, NULL, 3000.00, 2500.00, '2025-02-24', '2025-03-07', 11, 1);

-- --------------------------------------------------------

--
-- Table structure for table `regiones`
--

CREATE TABLE `regiones` (
  `id` int NOT NULL,
  `nombre` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `regiones`
--

INSERT INTO `regiones` (`id`, `nombre`) VALUES
(1, 'Centro'),
(2, 'Occidente'),
(3, 'Oriente');

-- --------------------------------------------------------

--
-- Table structure for table `responsables`
--

CREATE TABLE `responsables` (
  `id` int NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `cargo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `responsables`
--

INSERT INTO `responsables` (`id`, `nombre`, `cargo`) VALUES
(1, 'Juan Pérez', 'Administrador'),
(2, 'María González', 'Planificador'),
(3, 'Carlos López', 'Planificador');

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
-- Indexes for table `avance_fisico`
--
ALTER TABLE `avance_fisico`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_proyecto` (`id_proyecto`);

--
-- Indexes for table `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_clientes_region` (`id_region`);

--
-- Indexes for table `costos_proyectos`
--
ALTER TABLE `costos_proyectos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_proyecto` (`id_proyecto`);

--
-- Indexes for table `estatus_proceso`
--
ALTER TABLE `estatus_proceso`
  ADD PRIMARY KEY (`id_estatus`);

--
-- Indexes for table `proyectos`
--
ALTER TABLE `proyectos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero` (`numero`),
  ADD UNIQUE KEY `id_contrato` (`id_contrato`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_responsable` (`id_responsable`),
  ADD KEY `id_region` (`id_region`);

--
-- Indexes for table `regiones`
--
ALTER TABLE `regiones`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `responsables`
--
ALTER TABLE `responsables`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `avance_financiero`
--
ALTER TABLE `avance_financiero`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `avance_fisico`
--
ALTER TABLE `avance_fisico`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `costos_proyectos`
--
ALTER TABLE `costos_proyectos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `estatus_proceso`
--
ALTER TABLE `estatus_proceso`
  MODIFY `id_estatus` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `proyectos`
--
ALTER TABLE `proyectos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `regiones`
--
ALTER TABLE `regiones`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `responsables`
--
ALTER TABLE `responsables`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `avance_financiero`
--
ALTER TABLE `avance_financiero`
  ADD CONSTRAINT `avance_financiero_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `avance_financiero_ibfk_2` FOREIGN KEY (`id_estatus_proceso`) REFERENCES `estatus_proceso` (`id_estatus`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `avance_fisico`
--
ALTER TABLE `avance_fisico`
  ADD CONSTRAINT `avance_fisico_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `fk_clientes_region` FOREIGN KEY (`id_region`) REFERENCES `regiones` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `costos_proyectos`
--
ALTER TABLE `costos_proyectos`
  ADD CONSTRAINT `costos_proyectos_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `proyectos`
--
ALTER TABLE `proyectos`
  ADD CONSTRAINT `proyectos_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id`),
  ADD CONSTRAINT `proyectos_ibfk_2` FOREIGN KEY (`id_responsable`) REFERENCES `responsables` (`id`),
  ADD CONSTRAINT `proyectos_ibfk_3` FOREIGN KEY (`id_region`) REFERENCES `regiones` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
