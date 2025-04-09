import { pool } from "../db.js";

export const getProcedimientosComerciales = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        pc.id,
        r.nombre AS nombreRegion,
        pc.nombre_contrato,
        pc.nombre_corto,
        pc.oferta_Proveedor,
        pc.monto_estimado_oferta_cerrado_sdo,
        pc.monto_estimado_oferta_cliente,
        pc.fecha_inicio_proceso,
        pc.fecha_adjudicacion,
        pc.observaciones,
        ec.nombre AS nombreEstatus
      FROM
        procedimiento_comercial pc
        INNER JOIN regiones r ON pc.id_region = r.id
        INNER JOIN estatus_comercial ec ON pc.id_estatus_comercial = ec.id
    `);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontraron procedimientos comerciales" });
    }

    res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal" });
  }
};

export const createProcedimientoComercial = async (req, res) => {
  try {
    const {
      id_region,
      nombre_contrato,
      nombre_corto,
      oferta_Proveedor,
      monto_estimado_oferta_cerrado_sdo,
      monto_estimado_oferta_cliente,
      fecha_inicio_proceso,
      fecha_adjudicacion,
      observaciones,
      id_estatus_comercial
    } = req.body;

    if (
      !id_region ||
      !nombre_contrato ||
      !nombre_corto ||
      !oferta_Proveedor ||
      !monto_estimado_oferta_cerrado_sdo ||
      !monto_estimado_oferta_cliente ||
      !fecha_inicio_proceso ||
      !fecha_adjudicacion ||
      !observaciones ||
      !id_estatus_comercial
    ) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const [result] = await pool.query(
      `INSERT INTO procedimiento_comercial 
       (id_region, nombre_contrato, nombre_corto, oferta_Proveedor, monto_estimado_oferta_cerrado_sdo, 
        monto_estimado_oferta_cliente, fecha_inicio_proceso, fecha_adjudicacion, observaciones, id_estatus_comercial) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_region,
        nombre_contrato,
        nombre_corto,
        oferta_Proveedor,
        monto_estimado_oferta_cerrado_sdo,
        monto_estimado_oferta_cliente,
        fecha_inicio_proceso,
        fecha_adjudicacion,
        observaciones,
        id_estatus_comercial
      ]
    );

    res.status(201).json({
      message: "Procedimiento comercial creado exitosamente",
      id: result.insertId,
      ...req.body
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal" });
  }
};

export const getProcedimientosPorRegion = async (req, res) => {
  try {
    const region = req.params.region;

    const [rows] = await pool.query(
      `
      SELECT
        pc.id,
        r.nombre AS nombreRegion,
        pc.nombre_contrato,
        pc.nombre_corto,
        pc.oferta_Proveedor,
        pc.monto_estimado_oferta_cerrado_sdo,
        pc.monto_estimado_oferta_cliente,
        pc.fecha_inicio_proceso,
        pc.fecha_adjudicacion,
        pc.observaciones,
        ec.nombre AS nombreEstatus
      FROM
        procedimiento_comercial pc
        INNER JOIN regiones r ON pc.id_region = r.id
        INNER JOIN estatus_comercial ec ON pc.id_estatus_comercial = ec.id
      WHERE r.nombre = ?
      `,
      [region]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal" });
  }
};

export const updateEstatusComercial = async (req, res) => {
  try {
    // Extraer el ID del procedimiento comercial de los parámetros de la URL
    const { id } = req.params;

    // Extraer el nuevo estatus comercial del cuerpo de la solicitud
    const { id_estatus_comercial } = req.body;

    // Validar que el campo id_estatus_comercial esté presente
    if (id_estatus_comercial === undefined) {
      return res.status(400).json({ message: "El campo id_estatus_comercial es obligatorio" });
    }

    // Construir la consulta SQL para actualizar solo el estatus comercial
    const query = `
      UPDATE procedimiento_comercial 
      SET id_estatus_comercial = ? 
      WHERE id = ?
    `;

    // Ejecutar la consulta
    const [result] = await pool.query(query, [id_estatus_comercial, id]);

    // Verificar si se actualizó algún registro
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Procedimiento comercial no encontrado" });
    }

    // Devolver una respuesta exitosa
    res.status(200).json({
      message: "Estatus comercial actualizado exitosamente",
      id,
      id_estatus_comercial
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal" });
  }
};

export const getProcedimientoComercialById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        pc.id,
        r.nombre AS nombreRegion,
        pc.nombre_contrato,
        pc.nombre_corto,
        pc.oferta_Proveedor,
        pc.monto_estimado_oferta_cerrado_sdo,
        pc.monto_estimado_oferta_cliente,
        pc.fecha_inicio_proceso,
        pc.fecha_adjudicacion,
        pc.observaciones,
        ec.nombre AS nombreEstatus
      FROM
        procedimiento_comercial pc
        INNER JOIN regiones r ON pc.id_region = r.id
        INNER JOIN estatus_comercial ec ON pc.id_estatus_comercial = ec.id
      WHERE pc.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Procedimiento comercial no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal" });
  }
};