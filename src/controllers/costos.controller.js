import { pool } from "../db.js";

export const getCostosByProyecto = async (req, res) => {
  try {
    // Extraer el ID del proyecto desde los parámetros de la URL
    const { id } = req.params;

    // Validar que el ID sea un número válido
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        message: "El ID del proyecto es obligatorio y debe ser un número válido.",
      });
    }

    // Consultar el costo ofertado (costo_estimado) del proyecto
    const [proyectoResult] = await pool.query(
      "SELECT costo_estimado FROM proyectos WHERE id = ?",
      [id]
    );

    // Si no existe el proyecto, devolver un error
    if (proyectoResult.length === 0) {
      return res.status(404).json({
        message: "No se encontró ningún proyecto con el ID proporcionado.",
      });
    }

    const costoOfertado = proyectoResult[0].costo_estimado;

    // Consultar el total de monto anticipado (monto_anticipo) asociado al proyecto
    const [montoAnticipoResult] = await pool.query(
      `
      SELECT 
        COALESCE(SUM(req.monto_anticipo), 0) AS total_monto_anticipo
      FROM 
        requisition req
      WHERE 
        req.id_proyecto = ?
      `,
      [id]
    );

    const totalMontoAnticipo = montoAnticipoResult[0]?.total_monto_anticipo || 0;

    // Consultar el total de la amortización asociada al proyecto
    const [amortizacionResult] = await pool.query(
      `
      SELECT 
        COALESCE(SUM(c.amortizacion), 0) AS total_amortizacion
      FROM 
        costos_proyectos c
      WHERE 
        c.id_proyecto = ?
      `,
      [id]
    );

    const totalAmortizacion = amortizacionResult[0]?.total_amortizacion || 0;

    // Consultar los costos asociados al proyecto (incluyendo amortización)
    const [costosResult] = await pool.query(
      `
      SELECT 
        id,
        fecha,
        costo,
        monto_sobrepasado,
        fecha_inicio,
        fecha_fin,
        e.nombre_estatus,
        numero_valuacion,
        amortizacion -- Agregamos el campo amortización aquí
      FROM 
        costos_proyectos c
      JOIN estatus_proceso e ON c.id_estatus = e.id_estatus
      WHERE 
        id_proyecto = ?
      ORDER BY 
        id DESC
      `,
      [id]
    );

    // Consultar el costo total de las órdenes de compra asociadas al proyecto
    const [CostoOrdenesCompra] = await pool.query(
      `
      SELECT 
        COALESCE(SUM(r.monto_total), 0) AS Costo_ordenes_Compra
      FROM 
        requisition r
      INNER JOIN proyectos p ON r.id_proyecto = p.id
      WHERE 
        p.id = ?
      `,
      [id] // Usamos el ID dinámico en lugar de un valor fijo
    );

    const costoOrdenesCompra = CostoOrdenesCompra[0]?.Costo_ordenes_Compra || 0;

    // Devolver la respuesta con los datos solicitados
    res.status(200).json({
      message: "Costos obtenidos exitosamente.",
      costosOfertado: costoOfertado, // Costo ofertado del proyecto
      totalMontoAnticipo: totalMontoAnticipo, // Total de monto anticipado
      totalAmortizacion: totalAmortizacion, // Total de la amortización
      CostoOrdenesCompra: costoOrdenesCompra, // Costo total de las órdenes de compra
      costos: costosResult, // Detalle de los costos asociados al proyecto
    });
  } catch (error) {
    console.error("Error al obtener los costos:", error);
    res.status(500).json({
      message: "Ocurrió un error al procesar la solicitud.",
    });
  }
};

