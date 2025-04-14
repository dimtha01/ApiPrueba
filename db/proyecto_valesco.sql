
CREATE TABLE avance_financiero (
  id int NOT NULL,
  id_proyecto int DEFAULT NULL,
  fecha date DEFAULT NULL,
  numero_valuacion varchar(50) DEFAULT NULL,
  monto_usd decimal(15,2) DEFAULT NULL,
  numero_factura varchar(50) DEFAULT NULL,
  ofertado decimal(15,2) DEFAULT NULL,
  costo_planificado decimal(15,2) DEFAULT NULL,
  id_estatus_proceso int DEFAULT NULL,
  fecha_inicio date DEFAULT NULL,
  fecha_fin date DEFAULT NULL
) 


INSERT INTO avance_financiero (id, id_proyecto, fecha, numero_valuacion, monto_usd, numero_factura, ofertado, costo_planificado, id_estatus_proceso, fecha_inicio, fecha_fin) VALUES
(1, 26, '2025-02-20', '0001', 1000.00, 'f-21211', NULL, NULL, 6, '2025-02-20', '2025-02-21');


CREATE TABLE avance_fisico (
  id int NOT NULL,
  id_proyecto int DEFAULT NULL,
  fecha date DEFAULT NULL,
  avance_real varchar(255) DEFAULT NULL,
  avance_planificado varchar(255) DEFAULT NULL,
  puntos_atencion text,
  fecha_inicio datetime DEFAULT NULL,
  fecha_fin datetime DEFAULT NULL
);



INSERT INTO avance_fisico (id, id_proyecto, fecha, avance_real, avance_planificado, puntos_atencion, fecha_inicio, fecha_fin) VALUES
(1, 26, '2025-02-20', '10', '20', 'ninguno', '2025-02-20 00:00:00', '2025-02-21 00:00:00'),
(2, 26, '2025-02-20', '10', '20', 'ninguno', '2025-02-20 00:00:00', '2025-02-28 00:00:00');



CREATE TABLE clientes (
  id int NOT NULL,
  nombre varchar(255) NOT NULL,
  email varchar(255) DEFAULT NULL,
  telefono varchar(20) DEFAULT NULL,
  direccion text,
  unidad_negocio varchar(255) DEFAULT NULL,
  razon_social varchar(255) NOT NULL,
  nombre_comercial varchar(255) DEFAULT NULL,
  direccion_fiscal text,
  pais varchar(100) DEFAULT NULL,
  id_region int DEFAULT NULL
);



INSERT INTO clientes (id, nombre, email, telefono, direccion, unidad_negocio, razon_social, nombre_comercial, direccion_fiscal, pais, id_region) VALUES
(4, 'Cliente Ejemplo', 'cliente@example.com', '1234567890', 'Calle Secundaria, Zona', 'Unidad 1', 'Ejemplo SA', 'Ejemplo Comercial', 'Av. Principal, Ciudad', 'Venezuela', 1),
(7, 'RICHARSON', 'admin@example.com', '00000000', 'algo', 'unidad 2', 'cliente', 'cliente', 'cliente', 'venezuela', 2),
(8, 'RICHARSON2', 'admin@example.com', '00000000', 'algo', 'unidad 2', 'cliente', 'cliente', 'cliente', 'venezuela', 1);



CREATE TABLE costos_proyectos (
  id int NOT NULL,
  id_proyecto int NOT NULL,
  fecha date NOT NULL,
  costo decimal(10,2) NOT NULL,
  monto_sobrepasado decimal(10,2) DEFAULT '0.00',
  fecha_inicio datetime DEFAULT NULL,
  fecha_fin datetime DEFAULT NULL
);


INSERT INTO costos_proyectos (id, id_proyecto, fecha, costo, monto_sobrepasado, fecha_inicio, fecha_fin) VALUES
(1, 26, '2025-02-20', 100.00, 0.00, '2025-02-20 00:00:00', '2025-02-28 00:00:00'),
(2, 26, '2025-02-20', 1000.00, 100.00, '2025-02-20 00:00:00', '2025-02-28 00:00:00');



CREATE TABLE estatus_proceso (
  id_estatus int NOT NULL AUTO_INCREMENT,
  nombre_estatus varchar(50) NOT NULL,
  descripcion text,
  fecha_creacion timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  activo tinyint(1) DEFAULT '1'
);



