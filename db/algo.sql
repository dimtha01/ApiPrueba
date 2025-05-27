ALTER TABLE proyectos 
ADD COLUMN codigo_contrato_cliente VARCHAR(255) UNIQUE

ALTER TABLE proyectos
ADD COLUMN id_estatus_comercial INT

ALTER TABLE proyectos
ADD COLUMN monto_estimado_oferta_cerrado_sdo DECIMAL(10) DEFAULT 0.00,
ADD COLUMN monto_estimado_oferta_cliente DECIMAL(10) DEFAULT 0.00;

ALTER TABLE proyectos
ADD CONSTRAINT `fk_estatus_comercial_Proyecto` FOREIGN KEY (`id_estatus_comercial`) REFERENCES `estatus_comercial` (`id`) 

ALTER TABLE requisition
MODIFY COLUMN id_proyecto INT NULL;