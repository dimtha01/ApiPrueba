import { pool } from "../db.js";

export const getDashboardRegion = async (req, res) => {
  try {
    const { region } = req.params; // Obtiene el nombre de la región desde los parámetros de la URL

    // Consulta para obtener datos detallados por proyecto
    const [projectRows] = await pool.query(
      `
     SELECT
        P.id AS id_proyecto,
        P.nombre AS nombre_proyecto,
        P.nombre_cortos,
        P.costo_estimado AS costo_planificado,
        P.monto_ofertado,
        R.nombre AS region,
        (
        SELECT COALESCE(SUM(costo), 0)
        FROM costos_proyectos cp2
        WHERE cp2.id_proyecto = P.id
        ) AS costo_real,
        SUM(CASE WHEN AV.id_estatus_proceso = 4 THEN AV.monto_usd ELSE 0 END) AS monto_por_valuar,
        SUM(CASE WHEN AV.id_estatus_proceso = 5 THEN AV.monto_usd ELSE 0 END) AS monto_por_facturar,
        SUM(CASE WHEN AV.id_estatus_proceso = 6 THEN AV.monto_usd ELSE 0 END) AS monto_facturado,
        -- Reemplazo aquí: Usar costos_proyectos para total_amortizacion
        COALESCE((SELECT SUM(cp.amortizacion) 
                  FROM costos_proyectos cp 
                  WHERE cp.id_proyecto = P.id), 0) AS total_amortizacion, -- Cambio aquí
        COALESCE((SELECT SUM(req.monto_anticipo) 
                  FROM requisition req 
                  WHERE req.id_proyecto = P.id), 0) AS monto_anticipo_total, -- Campo existente
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
    );

    // Consulta para obtener el total_costo_planificado
    const [totalCostoPlanificadoRow] = await pool.query(
      `
      SELECT
        SUM(P.costo_estimado) AS total_costo_planificado
      FROM 
        proyectos P
      LEFT JOIN 
        regiones R ON P.id_region = R.id
      WHERE 
        R.nombre = ?;
    `,
      [region],
    );

    // Consulta para obtener el total_ofertado
    const [totalOfertadoRow] = await pool.query(
      `
      SELECT
        SUM(P.monto_ofertado) AS total_ofertado
      FROM 
        proyectos P
      LEFT JOIN 
        regiones R ON P.id_region = R.id
      WHERE 
        R.nombre = ?;
    `,
      [region],
    );

    // Consulta para obtener los demás totales (costo real, por valuar, por facturar, facturado)
    const [otherTotalsRow] = await pool.query(
      `
     SELECT
        (
            SELECT COALESCE(SUM(costo), 0)
            FROM costos_proyectos cp2
            JOIN proyectos P ON cp2.id_proyecto = P.id
            JOIN regiones R ON P.id_region = R.id
            WHERE R.nombre = ?	
        ) AS total_costo_real,
        SUM(CASE WHEN AV.id_estatus_proceso = 4 THEN AV.monto_usd ELSE 0 END) AS total_por_valuar,
        SUM(CASE WHEN AV.id_estatus_proceso = 5 THEN AV.monto_usd ELSE 0 END) AS total_por_facturar,
        SUM(CASE WHEN AV.id_estatus_proceso = 6 THEN AV.monto_usd ELSE 0 END) AS total_facturado
     FROM 
        proyectos P
     LEFT JOIN 
        avance_financiero AV ON AV.id_proyecto = P.id
     LEFT JOIN 
        regiones R ON P.id_region = R.id
     WHERE 
        R.nombre = ?;
    `,
      [region, region],
    );

    // Consulta adicional para calcular el total de amortización (SEPARADA)
    const [totalAmortizacionRow] = await pool.query(
      `
      SELECT
        COALESCE(SUM(cp.amortizacion), 0) AS total_amortizacion
      FROM 
        costos_proyectos cp
      JOIN 
        proyectos P ON cp.id_proyecto = P.id
      JOIN 
        regiones R ON P.id_region = R.id
      WHERE 
        R.nombre = ?;
    `,
      [region],
    );

    // Consulta adicional para calcular el total de monto anticipo
    const [totalMontoAnticipoRow] = await pool.query(
      `
      SELECT
        COALESCE(SUM(req.monto_anticipo), 0) AS total_monto_anticipo
      FROM 
        requisition req
      JOIN 
        proyectos P ON req.id_proyecto = P.id
      JOIN 
        regiones R ON P.id_region = R.id
      WHERE 
        R.nombre = ?;
    `,
      [region],
    );

    // Verificar si se encontraron resultados
    if (projectRows.length === 0) {
      return res.status(400).json({ message: "No se encontraron proyectos para la región especificada." });
    }

    // Devolver los resultados en formato JSON con proyectos detallados y totales
    res.json({
      proyectos: projectRows,
      totales: {
        region,
        total_ofertado: totalOfertadoRow[0]?.total_ofertado || 0,
        total_costo_planificado: totalCostoPlanificadoRow[0]?.total_costo_planificado || 0,
        total_costo_real: otherTotalsRow[0]?.total_costo_real || 0,
        total_por_valuar: otherTotalsRow[0]?.total_por_valuar || 0,
        total_por_facturar: otherTotalsRow[0]?.total_por_facturar || 0,
        total_facturado: otherTotalsRow[0]?.total_facturado || 0,
        total_amortizacion: totalAmortizacionRow[0]?.total_amortizacion || 0, // Consulta separada
        total_monto_anticipo: totalMontoAnticipoRow[0]?.total_monto_anticipo || 0, // Campo existente
      },
    });
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    res.status(500).json({ message: "Ocurrió un error al procesar la solicitud." });
  }
};