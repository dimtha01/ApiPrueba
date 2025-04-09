import { pool } from "../db.js"

export const getProveedores = async (req, res) => {
  const [result] = await pool.query(`SELECT * FROM proveedores`);
  res.json(result);

}

export const createProveedor = async (req, res) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const { nombre_comercial, direccion_fiscal, pais, telefono, email, RIF } = req.body;

    // Validar que todos los campos obligatorios estén presentes
    if (!nombre_comercial || !direccion_fiscal || !pais || !telefono || !email || !RIF) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Insertar el nuevo proveedor en la base de datos
    const [result] = await pool.query(
      `INSERT INTO proveedores (nombre_comercial, direccion_fiscal, pais, telefono, email, RIF) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre_comercial, direccion_fiscal, pais, telefono, email, RIF]
    );

    // Devolver el ID del nuevo proveedor creado
    res.status(201).json({
      message: "Proveedor creado exitosamente",
      id: result.insertId,
      nombre_comercial,
      direccion_fiscal,
      pais,
      telefono,
      email,
      RIF
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Algo salió mal" });
  }
};