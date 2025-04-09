import { pool } from "../db.js";

export const getEstatusComercial = async (req, res) => {
  try {
    // Consulta para obtener todos los estatus comerciales
    const [rows] = await pool.query("SELECT * FROM estatus_comercial");

    // Verificar si hay registros
    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontraron estatus comerciales" });
    }

    // Devolver los resultados
    res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal" });
  }
};