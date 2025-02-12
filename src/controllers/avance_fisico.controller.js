import { pool } from "../db.js";

export const getAvanceFisico = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
	af.id,
    p.nombre,
    af.fecha,avance_real,
    af.avance_planificado,
    af.puntos_atencion 
FROM avance_fisico  af 
INNER JOIN proyectos p ON
	af.id_proyecto = p.id;
    `);
    res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const createAvanceFisico = async (req, res) => {
  try {
    const { id_proyecto, fecha, avance_real, avance_planificado, puntos_atencion } = req.body;

    // Validar que todos los campos obligatorios estén presentes
    if (!id_proyecto || !fecha || !avance_real || !avance_planificado || !puntos_atencion) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Insertar el nuevo registro en la base de datos
    const [result] = await pool.query(
      `
      INSERT INTO avance_fisico (id_proyecto, fecha, avance_real, avance_planificado, puntos_atencion)
      VALUES (?, ?, ?, ?, ?)
      `,
      [id_proyecto, fecha, avance_real, avance_planificado, puntos_atencion]
    );

    // Devolver el ID del nuevo registro creado
    res.status(201).json({
      id: result.insertId,
      id_proyecto,
      fecha,
      avance_real,
      avance_planificado,
      puntos_atencion,
      message: "Registro de avance físico creado exitosamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal al crear el registro" });
  }
};

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
        p.monto_ofertado
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