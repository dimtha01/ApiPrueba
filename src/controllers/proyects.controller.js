import { pool } from "../db.js";

export const getProyectsAll = async (req, res) => {
  try {
    let query = `
      SELECT 
        p.id,
        p.numero,
        p.nombre AS nombre_proyecto,
        p.nombre_cortos,
        p.id_estatus_comercial,
        p.id_region,
        p.id_cliente,
        p.codigo_contrato_cliente, -- Campo agregado: Código del contrato del cliente
        p.oferta_del_proveedor,
        c.nombre AS nombre_cliente,
        r.nombre AS nombre_responsable,
        reg.nombre AS nombre_region,
        c.unidad_negocio AS unidad_negocio,
        p.costo_estimado,
        p.monto_ofertado,
        p.fecha_inicio,
        p.fecha_final,
        p.duracion,
        p.observaciones, -- Campo agregado
        p.monto_estimado_oferta_cliente, -- Campo agregado
        p.monto_estimado_oferta_cerrado_sdo, -- Campo agregado
        ec.nombre AS estatus_comercial, -- Nombre del estatus comercial
        -- Subconsulta para calcular el costo real
        (SELECT SUM(co.costo) 
         FROM costos_proyectos co 
         WHERE co.id_proyecto = p.id) AS costo_real,
        -- Subconsulta para calcular el monto facturado (estatus 6)
        (SELECT SUM(af_financiero.monto_usd)
         FROM avance_financiero af_financiero
         INNER JOIN estatus_proceso ep ON af_financiero.id_estatus_proceso = ep.id_estatus
         WHERE af_financiero.id_proyecto = p.id
           AND ep.id_estatus = 6) AS facturado,
        -- Subconsulta para calcular el monto por valor (estatus diferente de 6)
        (SELECT SUM(af_financiero.monto_usd)
         FROM avance_financiero af_financiero
         INNER JOIN estatus_proceso ep ON af_financiero.id_estatus_proceso = ep.id_estatus
         WHERE af_financiero.id_proyecto = p.id
           AND ep.id_estatus = 4) AS por_valuar,
        -- Subconsulta para calcular el monto por factura (estatus relacionado con facturas)
        (SELECT SUM(af_financiero.monto_usd)
         FROM avance_financiero af_financiero
         INNER JOIN estatus_proceso ep ON af_financiero.id_estatus_proceso = ep.id_estatus
         WHERE af_financiero.id_proyecto = p.id
           AND ep.id_estatus = 5) AS por_factura,
        -- Subconsulta para calcular el total de amortización por proyecto
        COALESCE((SELECT SUM(cp.amortizacion)
                  FROM costos_proyectos cp
                  WHERE cp.id_proyecto = p.id), 0) AS total_amortizacion,
        -- Subconsulta para calcular el total de monto anticipado por proyecto
        COALESCE((SELECT SUM(req.monto_anticipo)
                  FROM requisition req
                  WHERE req.id_proyecto = p.id), 0) AS monto_anticipo_total,
        -- Máximo avance real y planificado
        MAX(af_fisico.avance_real) AS avance_real_maximo,
        MAX(af_fisico.avance_planificado) AS avance_planificado_maximo
      FROM
        proyectos p
        LEFT JOIN clientes c ON p.id_cliente = c.id
        LEFT JOIN responsables r ON p.id_responsable = r.id
        LEFT JOIN regiones reg ON p.id_region = reg.id
        LEFT JOIN avance_fisico af_fisico ON p.id = af_fisico.id_proyecto
        LEFT JOIN estatus_comercial ec ON p.id_estatus_comercial = ec.id -- Unión con la tabla estatus_comercial
      WHERE
        ec.id = 8 -- Filtrar por estatus comercial con ID 8
    `;

    query += `
      GROUP BY 
        p.id,
        p.numero,
        p.nombre,
        p.nombre_cortos,
        p.codigo_contrato_cliente, -- Campo agregado al GROUP BY
        c.nombre,
        r.nombre,
        reg.nombre,
        c.unidad_negocio,
        p.costo_estimado,
        p.monto_ofertado,
        p.fecha_inicio,
        p.fecha_final,
        p.duracion,
        p.observaciones, -- Campo agregado al GROUP BY
        p.monto_estimado_oferta_cliente, -- Campo agregado al GROUP BY
        p.monto_estimado_oferta_cerrado_sdo, -- Campo agregado al GROUP BY
        ec.nombre; -- Nombre del estatus comercial agregado al GROUP BY
    `;

    const [rows] = await pool.query(query);

    // Consulta para obtener el total_costo_planificado (filtrado por estatus comercial)
    const [totalCostoPlanificadoRow] = await pool.query(
      `
      SELECT
        SUM(P.costo_estimado) AS total_costo_planificado
      FROM 
        proyectos P
        LEFT JOIN estatus_comercial ec ON P.id_estatus_comercial = ec.id
      WHERE 
        ec.id = 8;
    `
    );

    // Consulta para obtener el total_ofertado (filtrado por estatus comercial)
    const [totalOfertadoRow] = await pool.query(
      `
      SELECT
        SUM(P.monto_ofertado) AS total_ofertado
      FROM 
        proyectos P
        LEFT JOIN estatus_comercial ec ON P.id_estatus_comercial = ec.id
      WHERE 
        ec.id = 8;
    `
    );

    // Consulta para obtener los demás totales (costo real, por valuar, por facturar, facturado) filtrados por estatus comercial
    const [otherTotalsRow] = await pool.query(
      `
      SELECT
        (
          SELECT COALESCE(SUM(costo), 0)
          FROM costos_proyectos cp2
          JOIN proyectos P ON cp2.id_proyecto = P.id
          LEFT JOIN estatus_comercial ec ON P.id_estatus_comercial = ec.id
          WHERE ec.id = 8
        ) AS total_costo_real,
        SUM(CASE WHEN AV.id_estatus_proceso = 4 THEN AV.monto_usd ELSE 0 END) AS total_por_valuar,
        SUM(CASE WHEN AV.id_estatus_proceso = 5 THEN AV.monto_usd ELSE 0 END) AS total_por_facturar,
        SUM(CASE WHEN AV.id_estatus_proceso = 6 THEN AV.monto_usd ELSE 0 END) AS total_facturado
      FROM 
        proyectos P
        LEFT JOIN estatus_comercial ec ON P.id_estatus_comercial = ec.id
        LEFT JOIN avance_financiero AV ON AV.id_proyecto = P.id
      WHERE 
        ec.id = 8;
    `
    );

    // Consulta adicional para calcular el total de amortización (SEPARADA y filtrada por estatus comercial)
    const [totalAmortizacionRow] = await pool.query(
      `
      SELECT
        COALESCE(SUM(cp.amortizacion), 0) AS total_amortizacion
      FROM 
        costos_proyectos cp
        JOIN proyectos P ON cp.id_proyecto = P.id
        LEFT JOIN estatus_comercial ec ON P.id_estatus_comercial = ec.id
      WHERE 
        ec.id = 8;
    `
    );

    // Consulta adicional para calcular el total de monto_anticipo (SEPARADA y filtrada por estatus comercial)
    const [totalMontoAnticipoRow] = await pool.query(
      `
      SELECT
        COALESCE(SUM(req.monto_anticipo), 0) AS total_monto_anticipo
      FROM 
        requisition req
        JOIN proyectos P ON req.id_proyecto = P.id
        LEFT JOIN estatus_comercial ec ON P.id_estatus_comercial = ec.id
      WHERE 
        ec.id = 8;
    `
    );

    res.json({
      proyectos: rows,
      totales: {
        total_ofertado: totalOfertadoRow[0]?.total_ofertado || 0,
        total_costo_planificado: totalCostoPlanificadoRow[0]?.total_costo_planificado || 0,
        total_costo_real: otherTotalsRow[0]?.total_costo_real || 0,
        total_por_valuar: otherTotalsRow[0]?.total_por_valuar || 0,
        total_por_facturar: otherTotalsRow[0]?.total_por_facturar || 0,
        total_facturado: otherTotalsRow[0]?.total_facturado || 0,
        total_amortizacion: totalAmortizacionRow[0]?.total_amortizacion || 0, // Consulta separada
        total_monto_anticipo: totalMontoAnticipoRow[0]?.total_monto_anticipo || 0, // Campo agregado aquí
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal" });
  }
};
export const getProyectsAllRequisition = async (req, res) => {
  try {
    let query = `
      SELECT 
        p.id,
        p.numero,
        p.nombre AS nombre_proyecto,
        p.nombre_cortos,
        p.id_estatus_comercial,
        p.id_region,
        p.id_cliente,
        p.codigo_contrato_cliente, -- Campo agregado: Código del contrato del cliente
        p.oferta_del_proveedor,
        c.nombre AS nombre_cliente,
        r.nombre AS nombre_responsable,
        reg.nombre AS nombre_region,
        c.unidad_negocio AS unidad_negocio,
        p.costo_estimado,
        p.monto_ofertado,
        p.fecha_inicio,
        p.fecha_final,
        p.duracion,
        p.observaciones, -- Campo agregado
        p.monto_estimado_oferta_cliente, -- Campo agregado
        p.monto_estimado_oferta_cerrado_sdo, -- Campo agregado
        ec.nombre AS estatus_comercial, -- Nombre del estatus comercial
        -- Subconsulta para calcular el costo real
        (SELECT SUM(co.costo) 
         FROM costos_proyectos co 
         WHERE co.id_proyecto = p.id) AS costo_real,
        -- Subconsulta para calcular el monto facturado (estatus 6)
        (SELECT SUM(af_financiero.monto_usd)
         FROM avance_financiero af_financiero
         INNER JOIN estatus_proceso ep ON af_financiero.id_estatus_proceso = ep.id_estatus
         WHERE af_financiero.id_proyecto = p.id
           AND ep.id_estatus = 6) AS facturado,
        -- Subconsulta para calcular el monto por valor (estatus diferente de 6)
        (SELECT SUM(af_financiero.monto_usd)
         FROM avance_financiero af_financiero
         INNER JOIN estatus_proceso ep ON af_financiero.id_estatus_proceso = ep.id_estatus
         WHERE af_financiero.id_proyecto = p.id
           AND ep.id_estatus = 4) AS por_valuar,
        -- Subconsulta para calcular el monto por factura (estatus relacionado con facturas)
        (SELECT SUM(af_financiero.monto_usd)
         FROM avance_financiero af_financiero
         INNER JOIN estatus_proceso ep ON af_financiero.id_estatus_proceso = ep.id_estatus
         WHERE af_financiero.id_proyecto = p.id
           AND ep.id_estatus = 5) AS por_factura,
        -- Subconsulta para calcular el total de amortización por proyecto
        COALESCE((SELECT SUM(cp.amortizacion)
                  FROM costos_proyectos cp
                  WHERE cp.id_proyecto = p.id), 0) AS total_amortizacion,
        -- Subconsulta para calcular el total de monto anticipado por proyecto
        COALESCE((SELECT SUM(req.monto_anticipo)
                  FROM requisition req
                  WHERE req.id_proyecto = p.id), 0) AS monto_anticipo_total,
        -- Máximo avance real y planificado
        MAX(af_fisico.avance_real) AS avance_real_maximo,
        MAX(af_fisico.avance_planificado) AS avance_planificado_maximo
      FROM
        proyectos p
        LEFT JOIN clientes c ON p.id_cliente = c.id
        LEFT JOIN responsables r ON p.id_responsable = r.id
        LEFT JOIN regiones reg ON p.id_region = reg.id
        LEFT JOIN avance_fisico af_fisico ON p.id = af_fisico.id_proyecto
        LEFT JOIN estatus_comercial ec ON p.id_estatus_comercial = ec.id -- Unión con la tabla estatus_comercial
    `;

    query += `
      GROUP BY 
        p.id,
        p.numero,
        p.nombre,
        p.nombre_cortos,
        p.codigo_contrato_cliente, -- Campo agregado al GROUP BY
        c.nombre,
        r.nombre,
        reg.nombre,
        c.unidad_negocio,
        p.costo_estimado,
        p.monto_ofertado,
        p.fecha_inicio,
        p.fecha_final,
        p.duracion,
        p.observaciones, -- Campo agregado al GROUP BY
        p.monto_estimado_oferta_cliente, -- Campo agregado al GROUP BY
        p.monto_estimado_oferta_cerrado_sdo, -- Campo agregado al GROUP BY
        ec.nombre; -- Nombre del estatus comercial agregado al GROUP BY
    `;

    const [rows] = await pool.query(query);

    // Consulta para obtener el total_costo_planificado (para todos los proyectos)
    const [totalCostoPlanificadoRow] = await pool.query(
      `
      SELECT
        SUM(P.costo_estimado) AS total_costo_planificado
      FROM 
        proyectos P;
    `
    );

    // Consulta para obtener el total_ofertado (para todos los proyectos)
    const [totalOfertadoRow] = await pool.query(
      `
      SELECT
        SUM(P.monto_ofertado) AS total_ofertado
      FROM 
        proyectos P;
    `
    );

    // Consulta para obtener los demás totales (costo real, por valuar, por facturar, facturado)
    const [otherTotalsRow] = await pool.query(
      `
      SELECT
        (
          SELECT COALESCE(SUM(costo), 0)
          FROM costos_proyectos cp2
          JOIN proyectos P ON cp2.id_proyecto = P.id
        ) AS total_costo_real,
        SUM(CASE WHEN AV.id_estatus_proceso = 4 THEN AV.monto_usd ELSE 0 END) AS total_por_valuar,
        SUM(CASE WHEN AV.id_estatus_proceso = 5 THEN AV.monto_usd ELSE 0 END) AS total_por_facturar,
        SUM(CASE WHEN AV.id_estatus_proceso = 6 THEN AV.monto_usd ELSE 0 END) AS total_facturado
      FROM 
        proyectos P
      LEFT JOIN 
        avance_financiero AV ON AV.id_proyecto = P.id;
    `
    );

    // Consulta adicional para calcular el total de amortización (SEPARADA)
    const [totalAmortizacionRow] = await pool.query(
      `
      SELECT
        COALESCE(SUM(cp.amortizacion), 0) AS total_amortizacion
      FROM 
        costos_proyectos cp;
    `
    );

    // Consulta adicional para calcular el total de monto_anticipo
    const [totalMontoAnticipoRow] = await pool.query(
      `
      SELECT
        COALESCE(SUM(req.monto_anticipo), 0) AS total_monto_anticipo
      FROM 
        requisition req;
    `
    );

    res.json({
      proyectos: rows,
      totales: {
        total_ofertado: totalOfertadoRow[0]?.total_ofertado || 0,
        total_costo_planificado: totalCostoPlanificadoRow[0]?.total_costo_planificado || 0,
        total_costo_real: otherTotalsRow[0]?.total_costo_real || 0,
        total_por_valuar: otherTotalsRow[0]?.total_por_valuar || 0,
        total_por_facturar: otherTotalsRow[0]?.total_por_facturar || 0,
        total_facturado: otherTotalsRow[0]?.total_facturado || 0,
        total_amortizacion: totalAmortizacionRow[0]?.total_amortizacion || 0, // Consulta separada
        total_monto_anticipo: totalMontoAnticipoRow[0]?.total_monto_anticipo || 0, // Campo agregado aquí
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal" });
  }
};

export const getProyectsNameRegion = async (req, res) => {
  try {
    const { region } = req.params; // Obtener el parámetro de consulta 'region'
    console.log(region);

    // Construir la consulta base
    let query = `
      SELECT 
        p.id,
        p.numero,
        p.nombre AS nombre_proyecto,
        p.nombre_cortos,
        p.codigo_contrato_cliente, -- Campo agregado: Código del contrato del cliente
        p.oferta_del_proveedor,
        c.nombre AS nombre_cliente,
        r.nombre AS nombre_responsable,
        reg.nombre AS nombre_region,
        c.unidad_negocio AS unidad_negocio,
        p.costo_estimado,
        p.monto_ofertado,
        p.fecha_inicio,
        p.fecha_final,
        p.duracion,
        p.observaciones, -- Campo agregado
        p.monto_estimado_oferta_cliente, -- Campo agregado
        p.monto_estimado_oferta_cerrado_sdo, -- Campo agregado
        ec.nombre AS estatus_comercial, -- Nombre del estatus comercial
        -- Subconsulta para calcular el costo real
        (SELECT SUM(co.costo) 
         FROM costos_proyectos co 
         WHERE co.id_proyecto = p.id) AS costo_real,
        -- Subconsulta para calcular el monto facturado (estatus 6)
        (SELECT SUM(af_financiero.monto_usd)
         FROM avance_financiero af_financiero
         INNER JOIN estatus_proceso ep ON af_financiero.id_estatus_proceso = ep.id_estatus
         WHERE af_financiero.id_proyecto = p.id
           AND ep.id_estatus = 6) AS facturado,
        -- Subconsulta para calcular el monto por valor (estatus diferente de 6)
        (SELECT SUM(af_financiero.monto_usd)
         FROM avance_financiero af_financiero
         INNER JOIN estatus_proceso ep ON af_financiero.id_estatus_proceso = ep.id_estatus
         WHERE af_financiero.id_proyecto = p.id
           AND ep.id_estatus = 4) AS por_valuar,
        -- Subconsulta para calcular el monto por factura (estatus relacionado con facturas)
        (SELECT SUM(af_financiero.monto_usd)
         FROM avance_financiero af_financiero
         INNER JOIN estatus_proceso ep ON af_financiero.id_estatus_proceso = ep.id_estatus
         WHERE af_financiero.id_proyecto = p.id
           AND ep.id_estatus = 5) AS por_factura,
        -- Subconsulta para calcular el total de amortización por proyecto
        COALESCE((SELECT SUM(cp.amortizacion)
                  FROM costos_proyectos cp
                  WHERE cp.id_proyecto = p.id), 0) AS total_amortizacion,
        -- Subconsulta para calcular el total de monto anticipado por proyecto
        COALESCE((SELECT SUM(req.monto_anticipo)
                  FROM requisition req
                  WHERE req.id_proyecto = p.id), 0) AS monto_anticipo_total,
        -- Máximo avance real y planificado
        MAX(af_fisico.avance_real) AS avance_real_maximo,
        MAX(af_fisico.avance_planificado) AS avance_planificado_maximo
      FROM
        proyectos p
        LEFT JOIN clientes c ON p.id_cliente = c.id
        LEFT JOIN responsables r ON p.id_responsable = r.id
        LEFT JOIN regiones reg ON p.id_region = reg.id
        LEFT JOIN avance_fisico af_fisico ON p.id = af_fisico.id_proyecto
        LEFT JOIN estatus_comercial ec ON p.id_estatus_comercial = ec.id -- Unión con la tabla estatus_comercial
    `;

    // Agregar condición WHERE si se proporciona el parámetro 'region'
    const queryParams = [];
    if (region) {
      // Validar que el parámetro 'region' no esté vacío
      if (!region.trim()) {
        return res.status(400).json({ message: "El nombre de la región no puede estar vacío" });
      }
      query += " WHERE reg.nombre = ? AND ec.id = 8"; // Filtrar por región y estatus comercial
      queryParams.push(region);
    } else {
      query += " WHERE ec.id = 8"; // Filtrar solo por estatus comercial si no hay región
    }

    query += `
      GROUP BY 
        p.id,
        p.numero,
        p.nombre,
        p.nombre_cortos,
        p.codigo_contrato_cliente, -- Campo agregado al GROUP BY
        c.nombre,
        p.oferta_del_proveedor,
        r.nombre,
        reg.nombre,
        c.unidad_negocio,
        p.costo_estimado,
        p.monto_ofertado,
        p.fecha_inicio,
        p.fecha_final,
        p.duracion,
        p.observaciones, -- Campo agregado al GROUP BY
        p.monto_estimado_oferta_cliente, -- Campo agregado al GROUP BY
        p.monto_estimado_oferta_cerrado_sdo, -- Campo agregado al GROUP BY
        ec.nombre; -- Nombre del estatus comercial agregado al GROUP BY
    `;

    // Ejecutar la consulta con los parámetros necesarios
    const [rows] = await pool.query(query, queryParams);

    const [totalCostoPlanificadoRow] = await pool.query(
      `
      SELECT
        SUM(P.costo_estimado) AS total_costo_planificado
      FROM 
        proyectos P
      LEFT JOIN 
        regiones R ON P.id_region = R.id
      LEFT JOIN 
        estatus_comercial ec ON P.id_estatus_comercial = ec.id
      WHERE 
        R.nombre = ? AND ec.id = 8;
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
      LEFT JOIN 
        estatus_comercial ec ON P.id_estatus_comercial = ec.id
      WHERE 
        R.nombre = ? AND ec.id = 8;
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
            LEFT JOIN estatus_comercial ec ON P.id_estatus_comercial = ec.id
            WHERE R.nombre = ? AND ec.id = 8	
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
     LEFT JOIN 
        estatus_comercial ec ON P.id_estatus_comercial = ec.id
     WHERE 
        R.nombre = ? AND ec.id = 8;
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
      LEFT JOIN 
        estatus_comercial ec ON P.id_estatus_comercial = ec.id
      WHERE 
        R.nombre = ? AND ec.id = 8;
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
      LEFT JOIN 
        estatus_comercial ec ON P.id_estatus_comercial = ec.id
      WHERE 
        R.nombre = ? AND ec.id = 8;
    `,
      [region],
    );

    // Verificar si se encontraron proyectos
    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontraron proyectos para la región especificada" });
    }

    // Devolver los resultados
    res.json({
      proyectos: rows,
      totales: {
        region,
        total_ofertado: totalOfertadoRow[0]?.total_ofertado || 0,
        total_costo_planificado: totalCostoPlanificadoRow[0]?.total_costo_planificado || 0,
        total_costo_real: otherTotalsRow[0]?.total_costo_real || 0,
        total_por_valuar: otherTotalsRow[0]?.total_por_valuar || 0,
        total_por_facturar: otherTotalsRow[0]?.total_por_facturar || 0,
        total_facturado: otherTotalsRow[0]?.total_facturado || 0,
        total_amortizacion: totalAmortizacionRow[0]?.total_amortizacion || 0, // Consulta separada
        total_monto_anticipo: totalMontoAnticipoRow[0]?.total_monto_anticipo || 0, // Campo agregado aquí
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal" });
  }
};
export const getProyectoById = async (req, res) => {
  try {
    const params = req.params;

    // Validar que el ID sea un número entero
    if (!Number.isInteger(Number(params.id))) {
      return res.status(400).json({ message: "ID de proyecto inválido" });
    }

    // Ejecutar la consulta con el ID como parámetro
    const [rows] = await pool.query(`
      SELECT 
          p.id,
          p.numero,
          p.nombre AS nombre_proyecto,
          p.nombre_cortos,
          p.codigo_contrato_cliente, -- Campo agregado: Código del contrato del cliente
          p.oferta_del_proveedor,
          c.nombre AS nombre_cliente,
          r.nombre AS nombre_responsable,
          reg.nombre AS nombre_region,
          c.unidad_negocio AS unidad_negocio,
          p.costo_estimado,
          p.monto_ofertado,
          p.fecha_inicio,
          p.fecha_final,
          p.duracion,
          p.observaciones, -- Campo agregado
          p.monto_estimado_oferta_cliente, -- Campo agregado
          p.monto_estimado_oferta_cerrado_sdo, -- Campo agregado
          ec.nombre AS estatus_comercial, -- Nombre del estatus comercial
          MAX(af.avance_real) AS avance_real_maximo,
          MAX(af.avance_planificado) AS avance_planificado_maximo,
          (
              SELECT COALESCE(SUM(costo), 0)
              FROM costos_proyectos cp2
              WHERE cp2.id_proyecto = ?
          ) AS costo_real_total, -- Costo específico del proyecto
          -- Cambio aquí: Usar costos_proyectos para total_amortizacion
          (
              SELECT COALESCE(SUM(cp.amortizacion), 0)
              FROM costos_proyectos cp
              WHERE cp.id_proyecto = ?
          ) AS total_amortizacion, -- Total de amortización del proyecto
          (
              SELECT COALESCE(SUM(req.monto_anticipo), 0)
              FROM requisition req
              WHERE req.id_proyecto = ?
          ) AS monto_anticipo_total -- Total de monto anticipado del proyecto (campo agregado aquí)
      FROM 
          proyectos p
          LEFT JOIN clientes c ON p.id_cliente = c.id
          LEFT JOIN responsables r ON p.id_responsable = r.id
          LEFT JOIN regiones reg ON p.id_region = reg.id
          LEFT JOIN avance_fisico af ON p.id = af.id_proyecto
          LEFT JOIN costos_proyectos cp ON p.id = cp.id_proyecto -- Unión con la tabla de costos reales
          LEFT JOIN estatus_comercial ec ON p.id_estatus_comercial = ec.id -- Unión con la tabla estatus_comercial
      WHERE 
          p.id = ?
      GROUP BY 
          p.id, p.numero, p.nombre, p.nombre_cortos, p.codigo_contrato_cliente, -- Campo agregado al GROUP BY
          c.nombre, r.nombre, reg.nombre, c.unidad_negocio, 
          p.costo_estimado, p.monto_ofertado, p.fecha_inicio, p.fecha_final, p.duracion,
          p.observaciones, -- Campo agregado al GROUP BY
          p.monto_estimado_oferta_cliente, -- Campo agregado al GROUP BY
          p.monto_estimado_oferta_cerrado_sdo, -- Campo agregado al GROUP BY
          ec.nombre; -- Nombre del estatus comercial agregado al GROUP BY
    `, [params.id, params.id, params.id, params.id]); // Pasamos el mismo ID cuatro veces: una para cada subconsulta y otra para el filtro principal

    // Verificar si se encontró el proyecto
    if (rows.length === 0) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    // Devolver el primer resultado
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal" });
  }
};
export const postProyect = async (req, res) => {
  try {
    const {
      numero,
      nombre,
      nombreCorto,
      idCliente,
      ofertaDelProveedor,
      idResponsable,
      idRegion,
      idContrato,
      costoEstimado,
      montoOfertado,
      fechaInicio,
      fechaFinal,
      duracion, // Duración es opcional
      observaciones, // Campo agregado
      montoEstimadoOfertaCliente, // Campo agregado
      montoEstimadoOfertaCerradoSdo, // Campo agregado
      idEstatusComercial, // Campo agregado (opcional)
      codigoContratoCliente, // Campo agregado: Código del contrato del cliente
    } = req.body;

    // Validación básica de campos obligatorios
    if (!numero || !nombre || !nombreCorto || !idCliente || !idRegion) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Verificar si el número ya existe en la base de datos
    const [existingProject] = await pool.query("SELECT * FROM proyectos WHERE numero = ?", [numero]);
    if (existingProject.length > 0) {
      return res.status(400).json({ message: "El número de proyecto ya está registrado" });
    }

    // Calcular la duración automáticamente si no se proporciona
    let duracionCalculada = duracion;
    if (!duracion && fechaInicio && fechaFinal) {
      const inicio = new Date(fechaInicio);
      const final = new Date(fechaFinal);

      // Validar que las fechas sean válidas
      if (isNaN(inicio.getTime()) || isNaN(final.getTime())) {
        return res.status(400).json({ message: "Las fechas proporcionadas no son válidas" });
      }

      // Validar que la fecha de inicio sea anterior a la fecha final
      if (inicio >= final) {
        return res.status(400).json({ message: "La fecha de inicio debe ser anterior a la fecha final" });
      }

      const diferenciaEnMilisegundos = final - inicio;
      const dias = Math.ceil(diferenciaEnMilisegundos / (1000 * 60 * 60 * 24)); // Diferencia en días
      duracionCalculada = dias;
    }

    // Insertar el proyecto en la tabla `proyectos`
    const [result] = await pool.query(
      `
      INSERT INTO proyectos (
        numero,
        nombre,
        nombre_cortos,
        id_cliente,
        oferta_del_proveedor,
        id_responsable,
        id_region,
        id_contrato,
        costo_estimado,
        monto_ofertado,
        fecha_inicio,
        fecha_final,
        duracion,
        observaciones, -- Campo agregado
        monto_estimado_oferta_cliente, -- Campo agregado
        monto_estimado_oferta_cerrado_sdo, -- Campo agregado
        id_estatus_comercial, -- Campo agregado (opcional)
        codigo_contrato_cliente -- Campo agregado: Código del contrato del cliente
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        numero,
        nombre,
        nombreCorto,
        idCliente,
        ofertaDelProveedor,
        idResponsable,
        idRegion,
        idContrato || null, // Convertir a NULL si no se proporciona
        parseFloat(costoEstimado) || null, // Convertir a número o NULL
        parseFloat(montoOfertado) || null, // Convertir a número o NULL
        fechaInicio ? new Date(fechaInicio) : null, // Manejo de fechas
        fechaFinal ? new Date(fechaFinal) : null, // Manejo de fechas
        duracionCalculada || null, // Duración calculada o proporcionada
        observaciones || null, // Observaciones o NULL si no se proporciona
        parseFloat(montoEstimadoOfertaCliente) || null, // Monto estimado oferta cliente o NULL
        parseFloat(montoEstimadoOfertaCerradoSdo) || null, // Monto estimado oferta cerrado o NULL
        idEstatusComercial || 1, // ID estatus comercial o NULL si no se proporciona
        codigoContratoCliente || null, // Código del contrato del cliente o NULL si no se proporciona
      ]
    );

    // Obtener el ID del proyecto recién insertado
    const projectId = result.insertId;

    // Recuperar el proyecto recién creado
    const [rows] = await pool.query("SELECT * FROM proyectos WHERE id = ?", [projectId]);

    // Verificar si se recuperó correctamente
    if (rows.length > 0) {
      return res.status(201).json({
        message: "Proyecto creado correctamente",
        data: rows[0], // Devuelve el proyecto recién creado
      });
    } else {
      throw new Error("No se pudo recuperar el proyecto recién creado");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al crear el proyecto" });
  }
};
export const putProyect = async (req, res) => {
  try {
    const { id } = req.params; // ID del proyecto a actualizar
    const updates = req.body; // Todos los campos enviados en la solicitud

    // Validar que al menos un campo esté presente para actualizar
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No se proporcionaron campos para actualizar" });
    }

    // Verificar si el proyecto existe en la base de datos
    const [existingProject] = await pool.query("SELECT * FROM proyectos WHERE id = ?", [id]);
    if (existingProject.length === 0) {
      return res.status(404).json({ message: "El proyecto no existe" });
    }

    // Construir dinámicamente la consulta SQL y los valores
    const fieldsToUpdate = [];
    const values = [];

    for (const key in updates) {
      // Validar que el campo sea válido (para evitar inyecciones SQL)
      if (
        [
          "numero",
          "nombre",
          "nombre_cortos",
          "id_cliente",
          "id_responsable",
          "id_region",
          "oferta_del_proveedor",
          "id_contrato",
          "costo_estimado",
          "monto_ofertado",
          "fecha_inicio",
          "fecha_final",
          "duracion",
          "observaciones",
          "monto_estimado_oferta_cliente",
          "monto_estimado_oferta_cerrado_sdo",
          "id_estatus_comercial",
          "codigo_contrato_cliente", // Campo agregado: Código del contrato del cliente
        ].includes(key)
      ) {
        // Agregar el campo a la lista de campos a actualizar
        fieldsToUpdate.push(`${key} = ?`);
        // Manejar valores nulos o fechas
        if (key === "fecha_inicio" || key === "fecha_final") {
          values.push(updates[key] ? new Date(updates[key]) : null);
        } else if (
          key === "costo_estimado" ||
          key === "monto_ofertado" ||
          key === "monto_estimado_oferta_cliente" ||
          key === "monto_estimado_oferta_cerrado_sdo"
        ) {
          values.push(parseFloat(updates[key]) || null);
        } else {
          values.push(updates[key] || null);
        }
      }
    }

    // Si no hay campos válidos para actualizar, retornar un error
    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ message: "No se proporcionaron campos válidos para actualizar" });
    }

    // Verificar si el número ya está registrado para otro proyecto (si se actualiza el campo "numero")
    if (updates.numero) {
      const [duplicateNumber] = await pool.query("SELECT * FROM proyectos WHERE numero = ? AND id != ?", [
        updates.numero,
        id,
      ]);
      if (duplicateNumber.length > 0) {
        return res.status(400).json({ message: "El número de proyecto ya está registrado para otro proyecto" });
      }
    }

    // Calcular la duración automáticamente si se proporcionan fechaInicio y fechaFinal
    if (updates.fechaInicio && updates.fechaFinal && !updates.duracion) {
      const inicio = new Date(updates.fechaInicio);
      const final = new Date(updates.fechaFinal);

      // Validar que las fechas sean válidas
      if (isNaN(inicio.getTime()) || isNaN(final.getTime())) {
        return res.status(400).json({ message: "Las fechas proporcionadas no son válidas" });
      }

      // Validar que la fecha de inicio sea anterior a la fecha final
      if (inicio >= final) {
        return res.status(400).json({ message: "La fecha de inicio debe ser anterior a la fecha final" });
      }

      const diferenciaEnMilisegundos = final - inicio;
      const dias = Math.ceil(diferenciaEnMilisegundos / (1000 * 60 * 60 * 24)); // Diferencia en días
      fieldsToUpdate.push("duracion = ?");
      values.push(dias);
    }

    // Construir la consulta SQL final
    const query = `
      UPDATE proyectos
      SET ${fieldsToUpdate.join(", ")}
      WHERE id = ?
    `;
    values.push(id); // Agregar el ID del proyecto al final de los valores

    // Ejecutar la consulta
    await pool.query(query, values);

    // Recuperar el proyecto actualizado
    const [rows] = await pool.query("SELECT * FROM proyectos WHERE id = ?", [id]);

    // Verificar si se recuperó correctamente
    if (rows.length > 0) {
      return res.status(200).json({
        message: "Proyecto actualizado correctamente",
        data: rows[0], // Devuelve el proyecto actualizado
      });
    } else {
      throw new Error("No se pudo recuperar el proyecto actualizado");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al actualizar el proyecto" });
  }
};
export const deleteProyect = async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID del proyecto a eliminar del parámetro de URL
    console.log(id);

    // Verificar si el proyecto existe
    const [existingProject] = await pool.query("SELECT * FROM proyectos WHERE id = ?", [id]);
    if (existingProject.length === 0) {
      return res.status(404).json({ message: "El proyecto no existe" });
    }

    // Eliminar registros relacionados en otras tablas
    await pool.query("DELETE FROM avance_fisico WHERE id_proyecto = ?", [id]); // Eliminar avances físicos
    await pool.query("DELETE FROM costos_proyectos WHERE id_proyecto = ?", [id]); // Eliminar costos de proyectos
    await pool.query("DELETE FROM avance_financiero WHERE id_proyecto = ?", [id]); // Eliminar avances financieros
    await pool.query("DELETE FROM requisition WHERE id_proyecto = ?", [id]); // Eliminar requisiciones

    // Finalmente, eliminar el proyecto
    await pool.query("DELETE FROM proyectos WHERE id = ?", [id]);

    // Devolver una respuesta exitosa
    res.status(200).json({
      message: "Proyecto eliminado correctamente",
      id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al eliminar el proyecto" });
  }
};