-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 10, 2025 at 06:19 AM
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
  `estatus` varchar(100) DEFAULT NULL,
  `numero_factura` varchar(50) DEFAULT NULL,
  `ofertado` decimal(15,2) DEFAULT NULL,
  `costo_planificado` decimal(15,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `avance_financiero`
--

INSERT INTO `avance_financiero` (`id`, `id_proyecto`, `fecha`, `numero_valuacion`, `monto_usd`, `estatus`, `numero_factura`, `ofertado`, `costo_planificado`) VALUES
(1, 1, '2024-02-10', '00001', 1000.00, 'Aprobado', 'F-12345', 1200.00, 1100.00),
(2, 2, '2024-02-12', '00002', 1500.00, 'Pendiente', 'F-67890', 1700.00, 1600.00);

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
(1, 1, '2024-02-10', '50%', '55%', 'Revisión de estructura'),
(2, 2, '2024-02-12', '30%', '40%', 'Problemas con el proveedor');

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
(1, 'Empresa A', 'contacto@empresaA.com', '123456789', 'Calle 123, Ciudad A', 'Tecnología', 'Empresa A S.A.', 'EmpA', 'Av. Central 456', 'México', 1),
(2, 'Empresa B', 'info@empresaB.com', '987654321', 'Avenida 456, Ciudad B', 'Construcción', 'Empresa B S.A.', 'EmpB', 'Calle Industrial 789', 'Argentina', 2),
(3, 'Empresa C', 'soporte@empresaC.com', '1122334455', 'Carrera 789, Ciudad C', 'Finanzas', 'Empresa C S.A.', 'EmpC', 'Zona Empresarial 101', 'Colombia', 3);

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
  `duracion` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `proyectos`
--

INSERT INTO `proyectos` (`id`, `numero`, `nombre`, `id_cliente`, `id_responsable`, `id_region`, `id_contrato`, `costo_estimado`, `monto_ofertado`, `fecha_inicio`, `fecha_final`, `duracion`) VALUES
(1, 'P001', 'Sistema de Gestión', 1, 1, 1, 'C-1001', 50000.00, 60000.00, '2024-03-01', '2024-08-30', 180),
(2, 'P002', 'Desarrollo de Plataforma Web', 2, 2, 2, 'C-1002', 75000.00, 90000.00, '2024-05-15', '2024-12-20', 220),
(3, 'P003', 'Infraestructura IT', 3, 3, 3, 'C-1003', 30000.00, 40000.00, '2024-04-10', '2024-10-15', 190);

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
  ADD KEY `id_proyecto` (`id_proyecto`);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `avance_fisico`
--
ALTER TABLE `avance_fisico`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `proyectos`
--
ALTER TABLE `proyectos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  ADD CONSTRAINT `avance_financiero_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE;

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
