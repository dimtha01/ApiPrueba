import { pool } from "../db.js";

export const getRegiones = async (req, res) => {
  try {
    // Consulta para obtener el costo planificado total y el costo real total
    const [proyectoResult] = await pool.query(
      `
    SELECT 
    SUM(costo_planificado_total) AS costo_planificado_total,
    SUM(costo_real_total) AS costo_real_total
FROM 
    (
        SELECT 
            p.id AS id_proyecto,
            p.costo_estimado AS costo_planificado_total,
            SUM(cp.costo) AS costo_real_total
        FROM 
            proyectos p
        LEFT JOIN 
            costos_proyectos cp ON p.id = cp.id_proyecto
        GROUP BY 
            p.id, p.costo_estimado
    ) subquery;
      `
    );

    // Consulta para obtener los detalles por región
    const [rows] = await pool.query(`
       SELECT 
          r.nombre AS nombre_region,
          COUNT(p.id) AS total_proyectos,
          COALESCE(SUM(p.monto_ofertado), 0) AS total_monto_ofertado,
          COALESCE(SUM(p.costo_estimado), 0) AS total_costo_planificado, -- Costo planificado por región
          COALESCE(SUM(cp.costo), 0) AS total_costo_real -- Costo real por región
       FROM 
          regiones r
       LEFT JOIN 
          proyectos p ON r.id = p.id_region
       LEFT JOIN 
          costos_proyectos cp ON p.id = cp.id_proyecto
       GROUP BY 
          r.id, r.nombre
       ORDER BY 
          total_monto_ofertado DESC;
    `);

    // Extraer los totales globales del resultado de la primera consulta
    const { costo_planificado_total, costo_real_total } = proyectoResult[0] || {
      costo_planificado_total: 0,
      costo_real_total: 0,
    };

    // Construir la respuesta final
    const response = {
      costo_planificado_total: parseFloat(costo_planificado_total || 0),
      costo_real_total: parseFloat(costo_real_total || 0),
      regiones: rows, // Detalles por región
    };

    // Devolver los resultados en formato JSON
    res.json(response);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};