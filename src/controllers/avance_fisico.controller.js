import { pool } from "../db.js";

// Obtener todos los avances físicos con información del proyecto
export const getAvanceFisico = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        af.id,
        p.nombre AS nombre_proyecto,
        af.fecha,
        af.avance_real,
        af.avance_planificado,
        af.puntos_atencion,
        af.fecha_inicio,
        af.fecha_fin
      FROM avance_fisico af
      INNER JOIN proyectos p ON af.id_proyecto = p.id;
    `);
    res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

// Crear un nuevo registro de avance físico
export const createAvanceFisico = async (req, res) => {
  try {
    const { id_proyecto, fecha, avance_real, avance_planificado, puntos_atencion, fecha_inicio, fecha_fin } = req.body;

    // Validar que todos los campos obligatorios estén presentes
    if (!id_proyecto || !fecha || !avance_real || !avance_planificado || !puntos_atencion || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Insertar el nuevo registro en la base de datos
    const [result] = await pool.query(
      `
      INSERT INTO avance_fisico (id_proyecto, fecha, avance_real, avance_planificado, puntos_atencion, fecha_inicio, fecha_fin)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [id_proyecto, fecha, avance_real, avance_planificado, puntos_atencion, fecha_inicio, fecha_fin]
    );

    // Devolver el ID del nuevo registro creado
    res.status(201).json({
      id: result.insertId,
      id_proyecto,
      fecha,
      avance_real,
      avance_planificado,
      puntos_atencion,
      fecha_inicio,
      fecha_fin,
      message: "Registro de avance físico creado exitosamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal al crear el registro" });
  }
};
export const updateAvanceFisico = async (req, res) => {
  try {
    // Extraer el ID del avance físico de los parámetros de la URL
    const { id } = req.params;

    // Extraer los datos del cuerpo de la solicitud
    const {
      id_proyecto,
      fecha,
      avance_real,
      avance_planificado,
      puntos_atencion,
      fecha_inicio,
      fecha_fin,
    } = req.body;

    // Validar que se proporcione al menos un campo para actualizar
    if (
      !id_proyecto &&
      !fecha &&
      !avance_real &&
      !avance_planificado &&
      !puntos_atencion &&
      !fecha_inicio &&
      !fecha_fin
    ) {
      return res.status(400).json({ message: "Debes proporcionar al menos un campo para actualizar" });
    }

    // Verificar si el registro existe en la base de datos
    const [existingRecord] = await pool.query("SELECT * FROM avance_fisico WHERE id = ?", [id]);
    if (existingRecord.length === 0) {
      return res.status(404).json({ message: "El registro de avance físico no existe" });
    }

    // Construir dinámicamente la consulta SQL para actualizar solo los campos proporcionados
    const updates = [];
    const values = [];

    if (id_proyecto !== undefined) {
      updates.push("id_proyecto = ?");
      values.push(id_proyecto);
    }
    if (fecha !== undefined) {
      updates.push("fecha = ?");
      values.push(fecha);
    }
    if (avance_real !== undefined) {
      updates.push("avance_real = ?");
      values.push(avance_real);
    }
    if (avance_planificado !== undefined) {
      updates.push("avance_planificado = ?");
      values.push(avance_planificado);
    }
    if (puntos_atencion !== undefined) {
      updates.push("puntos_atencion = ?");
      values.push(puntos_atencion);
    }
    if (fecha_inicio !== undefined) {
      updates.push("fecha_inicio = ?");
      values.push(fecha_inicio);
    }
    if (fecha_fin !== undefined) {
      updates.push("fecha_fin = ?");
      values.push(fecha_fin);
    }

    // Si no hay campos para actualizar, devolver un error
    if (updates.length === 0) {
      return res.status(400).json({ message: "No se proporcionaron campos válidos para actualizar" });
    }

    // Agregar el ID del registro al final de los valores
    values.push(id);

    // Construir la consulta SQL final
    const query = `
      UPDATE avance_fisico
      SET ${updates.join(", ")}
      WHERE id = ?
    `;

    // Ejecutar la consulta SQL
    const [result] = await pool.query(query, values);

    // Verificar si la actualización fue exitosa
    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "No se pudo actualizar el registro" });
    }

    // Devolver una respuesta exitosa
    res.status(200).json({
      message: `El registro de avance físico con ID ${id} ha sido actualizado correctamente`,
      data: {
        id,
        id_proyecto,
        fecha,
        avance_real,
        avance_planificado,
        puntos_atencion,
        fecha_inicio,
        fecha_fin,
      },
    });
  } catch (error) {
    console.error("Error al actualizar el avance físico:", error); // Registrar el error en la consola
    return res.status(500).json({ message: "Ocurrió un error al intentar actualizar el registro." });
  }
};
// Obtener avances físicos por ID de proyecto con fechas de inicio y fin
export const getAvanceFisicoByProyectoId = async (req, res) => {
  try {
    const id_proyecto = req.params; // Obtener el ID del proyecto desde la URL

    // Consultar los registros en la base de datos
    const [rows] = await pool.query(
      `
      SELECT 
        af.id,
        p.nombre AS nombre_proyecto,
        af.id_proyecto,
        af.fecha,
        af.avance_real,
        af.avance_planificado,
        af.puntos_atencion,
        af.fecha_inicio,
        af.fecha_fin
      FROM avance_fisico af
      INNER JOIN proyectos p ON af.id_proyecto = p.id
      WHERE af.id_proyecto = ?
      ORDER BY af.fecha ASC
      `,
      [id_proyecto.id]
    );

    // Verificar si se encontraron registros
    if (rows.length === 0) {
      // Devolver un array vacío si no hay datos
      return res.json([]);
    }

    // Devolver los registros encontrados
    res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal al obtener los registros" });
  }
};