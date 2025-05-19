import { pool } from "../db.js";

export const getProyectsAll = async (req, res) => {
  try {
    let query = `
      SELECT 
    p.id,
    p.numero,
    p.nombre AS nombre_proyecto,
    p.nombre_cortos,
    c.nombre AS nombre_cliente,
    r.nombre AS nombre_responsable,
    reg.nombre AS nombre_region,
    c.unidad_negocio AS unidad_negocio,
    p.costo_estimado,
    p.monto_ofertado,
    p.fecha_inicio,
    p.fecha_final,
    p.duracion,
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

    `;

    query += `
      GROUP BY 
    p.id,
    p.numero,
    p.nombre,
    p.nombre_cortos,
    c.nombre,
    r.nombre,
    reg.nombre,
    c.unidad_negocio,
    p.costo_estimado,
    p.monto_ofertado,
    p.fecha_inicio,
    p.fecha_final,
    p.duracion;
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
    c.nombre AS nombre_cliente,
    r.nombre AS nombre_responsable,
    reg.nombre AS nombre_region,
    c.unidad_negocio AS unidad_negocio,
    p.costo_estimado,
    p.monto_ofertado,
    p.fecha_inicio,
    p.fecha_final,
    p.duracion,
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
    `;

    // Agregar condición WHERE si se proporciona el parámetro 'region'
    const queryParams = [];
    if (region) {
      // Validar que el parámetro 'region' no esté vacío
      if (!region.trim()) {
        return res.status(400).json({ message: "El nombre de la región no puede estar vacío" });
      }
      query += " WHERE reg.nombre = ?";
      queryParams.push(region);
    }

    query += `
     GROUP BY 
    p.id,
    p.numero,
    p.nombre,
    p.nombre_cortos,
    c.nombre,
    r.nombre,
    reg.nombre,
    c.unidad_negocio,
    p.costo_estimado,
    p.monto_ofertado,
    p.fecha_inicio,
    p.fecha_final,
    p.duracion;
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
          c.nombre AS nombre_cliente,
          r.nombre AS nombre_responsable,
          reg.nombre AS nombre_region,
          c.unidad_negocio AS unidad_negocio,
          p.costo_estimado,
          p.monto_ofertado,
          p.fecha_inicio,
          p.fecha_final,
          p.duracion,
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
      WHERE 
          p.id = ?
      GROUP BY 
          p.id, p.numero, p.nombre, c.nombre, r.nombre, reg.nombre, c.unidad_negocio, 
          p.costo_estimado, p.monto_ofertado, p.fecha_inicio, p.fecha_final, p.duracion;
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
}
export const postProyect = async (req, res) => {
  try {
    const {
      numero,
      nombre,
      nombreCorto,
      idCliente,
      idResponsable,
      idRegion,
      idContrato,
      costoEstimado,
      montoOfertado,
      fechaInicio,
      fechaFinal,
      duracion, // Duración es opcional
    } = req.body;

    // // Validación básica de campos obligatorios
    if (!numero || !nombre || !nombreCorto || !idCliente || !idResponsable || !idRegion) {
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
        id_responsable,
        id_region,
        id_contrato,
        costo_estimado,
        monto_ofertado,
        fecha_inicio,
        fecha_final,
        duracion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        numero,
        nombre,
        nombreCorto,
        idCliente,
        idResponsable,
        idRegion,
        idContrato || null, // Convertir a NULL si no se proporciona
        parseFloat(costoEstimado) || null, // Convertir a número o NULL
        parseFloat(montoOfertado) || null, // Convertir a número o NULL
        fechaInicio ? new Date(fechaInicio) : null, // Manejo de fechas
        fechaFinal ? new Date(fechaFinal) : null, // Manejo de fechas
        duracionCalculada || null, // Duración calculada o proporcionada
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
    const {
      numero,
      nombre,
      nombreCorto,
      idCliente,
      idResponsable,
      idRegion,
      idContrato,
      costoEstimado,
      montoOfertado,
      fechaInicio,
      fechaFinal,
      duracion, // Duración es opcional
    } = req.body;

    // Validación básica de campos obligatorios
    if (!numero || !nombre || !nombreCorto || !idCliente || !idResponsable || !idRegion) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Verificar si el proyecto existe en la base de datos
    const [existingProject] = await pool.query("SELECT * FROM proyectos WHERE id = ?", [id]);
    if (existingProject.length === 0) {
      return res.status(404).json({ message: "El proyecto no existe" });
    }

    // Verificar si el número ya está registrado para otro proyecto
    const [duplicateNumber] = await pool.query("SELECT * FROM proyectos WHERE numero = ? AND id != ?", [
      numero,
      id,
    ]);
    if (duplicateNumber.length > 0) {
      return res.status(400).json({ message: "El número de proyecto ya está registrado para otro proyecto" });
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

    // Actualizar el proyecto en la tabla `proyectos`
    await pool.query(
      `
      UPDATE proyectos
      SET 
        numero = ?,
        nombre = ?,
        nombre_cortos = ?,
        id_cliente = ?,
        id_responsable = ?,
        id_region = ?,
        id_contrato = ?,
        costo_estimado = ?,
        monto_ofertado = ?,
        fecha_inicio = ?,
        fecha_final = ?,
        duracion = ?
      WHERE id = ?
    `,
      [
        numero,
        nombre,
        nombreCorto,
        idCliente,
        idResponsable,
        idRegion,
        idContrato || null, // Convertir a NULL si no se proporciona
        parseFloat(costoEstimado) || null, // Convertir a número o NULL
        parseFloat(montoOfertado) || null, // Convertir a número o NULL
        fechaInicio ? new Date(fechaInicio) : null, // Manejo de fechas
        fechaFinal ? new Date(fechaFinal) : null, // Manejo de fechas
        duracionCalculada || null, // Duración calculada o proporcionada
        id, // ID del proyecto a actualizar
      ]
    );

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