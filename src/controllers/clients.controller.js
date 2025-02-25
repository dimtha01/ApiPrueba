import { pool } from "../db.js";

// Obtener clientes filtrados por nombre de región
export const getClientes = async (req, res) => {
  try {
    // Extraer el parámetro de la región desde la query de la URL
    const { region } = req.query;

    // Construir la consulta SQL dinámicamente
    let query = `
      SELECT 
        c.id, 
        c.nombre, 
        c.email, 
        c.telefono, 
        c.direccion, 
        c.unidad_negocio, 
        c.razon_social, 
        c.nombre_comercial, 
        r.nombre AS region
      FROM clientes c
      LEFT JOIN regiones r ON c.id_region = r.id
    `;

    // Agregar la cláusula WHERE si se proporciona el nombre de la región
    if (region) {
      query += ` WHERE r.nombre = ?`;
    }

    // Ejecutar la consulta con o sin el filtro de región
    const [rows] = await pool.query(query, region ? [region] : []);

    // Devolver los resultados en formato JSON
    res.json(rows);
  } catch (error) {
    console.error(error); // Registrar el error en la consola para depuración
    return res.status(500).json({ message: "Ocurrió un error al intentar obtener los clientes." });
  }
};