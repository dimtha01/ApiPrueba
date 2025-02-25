import { pool } from "../db.js";

export const getDashboardRegion = async (req, res) => {
    try {
        const { region } = req.params; // Obtiene el nombre de la región desde los parámetros de la URL
        const [proyectoResult] = await pool.query(
            `SELECT 
    SUM(p.costo_estimado) AS costo_planificado_total,
    SUM(cp.costo) AS costo_real_total
FROM 
    proyectos p
INNER JOIN 
    costos_proyectos cp ON p.id = cp.id_proyecto;`
        );
        const [rows] = await pool.query(
            `
      SELECT
    P.id AS id_proyecto,
    P.nombre AS nombre_proyecto,
    P.costo_estimado AS costo_planificado,
    P.monto_ofertado,
    R.nombre AS region,
    SUM(CASE WHEN AV.id_estatus_proceso = 4 THEN AV.monto_usd ELSE 0 END) AS monto_por_valuar,
    SUM(CASE WHEN AV.id_estatus_proceso = 5 THEN AV.monto_usd ELSE 0 END) AS monto_por_facturar,
    SUM(CASE WHEN AV.id_estatus_proceso = 6 THEN AV.monto_usd ELSE 0 END) AS monto_facturado,
    MAX(AF.avance_real) AS avance_real, -- Usamos MAX para evitar problemas
    MAX(AF.avance_planificado) AS avance_planificado -- Usamos MAX para evitar problemas
FROM 
    proyectos P
LEFT JOIN 
    avance_financiero AV
ON 
    AV.id_proyecto = P.id
LEFT JOIN 
    (
        SELECT 
            id_proyecto, 
            MAX(id) AS ultimo_id
        FROM 
            avance_fisico
        GROUP BY 
            id_proyecto
    ) UltimoAF
ON 
    P.id = UltimoAF.id_proyecto
LEFT JOIN 
    avance_fisico AF
ON 
    AF.id = UltimoAF.ultimo_id
LEFT JOIN 
    regiones R
ON 
    P.id_region = R.id
 WHERE 
          R.nombre = ?
GROUP BY
    P.id, P.nombre, R.nombre
ORDER BY
    P.id;
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