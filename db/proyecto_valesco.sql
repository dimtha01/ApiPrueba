-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 12, 2025 at 02:04 PM
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
(2, 2, '2024-02-12', '00002', 1500.00, 'F-67890', 1700.00, 1600.00, 2),
(3, 1, '2025-02-11', '00001', 1000.00, 'F-12345', 1000.00, 10000.00, 6),
(4, 2, '2025-02-11', '0003', 20000.22, 'F-12345', 10000.00, 10000.00, 6),
(5, 2, '2025-02-11', '0004', 20000.00, 'F-12345', 10000.00, 1000.00, 5),
(6, 10, '2025-02-11', '0001', 10000.00, 'F-12345', 1000.00, 1200.00, 5),
(7, 15, '2025-02-12', '0009', 10000.00, 'F-12345', 10000.00, 10000.00, 5),
(8, 17, '2025-02-12', '0001', 2000.00, 'F-12345', 100000.00, 100000.00, 4),
(9, 2, '2025-02-12', '0003', 1000.00, 'F-12345', 100000.00, 100000.00, 4),
(10, 4, '2025-02-12', '0003', 1000.00, '100000', 1000000.00, 100000.00, 4),
(11, 12, '2025-02-12', '0003', 1000.00, '100000', 100000.00, 1000000.00, 5),
(12, 12, '2025-02-12', '0003', 1000.00, 'F-12345', 100000.00, 100000.00, 5),
(13, 12, '2025-02-12', '0003', 1000.00, '100000', 10000.00, 10000.00, 4),
(14, 12, '2025-02-12', '0003', 1000.00, '12121', 1000.00, 10000.00, 6);

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
(16, 1, '2025-02-10', '10', '20', 'ningundo'),
(17, 2, '2025-02-10', '10', '10', 'ninguno'),
(18, 1, '2025-02-10', '11.5', '30', 'ninguno'),
(19, 1, '2025-02-10', '35', '50', 'ninguno'),
(20, 2, '2025-02-10', '35', '40', 'ninguno'),
(21, 1, '2025-02-10', '50', '60', 'ninguno'),
(22, 1, '2025-02-11', '60', '70', 'ninguno'),
(23, 10, '2025-02-11', '10', '20', 'ninguno'),
(24, 15, '2025-02-11', '35', '40', 'ninguno');

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
(3, 'Empresa C', 'soporte@empresaC.com', '1122334455', 'Carrera 789, Ciudad C', 'Finanzas', 'Empresa C S.A.', 'EmpC', 'Zona Empresarial 101', 'Colombia', 3),
(4, 'Cliente Ejemplo', 'cliente@example.com', '1234567890', 'Calle Secundaria, Zona', 'Unidad 1', 'Ejemplo SA', 'Ejemplo Comercial', 'Av. Principal, Ciudad', 'Venezuela', 1),
(5, 'Constructora Futuro', 'contacto@futuro.com', '0212-1234567', 'Calle Principal, Zona Industrial', 'Construcción Civil', 'Constructora Futuro SA', 'Futuro Construcciones', 'Av. Bolívar, Edificio Torre Futuro, Piso 5', 'Venezuela', 3),
(6, 'richarson', 'richarsonmartine@gmail.com', '04127433277', 'carabobo', 'comprar', 'nada', 'algo', 'guacara', 'venezuela', 1);

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
(1, 'P001', 'Sistema de Gestión', 1, 1, 1, 'C-1001', 50000.00, 60000.00, '2024-03-01', '2024-08-30', 180, 1),
(2, 'P002', 'Desarrollo de Plataforma Web', 2, 2, 2, 'C-1002', 75000.00, 90000.00, '2024-05-15', '2024-12-20', 220, 2),
(4, 'PROY-001', 'Proyecto de Construcción', 1, 2, 3, NULL, 500000.00, 600000.00, '2023-10-01', '2024-10-01', 23, 5),
(6, 'PROY-002', 'Proyecto de Construcción', 1, 2, 3, NULL, 500000.00, 600000.00, '2023-10-01', '2024-10-01', 365, 1),
(7, 'PROY-008', 'Proyecto de Construcción', 1, 2, 3, NULL, 500000.00, 600000.00, '2023-09-30', '2024-09-30', 366, 1),
(9, 'PROY-009', 'Proyecto de Construcción', 1, 2, 3, NULL, 500000.00, 600000.00, '2023-09-30', '2024-09-30', 366, 5),
(10, 'PROY-004', 'Proyecto de Construcción', 1, 2, 3, NULL, 500000.00, 600000.00, '2023-09-30', '2024-09-30', 366, 5),
(11, 'PROY-0019', 'Proyecto de Construcción', 1, 2, 3, NULL, 500000.00, 600000.00, '2023-09-30', '2024-09-30', 366, 5),
(12, 'PROY-0020', 'Proyecto de Construcción', 5, 1, 1, NULL, 10000.00, 566667.00, '2025-02-11', '2025-02-18', 7, 5),
(13, 'PROY-0021', 'Proyecto de Construcción', 5, 1, 3, NULL, 10000.20, 100000.20, '2025-02-12', '2025-03-07', 23, 5),
(15, 'PROY-0024', 'Proyecto de Construcción', 1, 2, 3, NULL, 500000.00, 600000.00, '2023-09-30', '2024-09-30', 366, 5),
(16, 'PROY-002222', 'Proyecto de Construcciónwq', 5, 1, 3, NULL, 1000.00, 134344.00, '2025-02-11', '2025-02-26', 15, 1),
(17, 'PROY-0022222', 'Proyecto de Construcciónwq', 5, 2, 2, NULL, 1000.00, 343434.00, '2025-02-11', '2025-02-26', 15, 1),
(19, 'PROY-00222222', 'Proyecto de Construcciónwq', 5, 2, 2, NULL, 10000.00, 342342.00, '2025-02-11', '2025-02-26', 15, 1),
(21, 'PROY-00212121', 'Proyecto de Construcción', 1, 2, 3, NULL, 500000.00, 600000.00, '2023-09-30', '2024-09-30', 366, 1),
(22, 'PROY-00222222112', 'Proyecto de Construcción', 6, 2, 2, NULL, 12121.00, 211212.00, '2025-02-20', '2025-02-25', 5, 1);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `avance_fisico`
--
ALTER TABLE `avance_fisico`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `estatus_proceso`
--
ALTER TABLE `estatus_proceso`
  MODIFY `id_estatus` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `proyectos`
--
ALTER TABLE `proyectos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

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