export const updateCostoEstatus = async (req, res) => {
  try {
    // Extraer el ID del costo y el nuevo estatus de los parámetros
    const { id } = req.params; // ID del costo
    const { id_estatus } = req.body; // Nuevo estatus

    // Validar que el ID sea un número válido
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        message: "El ID del costo es obligatorio y debe ser un número válido.",
      });
    }

    // Validar que el campo id_estatus esté presente
    if (id_estatus === undefined || isNaN(parseInt(id_estatus))) {
      return res.status(400).json({
        message: "El campo id_estatus es obligatorio y debe ser un número válido.",
      });
    }

    // Consultar si existe el registro del costo
    const [costoResult] = await pool.query(
      "SELECT id FROM costos_proyectos WHERE id = ?",
      [id]
    );

    // Si no existe el costo, devolver un error
    if (costoResult.length === 0) {
      return res.status(404).json({
        message: "No se encontró ningún costo con el ID proporcionado.",
      });
    }

    // Actualizar el estatus del costo
    const query = `
      UPDATE costos_proyectos 
      SET id_estatus = ? 
      WHERE id = ?
    `;

    const [result] = await pool.query(query, [id_estatus, id]);

    // Verificar si se actualizó algún registro
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "No se pudo actualizar el estatus del costo.",
      });
    }

    // Devolver una respuesta exitosa
    res.status(200).json({
      message: "Estatus del costo actualizado exitosamente.",
      id,
      id_estatus,
    });
  } catch (error) {
    console.error("Error al actualizar el estatus del costo:", error);
    res.status(500).json({
      message: "Ocurrió un error al procesar la solicitud.",
    });
  }
};

export const createCostos = async (req, res) => {
  try {
    // Extraer los datos del cuerpo de la solicitud (incluyendo amortización)
    const {
      id_proyecto,
      fecha,
      costo,
      monto_sobrepasado,
      fecha_inicio,
      fecha_fin,
      numero_valuacion,
      amortizacion, // Nuevo campo agregado aquí
    } = req.body;

    // Validar que los campos obligatorios estén presentes
    if (!id_proyecto || !fecha || !costo || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios: id_proyecto, fecha, costo, fecha_inicio y fecha_fin.",
      });
    }

    // Validar que el costo sea un número mayor que 0
    const costoNumerico = parseFloat(costo);
    if (isNaN(costoNumerico) || costoNumerico <= 0) {
      return res.status(400).json({
        message: "El costo debe ser un número mayor que 0.",
      });
    }

    // Validar que el sobrecosto (si existe) sea un número mayor o igual a 0
    let sobrecostoNumerico = 0; // Valor predeterminado si no se proporciona
    if (monto_sobrepasado !== undefined && monto_sobrepasado !== null) {
      sobrecostoNumerico = parseFloat(monto_sobrepasado);
      if (isNaN(sobrecostoNumerico) || sobrecostoNumerico < 0) {
        return res.status(400).json({
          message: "El monto sobrepasado debe ser un número mayor o igual a 0.",
        });
      }
    }

    // Validar que la amortización (si existe) sea un número mayor o igual a 0
    let amortizacionNumerica = 0; // Valor predeterminado si no se proporciona
    if (amortizacion !== undefined && amortizacion !== null) {
      amortizacionNumerica = parseFloat(amortizacion);
      if (isNaN(amortizacionNumerica) || amortizacionNumerica < 0) {
        return res.status(400).json({
          message: "La amortización debe ser un número mayor o igual a 0.",
        });
      }
    }

    // Validar que numero_valuacion tenga un formato adecuado (opcional)
    if (numero_valuacion !== undefined && numero_valuacion !== null) {
      if (typeof numero_valuacion !== "string" || numero_valuacion.trim() === "") {
        return res.status(400).json({
          message: "El número de valuación debe ser una cadena de texto válida.",
        });
      }
    }

    // Verificar que el proyecto exista en la base de datos
    const [proyecto] = await pool.query("SELECT id FROM proyectos WHERE id = ?", [id_proyecto]);
    if (proyecto.length === 0) {
      return res.status(400).json({
        message: "El proyecto con el ID proporcionado no existe.",
      });
    }

    // Insertar el nuevo costo en la base de datos (incluyendo amortización)
    const [result] = await pool.query(
      "INSERT INTO costos_proyectos (id_proyecto, fecha, costo, monto_sobrepasado, fecha_inicio, fecha_fin, numero_valuacion, amortizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id_proyecto,
        fecha,
        costoNumerico,
        sobrecostoNumerico,
        fecha_inicio,
        fecha_fin,
        numero_valuacion,
        amortizacionNumerica, // Incluye la amortización en la inserción
      ]
    );

    // Devolver una respuesta exitosa con el ID del nuevo registro
    res.status(201).json({
      message: "Costo agregado exitosamente.",
      costo: {
        id: result.insertId,
        id_proyecto,
        fecha,
        costo: costoNumerico,
        monto_sobrepasado: sobrecostoNumerico,
        fecha_inicio,
        fecha_fin,
        numero_valuacion, // Incluye el número de valuación en la respuesta
        amortizacion: amortizacionNumerica, // Incluye la amortización en la respuesta
      },
    });
  } catch (error) {
    console.error("Error al agregar el costo:", error);
    res.status(500).json({
      message: "Ocurrió un error al procesar la solicitud.",
    });
  }
};

