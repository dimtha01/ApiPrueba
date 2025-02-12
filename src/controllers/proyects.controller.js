import { pool } from "../db.js";

export const getProyects = async (req, res) => {
  try {
    const [rows] = await pool.query(`
        SELECT 
  p.id,
  p.numero,
  p.nombre AS nombre_proyecto,
  c.nombre AS nombre_cliente,
  r.nombre AS nombre_responsable,
  reg.nombre AS nombre_region,
  c.unidad_negocio as unidad_negocio,
  p.costo_estimado,
  p.monto_ofertado,
  p.fecha_inicio,
  p.fecha_final,
  p.duracion
FROM 
  proyectos p
  LEFT JOIN clientes c ON p.id_cliente = c.id
  LEFT JOIN responsables r ON p.id_responsable = r.id
  LEFT JOIN regiones reg ON p.id_region = reg.id
    `);
    res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const postProyect = async (req, res) => {
  try {
    const {
      numero,
      nombre,
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
    if (!numero || !nombre || !idCliente || !idResponsable || !idRegion) {
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
        id_cliente,
        id_responsable,
        id_region,
        id_contrato,
        costo_estimado,
        monto_ofertado,
        fecha_inicio,
        fecha_final,
        duracion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        numero,
        nombre,
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