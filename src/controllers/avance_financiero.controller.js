import { pool } from "../db.js";

// Obtener todos los avances financieros
export const getAvanceFinanciero = async (req, res) => {
  try {
    // Ejecutar la consulta SQL
    const [rows] = await pool.query(`
      SELECT 
        af.id,
        af.id_proyecto,
        af.fecha,
        af.numero_valuacion,
        af.monto_usd,
        af.numero_factura,
        af.fecha_inicio,
        af.fecha_fin,
        ep.nombre_estatus AS estatus_proceso_nombre,
        ep.descripcion AS estatus_proceso_descripcion
      FROM 
        avance_financiero af
      LEFT JOIN 
        estatus_proceso ep
      ON 
        af.id_estatus_proceso = ep.id_estatus;
    `);
    // Verificar si hay resultados
    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontraron registros de avance financiero" });
    }
    // Devolver los resultados
    res.json(rows);
  } catch (error) {
    // Manejar errores
    console.error("Error al obtener el avance financiero:", error); // Registrar el error en la consola
    return res.status(500).json({ message: "Algo salió mal", error: error.message });
  }
};

// Obtener avances financieros por ID de proyecto
export const getAvanceFinancieroByProyectoId = async (req, res) => {
  try {
    // Obtener el ID del proyecto desde los parámetros de la URL
    const id_proyecto = req.params;
    // Ejecutar la consulta SQL con filtro por id_proyecto
    const [rows] = await pool.query(
      `
      SELECT 
        af.id,
        af.id_proyecto,
        af.fecha,
        af.numero_valuacion,
        af.monto_usd,
        af.numero_factura,
        af.fecha_inicio,
        af.fecha_fin,
        ep.nombre_estatus AS estatus_proceso_nombre,
        ep.descripcion AS estatus_proceso_descripcion
      FROM 
        avance_financiero af
      LEFT JOIN 
        estatus_proceso ep
      ON 
        af.id_estatus_proceso = ep.id_estatus
      WHERE 
        af.id_proyecto = ?;
    `,
      [id_proyecto.id]
    );
    // Verificar si hay resultados
    if (rows.length === 0) {
      return res.status(200).json([]);
    }
    // Devolver los resultados
    res.json(rows);
  } catch (error) {
    // Manejar errores
    console.error("Error al obtener el avance financiero:", error); // Registrar el error en la consola
    return res.status(500).json({ message: "Algo salió mal", error: error.message });
  }
};

// Crear un nuevo registro de avance financiero
export const createAvanceFinanciero = async (req, res) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const {
      id_proyecto,
      fecha,
      numero_valuacion,
      monto_usd,
      numero_factura,
      id_estatus_proceso,
      fecha_inicio,
      fecha_fin,
    } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (
      !id_proyecto ||
      !fecha ||
      !numero_valuacion ||
      !monto_usd ||
      !id_estatus_proceso ||
      !fecha_inicio ||
      !fecha_fin
    ) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Ejecutar la consulta SQL para insertar el nuevo registro
    const [result] = await pool.query(
      `
      INSERT INTO avance_financiero (
        id_proyecto,
        fecha,
        numero_valuacion,
        monto_usd,
        numero_factura,
        id_estatus_proceso,
        fecha_inicio,
        fecha_fin
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `,
      [
        id_proyecto,
        fecha,
        numero_valuacion,
        monto_usd,
        numero_factura || null,
        id_estatus_proceso,
        fecha_inicio,
        fecha_fin,
      ]
    );

    // Verificar si se insertó correctamente
    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "No se pudo insertar el registro" });
    }

    // Devolver el ID del nuevo registro creado
    res.status(201).json({
      message: "Registro de avance financiero creado exitosamente",
      id: result.insertId,
    });
  } catch (error) {
    // Manejar errores
    console.error("Error al crear el avance financiero:", error); // Registrar el error en la consola
    return res.status(500).json({ message: "Algo salió mal", error: error.message });
  }
};
export const updateAvanceFinanciero = async (req, res) => {
  try {
    // Extraer el ID del avance financiero de los parámetros de la URL
    const { id } = req.params;

    // Extraer los datos del cuerpo de la solicitud
    const {
      id_proyecto,
      fecha,
      numero_valuacion,
      monto_usd,
      numero_factura,
      id_estatus_proceso,
      fecha_inicio,
      fecha_fin,
    } = req.body;

    // Validar que se proporcione al menos un campo para actualizar
    if (
      !id_proyecto &&
      !fecha &&
      !numero_valuacion &&
      !monto_usd &&
      !numero_factura &&
      !id_estatus_proceso &&
      !fecha_inicio &&
      !fecha_fin
    ) {
      return res.status(400).json({ message: "Debes proporcionar al menos un campo para actualizar" });
    }

    // Verificar si el registro existe en la base de datos
    const [existingRecord] = await pool.query("SELECT * FROM avance_financiero WHERE id = ?", [id]);
    if (existingRecord.length === 0) {
      return res.status(404).json({ message: "El registro de avance financiero no existe" });
    }

    // Construir dinámicamente la consulta SQL para actualizar solo los campos proporcionados
    const updates = [];
    const values = [];

    if (id_proyecto !== undefined) {
      updates.push("id_proyecto = ?");
      values.push(id_proyecto);
    }
    if (fecha !== undefined) {
      updates.push("fecha = ?");
      values.push(fecha);
    }
    if (numero_valuacion !== undefined) {
      updates.push("numero_valuacion = ?");
      values.push(numero_valuacion);
    }
    if (monto_usd !== undefined) {
      updates.push("monto_usd = ?");
      values.push(monto_usd);
    }
    if (numero_factura !== undefined) {
      updates.push("numero_factura = ?");
      values.push(numero_factura || null);
    }
    if (id_estatus_proceso !== undefined) {
      updates.push("id_estatus_proceso = ?");
      values.push(id_estatus_proceso);
    }
    if (fecha_inicio !== undefined) {
      updates.push("fecha_inicio = ?");
      values.push(fecha_inicio);
    }
    if (fecha_fin !== undefined) {
      updates.push("fecha_fin = ?");
      values.push(fecha_fin);
    }

    // Si no hay campos para actualizar, devolver un error
    if (updates.length === 0) {
      return res.status(400).json({ message: "No se proporcionaron campos válidos para actualizar" });
    }

    // Agregar el ID del registro al final de los valores
    values.push(id);

    // Construir la consulta SQL final
    const query = `
      UPDATE avance_financiero
      SET ${updates.join(", ")}
      WHERE id = ?
    `;

    // Ejecutar la consulta SQL
    const [result] = await pool.query(query, values);

    // Verificar si la actualización fue exitosa
    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "No se pudo actualizar el registro" });
    }

    // Devolver una respuesta exitosa
    res.status(200).json({
      message: `El registro de avance financiero con ID ${id} ha sido actualizado correctamente`,
      data: {
        id,
        id_proyecto,
        fecha,
        numero_valuacion,
        monto_usd,
        numero_factura,
        id_estatus_proceso,
        fecha_inicio,
        fecha_fin,
      },
    });
  } catch (error) {
    console.error("Error al actualizar el avance financiero:", error); // Registrar el error en la consola
    return res.status(500).json({ message: "Ocurrió un error al intentar actualizar el registro." });
  }
};

