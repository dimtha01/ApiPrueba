import { pool } from "../db.js";

export const getRequisitions = async (req, res) => {
  try {
    const [result] = await pool.query(`
      SELECT
      r.id,
      tr.nombre as tipo_requisition,
      r.nro_requisicion,
      pr.nombre_comercial as nombre_comercial_provedore,
      r.fecha_elaboracion,
      r.monto_total,
      r.nro_renglones
    FROM
      requisition r
      INNER JOIN tipo_requisition tr ON r.id_tipo = tr.id
      INNER JOIN proyectos p ON r.id_proyecto = p.id
      INNER JOIN proveedores pr ON r.id_proveedores = pr.id;
      `);
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
    // Extraer los datos del cuerpo de la solicitud
    const { id_tipo, id_proyecto, nro_requisicion, id_proveedores, fecha_elaboracion, monto_total, nro_renglones } = req.body;

    // Validar que todos los campos obligatorios estén presentes
    if (!id_tipo || !id_proyecto || !nro_requisicion || !id_proveedores || !fecha_elaboracion || !monto_total || !nro_renglones) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Insertar la nueva requisición en la base de datos
    const [result] = await pool.query(
      `INSERT INTO requisition (id_tipo, id_proyecto, nro_requisicion, id_proveedores, fecha_elaboracion, monto_total, nro_renglones) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_tipo, id_proyecto, nro_requisicion, id_proveedores, fecha_elaboracion, monto_total, nro_renglones]
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
      nro_renglones
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal" });
  }
};