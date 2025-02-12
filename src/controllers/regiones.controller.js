import { pool } from "../db.js";

export const getRegiones = async (req, res) => {
  try {
    const [rows] = await pool.query(`
       SELECT 
  r.nombre AS nombre_region,
  COUNT(p.id) AS total_proyectos,
  COALESCE(SUM(p.monto_ofertado), 0) AS total_monto_ofertado
FROM 
  regiones r
LEFT JOIN 
  proyectos p ON r.id = p.id_region
GROUP BY 
  r.id, r.nombre
ORDER BY 
  total_monto_ofertado DESC;
    `);
    res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};
