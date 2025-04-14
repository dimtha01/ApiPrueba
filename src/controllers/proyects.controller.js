import { pool } from "../db.js";

export const getProyects = async (req, res) => {
  try {
    const { region } = req.query; // Obtener el parámetro de consulta 'region'
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
    -- Subconsulta para calcular el monto facturado (estatus 6)
    (SELECT
        SUM(af.monto_usd)
     FROM
        avance_financiero af
        INNER JOIN estatus_proceso ep ON af.id_estatus_proceso = ep.id_estatus
     WHERE
        af.id_proyecto = p.id
        AND ep.id_estatus = 6) AS facturado,
    -- Subconsulta para calcular el monto por valor (estatus diferente de 6)
    (SELECT
        SUM(af.monto_usd)
     FROM
        avance_financiero af
        INNER JOIN estatus_proceso ep ON af.id_estatus_proceso = ep.id_estatus
     WHERE
        af.id_proyecto = p.id
        AND ep.id_estatus = 4) AS por_valuar,
    -- Subconsulta para calcular el monto por factura (estatus relacionado con facturas)
    (SELECT
        SUM(af.monto_usd)
     FROM
        avance_financiero af
        INNER JOIN estatus_proceso ep ON af.id_estatus_proceso = ep.id_estatus
     WHERE
        af.id_proyecto = p.id
        AND ep.id_estatus = 5) AS por_factura, -- Ajusta los IDs según tus necesidades
    MAX(af.avance_real) AS avance_real_maximo,
    MAX(af.avance_planificado) AS avance_planificado_maximo
FROM
    proyectos p
    LEFT JOIN clientes c ON p.id_cliente = c.id
    LEFT JOIN responsables r ON p.id_responsable = r.id
    LEFT JOIN regiones reg ON p.id_region = reg.id
    LEFT JOIN avance_fisico af ON p.id = af.id_proyecto
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

    // Verificar si se encontraron proyectos
    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontraron proyectos para la región especificada" });
    }

    // Devolver los resultados
    res.json(rows);
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
          ) AS costo_real_total -- Costo específico del proyecto con id = 41
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
    `, [params.id, params.id]); // Pasamos el mismo ID dos veces: una para la subconsulta y otra para el filtro principal

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