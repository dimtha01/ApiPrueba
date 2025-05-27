import { pool } from "../db.js";

export const getRequisitions = async (req, res) => {
  try {
    const [result] = await pool.query(`
      SELECT
        r.id,
        p.id AS id_proyecto,
        pr.id AS id_proveedores,
        tr.nombre AS tipo_requisition,
        r.nro_requisicion,
        pr.nombre_comercial AS nombre_comercial_proveedor,
        p.nombre_cortos AS nombre_corto_proyecto, -- Usar LEFT JOIN para permitir NULL
        r.fecha_elaboracion,
        r.monto_total,
        r.nro_renglones,
        r.monto_anticipo,
        r.nro_odc
      FROM
        requisition r
        INNER JOIN tipo_requisition tr ON r.id_tipo = tr.id
        LEFT JOIN proyectos p ON r.id_proyecto = p.id -- Cambiar INNER JOIN por LEFT JOIN
        INNER JOIN proveedores pr ON r.id_proveedores = pr.id
      ORDER BY
        r.nro_odc DESC;
    `);

    // Devolver los resultados
    res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal" });
  }
};
export const updateRequisitionStatus = async (req, res) => {
  try {
    // Extraer el ID de la requisición de los parámetros de la URL
    const { id } = req.params;

    // Extraer el nuevo estatus del cuerpo de la solicitud
    const { id_estatus } = req.body;

    // Validar que el campo id_estatus esté presente
    if (id_estatus === undefined) {
      return res.status(400).json({ message: "El campo id_estatus es obligatorio" });
    }

    // Construir la consulta SQL para actualizar solo el estatus
    const query = `
      UPDATE requisition 
      SET id_estatus = ? 
      WHERE id = ?
    `;

    // Ejecutar la consulta
    const [result] = await pool.query(query, [id_estatus, id]);

    // Verificar si se actualizó algún registro
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Requisición no encontrada" });
    }

    // Devolver una respuesta exitosa
    res.status(200).json({
      message: "Estatus de la requisición actualizado exitosamente",
      id,
      id_estatus
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal" });
  }
};
export const createRequisition = async (req, res) => {
  try {
    // Extraer los datos del cuerpo de la solicitud, incluyendo monto_anticipo
    const {
      id_tipo,
      id_proyecto,
      nro_requisicion,
      id_proveedores,
      fecha_elaboracion,
      monto_total,
      nro_renglones,
      monto_anticipo,
      nro_odc // Nuevo campo agregado aquí
    } = req.body;

    // Validar que todos los campos obligatorios estén presentes
    if (
      !id_tipo ||
      !nro_requisicion ||
      !id_proveedores ||
      !fecha_elaboracion ||
      !monto_total ||
      !nro_renglones ||
      !nro_odc
    ) {
      return res.status(400).json({ message: "Todos los campos obligatorios deben estar presentes" });
    }

    // Insertar la nueva requisición en la base de datos, incluyendo monto_anticipo
    const [result] = await pool.query(
      `INSERT INTO requisition (
        id_tipo, 
        id_proyecto, 
        nro_requisicion, 
        id_proveedores, 
        fecha_elaboracion, 
        monto_total, 
        nro_renglones, 
        monto_anticipo,
        nro_odc
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [
        id_tipo,
        id_proyecto,
        nro_requisicion,
        id_proveedores,
        fecha_elaboracion,
        monto_total,
        nro_renglones,
        monto_anticipo || 0,
        nro_odc, // Valor por defecto null si no se proporciona
      ]
    );

    // Devolver el ID de la nueva requisición creada
    res.status(201).json({
      message: "Requisición creada exitosamente",
      id: result.insertId,
      id_tipo,
      id_proyecto,
      nro_requisicion,
      id_proveedores,
      fecha_elaboracion,
      monto_total,
      nro_renglones,
      monto_anticipo: monto_anticipo || null,
      nro_odc, // Incluir monto_anticipo en la respuesta
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal" });
  }
};

export const updateRequisition = async (req, res) => {
  try {
    // Extraer el ID de la requisición de los parámetros de la URL
    const { id } = req.params;

    // Extraer todos los campos del cuerpo de la solicitud
    const {
      id_tipo,
      id_proyecto,
      nro_requisicion,
      id_proveedores,
      fecha_elaboracion,
      monto_total,
      nro_renglones,
      monto_anticipo,
      nro_odc,
    } = req.body;

    // Validar que al menos un campo esté presente para la actualización
    if (
      id_tipo === undefined &&
      id_proyecto === undefined &&
      nro_requisicion === undefined &&
      id_proveedores === undefined &&
      fecha_elaboracion === undefined &&
      monto_total === undefined &&
      nro_renglones === undefined &&
      monto_anticipo === undefined &&
      nro_odc === undefined
    ) {
      return res.status(400).json({ message: "Al menos un campo debe ser proporcionado para la actualización" });
    }

    // Construir la consulta SQL dinámica para actualizar solo los campos proporcionados
    let query = "UPDATE requisition SET ";
    const updates = [];
    const values = [];

    if (id_tipo !== undefined) {
      updates.push("id_tipo = ?");
      values.push(id_tipo);
    }
    if (id_proyecto !== undefined) {
      updates.push("id_proyecto = ?");
      values.push(id_proyecto);
    }
    if (nro_requisicion !== undefined) {
      updates.push("nro_requisicion = ?");
      values.push(nro_requisicion);
    }
    if (id_proveedores !== undefined) {
      updates.push("id_proveedores = ?");
      values.push(id_proveedores);
    }
    if (fecha_elaboracion !== undefined) {
      updates.push("fecha_elaboracion = ?");
      values.push(fecha_elaboracion);
    }
    if (monto_total !== undefined) {
      updates.push("monto_total = ?");
      values.push(monto_total);
    }
    if (nro_renglones !== undefined) {
      updates.push("nro_renglones = ?");
      values.push(nro_renglones);
    }
    if (monto_anticipo !== undefined) {
      updates.push("monto_anticipo = ?");
      values.push(monto_anticipo);
    }
    if (nro_odc !== undefined) {
      updates.push("nro_odc = ?");
      values.push(nro_odc);
    }

    // Agregar el ID de la requisición al final
    query += updates.join(", ") + " WHERE id = ?";
    values.push(id);

    // Ejecutar la consulta
    const [result] = await pool.query(query, values);

    // Verificar si se actualizó algún registro
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Requisición no encontrada" });
    }

    // Devolver una respuesta exitosa
    res.status(200).json({
      message: "Requisición actualizada exitosamente",
      id,
      updates: req.body, // Incluir los campos actualizados en la respuesta
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal" });
  }
};