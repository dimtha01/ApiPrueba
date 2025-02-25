import { pool } from "../db.js";

export const getDashboardRegion = async (req, res) => {
    try {
        const { region } = req.params; // Obtiene el nombre de la región desde los parámetros de la URL

        // Consulta para obtener el costo total por región
        const [rows] = await pool.query(
            `
      SELECT
        R.nombre AS region,
        COUNT(P.id) AS total_proyectos,
        COALESCE(SUM(P.costo_estimado), 0) AS costo_planificado_total,
        COALESCE(SUM(CP.costo), 0) AS costo_real_total,
        SUM(CASE WHEN AV.id_estatus_proceso = 4 THEN AV.monto_usd ELSE 0 END) AS monto_por_valuar,
        SUM(CASE WHEN AV.id_estatus_proceso = 5 THEN AV.monto_usd ELSE 0 END) AS monto_por_facturar,
        SUM(CASE WHEN AV.id_estatus_proceso = 6 THEN AV.monto_usd ELSE 0 END) AS monto_facturado,
        MAX(AF.avance_real) AS avance_real_promedio,
        MAX(AF.avance_planificado) AS avance_planificado_promedio
      FROM 
        regiones R
      LEFT JOIN 
        proyectos P ON R.id = P.id_region
      LEFT JOIN 
        costos_proyectos CP ON P.id = CP.id_proyecto
      LEFT JOIN 
        avance_financiero AV ON P.id = AV.id_proyecto
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
      WHERE 
        R.nombre = ?
      GROUP BY 
        R.nombre
      ORDER BY 
        R.nombre;
    `,
            [region] // Parámetro para evitar inyecciones SQL
        );

        // Verificar si se encontraron resultados
        if (rows.length === 0) {
            return res.status(404).json({ message: "No se encontraron proyectos para la región especificada." });
        }

        // Devolver los resultados en formato JSON
        res.json(rows);
    } catch (error) {
        console.error("Error al ejecutar la consulta:", error);
        res.status(500).json({ message: "Ocurrió un error al procesar la solicitud." });
    }
};