INSERT INTO estatus_proceso (id_estatus, nombre_estatus, descripcion, fecha_creacion, activo) VALUES
(1, 'En Elaboración de Valuación', 'El proceso está en la fase inicial de elaboración.', '2025-02-10 16:55:47', 1),
(2, 'En Revisión por el Cliente', 'El cliente está revisando la valuación.', '2025-02-10 16:55:47', 1),
(3, 'Valuación Aprobada', 'La valuación ha sido aprobada por el cliente.', '2025-02-10 16:55:47', 1),
(4, 'Por Valuar', 'aluar implica evaluar el valor de un bien o activo de manera objetiva y precisa, utilizando métodos y técnicas específicas según el contexto', '2025-02-11 18:11:48', 1),
(5, 'Por Facturar', 'El proceso está listo para ser facturado.', '2025-02-10 16:55:47', 1),
(6, 'Facturado', 'El proceso ha sido facturado completamente.', '2025-02-10 16:55:47', 1);



CREATE TABLE proyectos (
  id int NOT NULL,
  numero varchar(50) NOT NULL,
  nombre varchar(255) NOT NULL,
  id_cliente int DEFAULT NULL,
  id_responsable int DEFAULT NULL,
  id_region int DEFAULT NULL,
  id_contrato varchar(100) DEFAULT NULL,
  costo_estimado decimal(15,2) DEFAULT NULL,
  monto_ofertado decimal(15,2) DEFAULT NULL,
  fecha_inicio date DEFAULT NULL,
  fecha_final date DEFAULT NULL,
  duracion int DEFAULT NULL,
  id_estatus int NOT NULL DEFAULT '1'
);



INSERT INTO proyectos (id, numero, nombre, id_cliente, id_responsable, id_region, id_contrato, costo_estimado, monto_ofertado, fecha_inicio, fecha_final, duracion, id_estatus) VALUES
(25, '0001', 'Proyecto de web', 4, 2, 1, NULL, 1000.00, 1000.00, '2025-02-18', '2025-02-25', 7, 1),
(26, '0002', 'Proyecto de Web 2', 4, 2, 2, NULL, 1000.00, 1000.00, '2025-02-18', '2025-02-25', 7, 1),
(27, '0003', 'Proyecto de Web 3', 4, 2, 3, NULL, 1000.00, 1000.00, '2025-02-26', '2025-03-07', 9, 1),
(28, 'PROY-0021', 'Proyecto de Web 4', 4, 2, 1, NULL, 1000.00, 12000.00, '2025-02-26', '2025-03-05', 7, 1),
(29, 'PROY-0026', 'Proyecto de web 5', 4, 2, 2, NULL, 12000.00, 10000.00, '2025-02-27', '2025-03-07', 8, 1),
(30, 'PROY-0024', 'Proyecto de Web 6', 4, 2, 2, NULL, 12000.00, 1000.00, '2025-02-25', '2025-03-07', 10, 1),
(31, 'PROY-0027', 'Proyecto de web 7', 4, 2, 3, NULL, 3000.00, 2500.00, '2025-02-24', '2025-03-07', 11, 1);



CREATE TABLE regiones (
  id int NOT NULL,
  nombre varchar(255) NOT NULL
);



INSERT INTO regiones (id, nombre) VALUES
(1, 'Centro'),
(2, 'Occidente'),
(3, 'Oriente');



CREATE TABLE responsables (
  id int NOT NULL,
  nombre varchar(255) NOT NULL,
  cargo varchar(255) DEFAULT NULL
);



INSERT INTO responsables (id, nombre, cargo) VALUES
(1, 'Juan Pérez', 'Administrador'),
(2, 'María González', 'Planificador'),
(3, 'Carlos López', 'Planificador');


CREATE TABLE procedimiento_comercial (
  id int NOT NULL AUTO_INCREMENT,
  id_region int NOT NULL,
  nombre_contrato int NOT NULL,
  nombre_corto varchar(255) NOT NULL,
  oferta_Proveedor DECIMAL(20,2) NOT NULL,
  monto_estimado_oferta_cerrado_sdo DECIMAL(20,2) NOT NULL,
  monto_estimado_oferta_cliente DECIMAL(20,2) NOT NULL,
  fecha_inicio_proceso date not null,
  fecha_adjudicacion date NOT NULL,
  observaciones VARCHAR(255) NOT NULL,
  id_estatus_comercial int not null,
  PRIMARY KEY (id)
)



CREATE TABLE estatus_comercial(
  id int NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255),
  PRIMARY KEY (id)
)


ALTER TABLE procedimiento_comercial
ADD CONSTRAINT fk_estatus_comercial
FOREIGN KEY (id_estatus_comercial) REFERENCES estatus_comercial(id);

ALTER TABLE costos_proyectos
ADD COLUMN id_estatus int DEFAULT 4;

ALTER TABLE costos_proyectos
ADD CONSTRAINT fk_id
FOREIGN KEY (id_estatus) REFERENCES estatus_proceso(id_estatus);

