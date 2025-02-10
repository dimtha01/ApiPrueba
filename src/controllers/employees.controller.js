import { pool } from "../db.js";

export const getClientes = async (req, res) => {
  try {
    const [rows] = await pool.query(`
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
    `);
    res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const createCliente = async (req, res) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const { nombre, nombre_comercial, rif, direccion_fiscal, pais, estado_id, unidad_negocio_id } = req.body;

    // Validar que se proporcionen todos los campos necesarios
    if (!nombre || !nombre_comercial || !rif || !direccion_fiscal || !pais || !estado_id || !unidad_negocio_id) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Ejecutar la consulta SQL para insertar el nuevo cliente
    const [result] = await pool.query(
      `INSERT INTO cliente (nombre, nombre_comercial, rif, direccion_fiscal, pais, estado_id, unidad_negocio_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, nombre_comercial, rif, direccion_fiscal, pais, estado_id, unidad_negocio_id]
    );

    // Devolver el ID del cliente insertado
    res.status(201).json({
      id: result.insertId,
      nombre,
      nombre_comercial,
      rif,
      direccion_fiscal,
      pais,
      estado_id,
      unidad_negocio_id,
      message: "Cliente creado exitosamente"
    });
  } catch (error) {
    console.error(error); // Registrar el error en la consola para depuración
    return res.status(500).json({ message: "Algo salió mal al crear el cliente" });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("DELETE FROM employee WHERE id = ?", [id]);

    if (rows.affectedRows <= 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { name, salary } = req.body;
    const [rows] = await pool.query(
      "INSERT INTO employee (name, salary) VALUES (?, ?)",
      [name, salary]
    );
    res.status(201).json({ id: rows.insertId, name, salary });
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, salary } = req.body;

    const [result] = await pool.query(
      "UPDATE employee SET name = IFNULL(?, name), salary = IFNULL(?, salary) WHERE id = ?",
      [name, salary, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Employee not found" });

    const [rows] = await pool.query("SELECT * FROM employee WHERE id = ?", [
      id,
    ]);

    res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};
