import { pool } from "../db.js"

export const getRegiones = async (req, res) => {
  try {
    // Consulta para obtener los totales globales
    const [proyectoResult] = await pool.query(
      `
      SELECT 
        SUM(p.costo_estimado) AS costo_planificado_total,
        COALESCE(SUM(cp_totals.total_costo_real), 0) AS costo_real_total
      FROM 
        proyectos p
      LEFT JOIN 
        (
          SELECT 
            id_proyecto, 
            SUM(costo) AS total_costo_real
          FROM 
            costos_proyectos
          GROUP BY 
            id_proyecto
        ) cp_totals ON p.id = cp_totals.id_proyecto
      `,
    )

    // Consulta para obtener los detalles por región
    const [rows] = await pool.query(`
      SELECT 
        r.nombre AS nombre_region,
        COUNT(DISTINCT p.id) AS total_proyectos,
        COALESCE(SUM(p.monto_ofertado), 0) AS total_monto_ofertado,
        COALESCE(SUM(p.costo_estimado), 0) AS total_costo_planificado,
        COALESCE(SUM(cp.total_costo_real), 0) AS total_costo_real
      FROM 
        regiones r
      LEFT JOIN 
        proyectos p ON r.id = p.id_region
      LEFT JOIN 
        (
          SELECT 
            id_proyecto, 
            SUM(costo) AS total_costo_real
          FROM 
            costos_proyectos
          GROUP BY 
            id_proyecto
        ) cp ON p.id = cp.id_proyecto
      GROUP BY 
        r.id, r.nombre
      ORDER BY 
        total_monto_ofertado DESC;
    `)

    // Extraer los totales globales del resultado de la primera consulta
    const { costo_planificado_total, costo_real_total } = proyectoResult[0] || {
      costo_planificado_total: 0,
      costo_real_total: 0,
    }

    // Construir la respuesta final
    const response = {
      costo_planificado_total: Number.parseFloat(costo_planificado_total || 0),
      costo_real_total: Number.parseFloat(costo_real_total || 0),
      regiones: rows, // Detalles por región
    }

    // Devolver los resultados en formato JSON
    res.json(response)
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error)
    return res.status(500).json({ message: "Something goes wrong" })
  }
}

