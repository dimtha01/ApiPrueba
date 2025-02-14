import { pool } from "../db.js";

export const getAvanceFinanciero = async (req, res) => {
  try {
    // Ejecutar la consulta SQL
    const [rows] = await pool.query(`
      SELECT 
        af.id,
        af.id_proyecto,
        af.fecha,
        af.numero_valuacion,
        af.monto_usd,
        af.numero_factura,
        ep.nombre_estatus AS estatus_proceso_nombre,
        ep.descripcion AS estatus_proceso_descripcion
      FROM 
        avance_financiero af
      LEFT JOIN 
        estatus_proceso ep
      ON 
        af.id_estatus_proceso = ep.id_estatus;
    `);

    // Verificar si hay resultados
    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontraron registros de avance financiero" });
    }

    // Devolver los resultados
    res.json(rows);
  } catch (error) {
    // Manejar errores
    console.error("Error al obtener el avance financiero:", error); // Registrar el error en la consola
    return res.status(500).json({ message: "Algo salió mal", error: error.message });
  }
};
export const getAvanceFinancieroByProyectoId = async (req, res) => {
  try {
    // Obtener el ID del proyecto desde los parámetros de la URL
    const id_proyecto = req.params;

    // Ejecutar la consulta SQL con filtro por id_proyecto
    const [rows] = await pool.query(
      `
      SELECT 
        af.id,
        af.id_proyecto,
        af.fecha,
        af.numero_valuacion,
        af.monto_usd,
        af.numero_factura,
        ep.nombre_estatus AS estatus_proceso_nombre,
        ep.descripcion AS estatus_proceso_descripcion
      FROM 
        avance_financiero af
      LEFT JOIN 
        estatus_proceso ep
      ON 
        af.id_estatus_proceso = ep.id_estatus
      WHERE 
        af.id_proyecto = ?;
    `,
      [id_proyecto.id]
    );

    // Verificar si hay resultados
    if (rows.length === 0) {
      return res.status(200).json([]);
    }

    // Devolver los resultados
    res.json(rows);
  } catch (error) {
    // Manejar errores
    console.error("Error al obtener el avance financiero:", error); // Registrar el error en la consola
    return res.status(500).json({ message: "Algo salió mal", error: error.message });
  }
};
export const createAvanceFinanciero = async (req, res) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const {
      id_proyecto,
      fecha,
      numero_valuacion,
      monto_usd,
      numero_factura,
      id_estatus_proceso,
    } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (
      !id_proyecto ||
      !fecha ||
      !numero_valuacion ||
      !monto_usd ||
      !numero_factura ||
      !id_estatus_proceso
    ) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Ejecutar la consulta SQL para insertar el nuevo registro
    const [result] = await pool.query(
      `
      INSERT INTO avance_financiero (
        id_proyecto,
        fecha,
        numero_valuacion,
        monto_usd,
        numero_factura,
        id_estatus_proceso
      ) VALUES (?, ?, ?, ?, ?, ?);
    `,
      [
        id_proyecto,
        fecha,
        numero_valuacion,
        monto_usd,
        numero_factura,
        id_estatus_proceso,
      ]
    );

    // Verificar si se insertó correctamente
    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "No se pudo insertar el registro" });
    }

    // Devolver el ID del nuevo registro creado
    res.status(201).json({
      message: "Registro de avance financiero creado exitosamente",
      id: result.insertId,
    });
  } catch (error) {
    // Manejar errores
    console.error("Error al crear el avance financiero:", error); // Registrar el error en la consola
    return res.status(500).json({ message: "Algo salió mal", error: error.message });
  }
};
export const updateEstatusAvanceFinanciero = async (req, res) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const { id_estatus_proceso } = req.body;
    // Extraer el ID del avance financiero desde los parámetros de la ruta
    const idAvanceFinanciero = req.params.id;

    // Validar que todos los campos requeridos estén presentes
    if (!id_estatus_proceso || !idAvanceFinanciero) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Ejecutar la consulta SQL para actualizar el registro
    const [result] = await pool.query(
      `
      UPDATE avance_financiero 
      SET id_estatus_proceso = ?
      WHERE id = ?;
    `,
      [id_estatus_proceso, idAvanceFinanciero]
    );

    // Verificar si se actualizó correctamente
    if (result.affectedRows === 0) {
        return res.status(200).json([]);
    }

    // Devolver mensaje exitoso
    res.status(200).json({
      message: "Estado del avance financiero actualizado exitosamente",
      updatedId: idAvanceFinanciero,
      newStatusId: id_estatus_proceso,
    });
  } catch (error) {
    // Manejar errores
    console.error("Error al actualizar el estado del avance financiero:", error);
    return res.status(500).json({ message: "Algo salió mal", error: error.message });
  }
};