export const updateCostos = async (req, res) => {
  try {
    // Extraer el ID del costo de los parámetros de la URL
    const { id } = req.params;

    // Extraer los datos del cuerpo de la solicitud
    const { id_proyecto, fecha, costo, monto_sobrepasado, fecha_inicio, fecha_fin } = req.body;

    // Validar que se proporcione al menos un campo para actualizar
    if (
      !id_proyecto &&
      !fecha &&
      !costo &&
      !monto_sobrepasado &&
      !fecha_inicio &&
      !fecha_fin
    ) {
      return res.status(400).json({
        message: "Debes proporcionar al menos un campo para actualizar.",
      });
    }

    // Verificar si el registro existe en la base de datos
    const [existingRecord] = await pool.query("SELECT * FROM costos_proyectos WHERE id = ?", [id]);
    if (existingRecord.length === 0) {
      return res.status(404).json({
        message: "El registro de costo no existe.",
      });
    }

    // Validar que el proyecto exista si se proporciona un nuevo id_proyecto
    if (id_proyecto !== undefined) {
      const [proyecto] = await pool.query("SELECT id FROM proyectos WHERE id = ?", [id_proyecto]);
      if (proyecto.length === 0) {
        return res.status(400).json({
          message: "El proyecto con el ID proporcionado no existe.",
        });
      }
    }

    // Validar que el costo sea un número mayor que 0 si se proporciona
    let costoNumerico;
    if (costo !== undefined) {
      costoNumerico = parseFloat(costo);
      if (isNaN(costoNumerico) || costoNumerico <= 0) {
        return res.status(400).json({
          message: "El costo debe ser un número mayor que 0.",
        });
      }
    }

    // Validar que el sobrecosto sea un número mayor o igual a 0 si se proporciona
    let sobrecostoNumerico;
    if (monto_sobrepasado !== undefined) {
      sobrecostoNumerico = parseFloat(monto_sobrepasado);
      if (isNaN(sobrecostoNumerico) || sobrecostoNumerico < 0) {
        return res.status(400).json({
          message: "El monto sobrepasado debe ser un número mayor o igual a 0.",
        });
      }
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
    if (costo !== undefined) {
      updates.push("costo = ?");
      values.push(costoNumerico);
    }
    if (monto_sobrepasado !== undefined) {
      updates.push("monto_sobrepasado = ?");
      values.push(sobrecostoNumerico);
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
      return res.status(400).json({
        message: "No se proporcionaron campos válidos para actualizar.",
      });
    }

    // Agregar el ID del registro al final de los valores
    values.push(id);

    // Construir la consulta SQL final
    const query = `
      UPDATE costos_proyectos
      SET ${updates.join(", ")}
      WHERE id = ?
    `;

    // Ejecutar la consulta SQL
    const [result] = await pool.query(query, values);

    // Verificar si la actualización fue exitosa
    if (result.affectedRows === 0) {
      return res.status(500).json({
        message: "No se pudo actualizar el registro.",
      });
    }

    // Devolver una respuesta exitosa
    res.status(200).json({
      message: `El registro de costo con ID ${id} ha sido actualizado correctamente.`,
      data: {
        id,
        id_proyecto,
        fecha,
        costo: costoNumerico,
        monto_sobrepasado: sobrecostoNumerico,
        fecha_inicio,
        fecha_fin,
      },
    });
  } catch (error) {
    console.error("Error al actualizar el costo:", error);
    return res.status(500).json({
      message: "Ocurrió un error al intentar actualizar el registro.",
    });
  }
};

export const updateCosto = async (req, res) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const { id } = req.params; // ID del costo a actualizar
    const { fecha, costo, monto_sobrepasado, fecha_inicio, fecha_fin, numero_valuacion, amortizacion } = req.body;

    // Validar que al menos un campo esté presente para actualizar
    if (
      !fecha &&
      costo === undefined &&
      monto_sobrepasado === undefined &&
      !fecha_inicio &&
      !fecha_fin &&
      numero_valuacion === undefined &&
      amortizacion === undefined
    ) {
      return res.status(400).json({
        message: "Debes proporcionar al menos un campo para actualizar.",
      });
    }

    // Validar que el costo sea un número mayor que 0 (si se proporciona)
    if (costo !== undefined) {
      const costoNumerico = parseFloat(costo);
      if (isNaN(costoNumerico) || costoNumerico <= 0) {
        return res.status(400).json({
          message: "El costo debe ser un número mayor que 0.",
        });
      }
    }

    // Validar que el sobrecosto sea un número mayor o igual a 0 (si se proporciona)
    if (monto_sobrepasado !== undefined) {
      const sobrecostoNumerico = parseFloat(monto_sobrepasado);
      if (isNaN(sobrecostoNumerico) || sobrecostoNumerico < 0) {
        return res.status(400).json({
          message: "El monto sobrepasado debe ser un número mayor o igual a 0.",
        });
      }
    }

    // Validar que la amortización sea un número mayor o igual a 0 (si se proporciona)
    if (amortizacion !== undefined) {
      const amortizacionNumerica = parseFloat(amortizacion);
      if (isNaN(amortizacionNumerica) || amortizacionNumerica < 0) {
        return res.status(400).json({
          message: "La amortización debe ser un número mayor o igual a 0.",
        });
      }
    }

    // Validar que numero_valuacion tenga un formato adecuado (si se proporciona)
    if (numero_valuacion !== undefined && numero_valuacion !== null) {
      if (typeof numero_valuacion !== "string" || numero_valuacion.trim() === "") {
        return res.status(400).json({
          message: "El número de valuación debe ser una cadena de texto válida.",
        });
      }
    }

    // Verificar que el costo exista en la base de datos
    const [costoExistente] = await pool.query("SELECT * FROM costos_proyectos WHERE id = ?", [id]);
    if (costoExistente.length === 0) {
      return res.status(404).json({
        message: "El costo con el ID proporcionado no existe.",
      });
    }

    // Construir la consulta dinámica para actualizar solo los campos proporcionados
    let query = "UPDATE costos_proyectos SET ";
    const updates = [];
    const values = [];

    if (fecha) {
      updates.push("fecha = ?");
      values.push(fecha);
    }
    if (costo !== undefined) {
      updates.push("costo = ?");
      values.push(parseFloat(costo));
    }
    if (monto_sobrepasado !== undefined) {
      updates.push("monto_sobrepasado = ?");
      values.push(parseFloat(monto_sobrepasado));
    }
    if (fecha_inicio) {
      updates.push("fecha_inicio = ?");
      values.push(fecha_inicio);
    }
    if (fecha_fin) {
      updates.push("fecha_fin = ?");
      values.push(fecha_fin);
    }
    if (numero_valuacion !== undefined) {
      updates.push("numero_valuacion = ?");
      values.push(numero_valuacion);
    }
    if (amortizacion !== undefined) {
      updates.push("amortizacion = ?");
      values.push(parseFloat(amortizacion)); // Añadir la amortización a la consulta
    }

    // Agregar el ID al final de los valores
    values.push(id);

    // Completar la consulta
    query += updates.join(", ") + " WHERE id = ?";

    // Ejecutar la consulta
    await pool.query(query, values);

    // Devolver una respuesta exitosa
    res.status(200).json({
      message: "Costo actualizado exitosamente.",
    });
  } catch (error) {
    console.error("Error al actualizar el costo:", error);
    res.status(500).json({
      message: "Ocurrió un error al procesar la solicitud.",
    });
  }
};