ALTER TABLE costos_proyectos
ADD COLUMN numero_valuacion numero_valuacion DEFAULT NULL;

CREATE TABLE requisition (
    id INT NOT NULL AUTO_INCREMENT,
    id_tipo INT NOT NULL,
    id_proyecto INT NOT NULL,
    nro_requisicion VARCHAR(255) NOT NULL,
    id_proveedores INT NOT NULL,
    fecha_elaboracion DATE NOT NULL,
    monto_total INT NOT NULL,
    nro_renglones INT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE tipo_requisition(
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
)
CREATE TABLE proveedores (
    id INT NOT NULL AUTO_INCREMENT,
    nombre_comercial VARCHAR(255) NOT NULL,
    direccion_fiscal VARCHAR(255) NOT NULL,
    pais VARCHAR(255) NOT NULL,
    telefono VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    RIF VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE requisition
ADD CONSTRAINT fk_tipo_requisition
FOREIGN KEY (id_tipo) REFERENCES tipo_requisition(id)

ALTER TABLE requisition
ADD CONSTRAINT fk_proyecto
FOREIGN KEY (id_proyecto) REFERENCES proyectos(id)


ALTER TABLE requisition
ADD CONSTRAINT fk_proveedores
FOREIGN KEY (id_proveedores) REFERENCES proveedores(id)

ALTER TABLE procedimiento_comercial
  ADD PRIMARY KEY (id),
  ADD KEY id_region (id_region),
  ADD KEY id_estatus_proceso (id_estatus_proceso);


ALTER TABLE avance_financiero
  ADD PRIMARY KEY (id),
  ADD KEY id_proyecto (id_proyecto),
  ADD KEY id_estatus_proceso (id_estatus_proceso);


ALTER TABLE avance_fisico
  ADD PRIMARY KEY (id),
  ADD KEY id_proyecto (id_proyecto);


ALTER TABLE clientes
  ADD PRIMARY KEY (id),
  ADD KEY fk_clientes_region (id_region);


ALTER TABLE costos_proyectos
  ADD PRIMARY KEY (id),
  ADD KEY id_proyecto (id_proyecto);

ALTER TABLE estatus_proceso
  ADD PRIMARY KEY (id_estatus);


ALTER TABLE proyectos
  ADD PRIMARY KEY (id),
  ADD UNIQUE KEY numero (numero),
  ADD UNIQUE KEY id_contrato (id_contrato),
  ADD KEY id_cliente (id_cliente),
  ADD KEY id_responsable (id_responsable),
  ADD KEY id_region (id_region);


ALTER TABLE regiones
  ADD PRIMARY KEY (id);


ALTER TABLE responsables
  ADD PRIMARY KEY (id);

ALTER TABLE avance_financiero
  MODIFY id int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;


ALTER TABLE avance_fisico
  MODIFY id int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;


ALTER TABLE clientes
  MODIFY id int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;


ALTER TABLE costos_proyectos
  MODIFY id int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;


ALTER TABLE estatus_proceso
  MODIFY id_estatus int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;


ALTER TABLE proyectos
  MODIFY id int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;


ALTER TABLE regiones
  MODIFY id int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;


ALTER TABLE responsables
  MODIFY id int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;


ALTER TABLE avance_financiero
  ADD CONSTRAINT avance_financiero_ibfk_1 FOREIGN KEY (id_proyecto) REFERENCES proyectos (id) ON DELETE CASCADE,
  ADD CONSTRAINT avance_financiero_ibfk_2 FOREIGN KEY (id_estatus_proceso) REFERENCES estatus_proceso (id_estatus) ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE avance_fisico
  ADD CONSTRAINT avance_fisico_ibfk_1 FOREIGN KEY (id_proyecto) REFERENCES proyectos (id) ON DELETE CASCADE;


ALTER TABLE clientes
  ADD CONSTRAINT fk_clientes_region FOREIGN KEY (id_region) REFERENCES regiones (id) ON DELETE SET NULL;


ALTER TABLE costos_proyectos
  ADD CONSTRAINT costos_proyectos_ibfk_1 FOREIGN KEY (id_proyecto) REFERENCES proyectos (id) ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE proyectos
  ADD CONSTRAINT proyectos_ibfk_1 FOREIGN KEY (id_cliente) REFERENCES clientes (id),
  ADD CONSTRAINT proyectos_ibfk_2 FOREIGN KEY (id_responsable) REFERENCES responsables (id),
  ADD CONSTRAINT proyectos_ibfk_3 FOREIGN KEY (id_region) REFERENCES regiones (id);
COMMIT;

