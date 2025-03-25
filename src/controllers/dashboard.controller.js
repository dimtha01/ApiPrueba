import { pool } from "../db.js"

export const getDashboardRegion = async (req, res) => {
  try {
    const { region } = req.params // Obtiene el nombre de la región desde los parámetros de la URL

    // Consulta para obtener datos detallados por proyecto
    const [projectRows] = await pool.query(
      `
      SELECT
        P.id AS id_proyecto,
        P.nombre AS nombre_proyecto,
        P.costo_estimado AS costo_planificado,
        P.monto_ofertado,
        R.nombre AS region,
        COALESCE(SUM(CP.costo), 0) AS costo_real, -- Suma de los costos reales por proyecto
        SUM(CASE WHEN AV.id_estatus_proceso = 4 THEN AV.monto_usd ELSE 0 END) AS monto_por_valuar,
        SUM(CASE WHEN AV.id_estatus_proceso = 5 THEN AV.monto_usd ELSE 0 END) AS monto_por_facturar,
        SUM(CASE WHEN AV.id_estatus_proceso = 6 THEN AV.monto_usd ELSE 0 END) AS monto_facturado,
        MAX(AF.avance_real) AS avance_real, -- Usamos MAX para evitar problemas
        MAX(AF.avance_planificado) AS avance_planificado -- Usamos MAX para evitar problemas
      FROM 
        proyectos P
      LEFT JOIN 
        avance_financiero AV ON AV.id_proyecto = P.id
      LEFT JOIN 
        (
          SELECT 
            id_proyecto, 
            MAX(id) AS ultimo_id
          FROM 
            avance_fisico
          GROUP BY 
            id_proyecto
        ) UltimoAF ON P.id = UltimoAF.id_proyecto
      LEFT JOIN 
        avance_fisico AF ON AF.id = UltimoAF.ultimo_id
      LEFT JOIN 
        regiones R ON P.id_region = R.id
      LEFT JOIN 
        costos_proyectos CP ON P.id = CP.id_proyecto -- Unión con la tabla de costos reales
      WHERE 
        R.nombre = ?
      GROUP BY
        P.id, P.nombre, R.nombre
      ORDER BY
        P.id;
    `,
      [region], // Parámetro para evitar inyecciones SQL
    )

    // Consulta para obtener los totales de la región
    const [totalsRow] = await pool.query(
      `
      SELECT
        R.nombre AS region,
        SUM(P.monto_ofertado) AS total_ofertado,
        SUM(P.costo_estimado) AS total_costo_planificado,
        COALESCE(SUM(CP.costo), 0) AS total_costo_real,
        SUM(CASE WHEN AV.id_estatus_proceso = 4 THEN AV.monto_usd ELSE 0 END) AS total_por_valuar,
        SUM(CASE WHEN AV.id_estatus_proceso = 5 THEN AV.monto_usd ELSE 0 END) AS total_por_facturar,
        SUM(CASE WHEN AV.id_estatus_proceso = 6 THEN AV.monto_usd ELSE 0 END) AS total_facturado
      FROM 
        proyectos P
      LEFT JOIN 
        avance_financiero AV ON AV.id_proyecto = P.id
      LEFT JOIN 
        regiones R ON P.id_region = R.id
      LEFT JOIN 
        costos_proyectos CP ON P.id = CP.id_proyecto
      WHERE 
        R.nombre = ?
      GROUP BY
        R.nombre;
    `,
      [region],
    )

    // Verificar si se encontraron resultados
    if (projectRows.length === 0) {
      return res.status(404).json({ message: "No se encontraron proyectos para la región especificada." })
    }

    // Devolver los resultados en formato JSON con proyectos detallados y totales
    res.json({
      proyectos: projectRows,
      totales: totalsRow[0] || {
        region,
        total_ofertado: 0,
        total_costo_planificado: 0,
        total_costo_real: 0,
        total_por_valuar: 0,
        total_por_facturar: 0,
        total_facturado: 0,
      },
    })
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error)
    res.status(500).json({ message: "Ocurrió un error al procesar la solicitud." })
  }
}