// Actualizar el estado del avance financiero
export const updateEstatusAvanceFinanciero = async (req, res) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const { id_estatus_proceso, numero_factura, fecha_inicio, fecha_fin } = req.body;
    // Extraer el ID del avance financiero desde los parámetros de la ruta
    const idAvanceFinanciero = req.params.id;

    // Validar que el campo obligatorio esté presente
    if (!id_estatus_proceso || !idAvanceFinanciero) {
      return res.status(400).json({ message: "El campo 'id_estatus_proceso' es obligatorio" });
    }

    // Construir la consulta SQL dinámicamente
    let query = `
      UPDATE avance_financiero 
      SET id_estatus_proceso = ?
    `;
    const queryParams = [id_estatus_proceso];

    // Si se proporciona el número de factura, agregarlo a la consulta
    if (numero_factura !== undefined && numero_factura !== null && numero_factura.trim() !== "") {
      query += `, numero_factura = ?`;
      queryParams.push(numero_factura);
    }

    // Si se proporcionan fechas de inicio o fin, agregarlas a la consulta
    if (fecha_inicio) {
      query += `, fecha_inicio = ?`;
      queryParams.push(fecha_inicio);
    }
    if (fecha_fin) {
      query += `, fecha_fin = ?`;
      queryParams.push(fecha_fin);
    }

    query += ` WHERE id = ?`;
    queryParams.push(idAvanceFinanciero);

    // Ejecutar la consulta SQL
    const [result] = await pool.query(query, queryParams);

    // Verificar si se actualizó correctamente
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No se encontró el avance financiero con el ID proporcionado" });
    }

    // Devolver mensaje exitoso
    res.status(200).json({
      message: "Estado del avance financiero actualizado exitosamente",
      updatedId: idAvanceFinanciero,
      newStatusId: id_estatus_proceso,
      numeroFactura: numero_factura || "No proporcionado",
      fechaInicio: fecha_inicio || "No actualizada",
      fechaFin: fecha_fin || "No actualizada",
    });
  } catch (error) {
    // Manejar errores
    console.error("Error al actualizar el estado del avance financiero:", error);
    return res.status(500).json({ message: "Algo salió mal", error: error.message });
  }
};

export const updateMontoAvanceFinanciero = async (req, res) => {
  try {
    // Extraer el ID del avance financiero y el nuevo monto del cuerpo de la solicitud
    const { id } = req.params; // ID del registro a actualizar
    const { monto_usd } = req.body;

    // Validar que se proporcione el ID y el nuevo monto
    if (!id || monto_usd === undefined || monto_usd === null) {
      return res.status(400).json({ message: "El ID y el monto son obligatorios" });
    }

    // Verificar si el registro existe en la base de datos
    const [existingRecord] = await pool.query("SELECT * FROM avance_financiero WHERE id = ?", [id]);
    if (existingRecord.length === 0) {
      return res.status(404).json({ message: "El registro de avance financiero no existe" });
    }

    // Actualizar el campo `monto_usd` en la tabla `avance_financiero`
    const [result] = await pool.query(
      `
      UPDATE avance_financiero
      SET monto_usd = ?
      WHERE id = ?
    `,
      [monto_usd, id]
    );

    // Verificar si la actualización fue exitosa
    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "No se pudo actualizar el registro" });
    }

    // Devolver una respuesta exitosa
    res.status(200).json({
      message: "Monto del avance financiero actualizado correctamente",
      data: {
        id,
        monto_usd,
      },
    });
  } catch (error) {
    // Manejar errores
    console.error("Error al actualizar el monto del avance financiero:", error); // Registrar el error en la consola
    return res.status(500).json({ message: "Algo salió mal", error: error.message });
  }
};