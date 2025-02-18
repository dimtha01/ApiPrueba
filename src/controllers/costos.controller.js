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

    // Consultar el costo ofertado del proyecto
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

    // Consultar los costos asociados al proyecto
    const [costosResult] = await pool.query(
      `
      SELECT 
        id,
        fecha,
        costo,
        monto_sobrepasado
      FROM 
        costos_proyectos
      WHERE 
        id_proyecto = ?
      ORDER BY 
        fecha DESC
      `,
      [id]
    );

    // Devolver la respuesta con los datos solicitados
    res.status(200).json({
      message: "Costos obtenidos exitosamente.",
      costosOfertado: costoOfertado, // Incluir el costo ofertado
      costos: costosResult, // Incluir los costos recuperados
    });
  } catch (error) {
    console.error("Error al obtener los costos:", error);
    res.status(500).json({
      message: "Ocurrió un error al procesar la solicitud.",
    });
  }
}; export const createCostos = async (req, res) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const { id_proyecto, fecha, costo, monto_sobrepasado } = req.body;

    // Validar que los campos obligatorios estén presentes
    if (!id_proyecto || !fecha || !costo) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios: id_proyecto, fecha y costo.",
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

    // Verificar que el proyecto exista en la base de datos
    const [proyecto] = await pool.query("SELECT id FROM proyectos WHERE id = ?", [id_proyecto]);
    if (proyecto.length === 0) {
      return res.status(400).json({
        message: "El proyecto con el ID proporcionado no existe.",
      });
    }

    // Insertar el nuevo costo en la base de datos
    const [result] = await pool.query(
      "INSERT INTO costos_proyectos (id_proyecto, fecha, costo, monto_sobrepasado) VALUES (?, ?, ?, ?)",
      [id_proyecto, fecha, costoNumerico, sobrecostoNumerico]
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
      },
    });
  } catch (error) {
    console.error("Error al agregar el costo:", error);
    res.status(500).json({
      message: "Ocurrió un error al procesar la solicitud.",
    });
  }
};