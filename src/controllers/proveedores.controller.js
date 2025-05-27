import { pool } from "../db.js";

export const getProveedores = async (req, res) => {
  try {
    const [proveedores] = await pool.query(`
      SELECT p.*, 
             e.nombre_completo AS estatus_nombre,
             e.nombre_abreviado AS estatus_abrev,
             e.color AS estatus_color
      FROM proveedores p
      JOIN estatus_proveedor e ON p.estatus_id = e.id
      ORDER BY p.id DESC
    `);
    res.json(proveedores);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener proveedores" });
  }
};

export const getProveedorById = async (req, res) => {
  try {
    const { id } = req.params;
    const [proveedor] = await pool.query(`
      SELECT p.*, 
             e.nombre_completo AS estatus_nombre,
             e.nombre_abreviado AS estatus_abrev,
             e.color AS estatus_color
      FROM proveedores p
      JOIN estatus_proveedor e ON p.estatus_id = e.id
      WHERE p.id = ?
    `, [id]);

    if (proveedor.length === 0) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    res.json(proveedor[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener el proveedor" });
  }
};

export const createProveedor = async (req, res) => {
  try {
    const { nombre_comercial, direccion_fiscal, pais, telefono, email, RIF } = req.body;

    // Validación de campos obligatorios
    if (!nombre_comercial || !direccion_fiscal || !pais) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Validar formato de RIF (ejemplo: J-123456789)

    // Insertar el proveedor (estatus_id = 1 por defecto)
    const [result] = await pool.query(
      `INSERT INTO proveedores 
       (nombre_comercial, direccion_fiscal, pais, telefono, email, RIF) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre_comercial, direccion_fiscal, pais, telefono || "Pendiente", email || "Pendiente", RIF]
    );

    // Obtener el proveedor recién creado con su estatus
    const [newProveedor] = await pool.query(`
      SELECT p.*, 
             e.nombre_completo AS estatus_nombre,
             e.nombre_abreviado AS estatus_abrev,
             e.color AS estatus_color
      FROM proveedores p
      JOIN estatus_proveedor e ON p.estatus_id = e.id
      WHERE p.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: "Proveedor creado exitosamente",
      proveedor: newProveedor[0]
    });
  } catch (error) {
    console.error(error);

    // Manejar error de duplicado de RIF
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: "El RIF ya está registrado" });
    }

    return res.status(500).json({ message: "Error al crear el proveedor" });
  }
};

export const updateProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_comercial, direccion_fiscal, pais, telefono, email, rif, estatus_id } = req.body;

    // Validar que el proveedor existe
    const [proveedorExistente] = await pool.query(
      "SELECT * FROM proveedores WHERE id = ?",
      [id]
    );

    if (proveedorExistente.length === 0) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    // Validar estatus_id si viene en el body
    if (estatus_id) {
      const [estatusValido] = await pool.query(
        "SELECT id FROM estatus_proveedor WHERE id = ?",
        [estatus_id]
      );

      if (estatusValido.length === 0) {
        return res.status(400).json({ message: "Estatus no válido" });
      }
    }

    // Versión segura que funciona con o sin updated_at
    const updateFields = [
      'nombre_comercial = ?',
      'direccion_fiscal = ?',
      'pais = ?',
      'telefono = ?',
      'email = ?',
      'rif = ?',
      'estatus_id = ?'
    ];

    const updateValues = [
      nombre_comercial || proveedorExistente[0].nombre_comercial,
      direccion_fiscal || proveedorExistente[0].direccion_fiscal,
      pais || proveedorExistente[0].pais,
      telefono || proveedorExistente[0].telefono,
      email || proveedorExistente[0].email,
      rif || proveedorExistente[0].rif,
      estatus_id || proveedorExistente[0].estatus_id,
      id
    ];

    // Construir la consulta dinámicamente
    let sql = `UPDATE proveedores SET ${updateFields.join(', ')} WHERE id = ?`;

    await pool.query(sql, updateValues);

    // Obtener el proveedor actualizado
    const [proveedorActualizado] = await pool.query(`
      SELECT p.*, 
             e.nombre_completo AS estatus_nombre,
             e.nombre_abreviado AS estatus_abrev,
             e.color AS estatus_color
      FROM proveedores p
      JOIN estatus_proveedor e ON p.estatus_id = e.id
      WHERE p.id = ?
    `, [id]);

    res.json({
      message: "Proveedor actualizado exitosamente",
      proveedor: proveedorActualizado[0]
    });
  } catch (error) {
    console.error(error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: "El RIF ya está registrado" });
    }

    return res.status(500).json({ message: "Error al actualizar el proveedor" });
  }
};

export const updateEstatusProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { estatus_id, observaciones } = req.body;

    // Validar que el proveedor existe
    const [proveedorExistente] = await pool.query(
      "SELECT * FROM proveedores WHERE id = ?",
      [id]
    );

    if (proveedorExistente.length === 0) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    // Validar estatus_id
    const [estatusValido] = await pool.query(
      "SELECT id FROM estatus_proveedor WHERE id = ?",
      [estatus_id]
    );

    if (estatusValido.length === 0) {
      return res.status(400).json({ message: "Estatus no válido" });
    }

    // Guardar el estatus anterior para el historial
    const estatus_anterior = proveedorExistente[0].estatus_id;

    // Actualizar el estatus del proveedor
    await pool.query(
      "UPDATE proveedores SET estatus_id = ? WHERE id = ?",
      [estatus_id, id]
    );

    // Registrar el cambio en el historial (opcional)
    await pool.query(
      `INSERT INTO historial_estatus 
       (proveedor_id, estatus_anterior, estatus_nuevo, observaciones) 
       VALUES (?, ?, ?, ?)`,
      [id, estatus_anterior, estatus_id, observaciones]
    );

    // Obtener el proveedor actualizado
    const [proveedorActualizado] = await pool.query(`
      SELECT p.*, 
             e.nombre_completo AS estatus_nombre,
             e.nombre_abreviado AS estatus_abrev,
             e.color AS estatus_color
      FROM proveedores p
      JOIN estatus_proveedor e ON p.estatus_id = e.id
      WHERE p.id = ?
    `, [id]);

    res.json({
      message: "Estatus del proveedor actualizado exitosamente",
      proveedor: proveedorActualizado[0]
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al actualizar el estatus del proveedor" });
  }
};

export const deleteProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el proveedor existe
    const [proveedor] = await pool.query(
      "SELECT * FROM proveedores WHERE id = ?",
      [id]
    );

    if (proveedor.length === 0) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    // Eliminar el proveedor
    await pool.query("DELETE FROM proveedores WHERE id = ?", [id]);

    res.sendStatus(204); // No Content
  } catch (error) {
    console.error(error);

    // Manejar error de clave foránea (si hay relaciones)
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        message: "No se puede eliminar el proveedor porque tiene registros relacionados"
      });
    }

    return res.status(500).json({ message: "Error al eliminar el proveedor" });
  }
};

export const getProveedoresByEstatus = async (req, res) => {
  try {
    const { estatus } = req.params; // Puede ser ID o nombre_abreviado

    // Buscar por ID o nombre abreviado
    const [estatusData] = await pool.query(`
      SELECT id FROM estatus_proveedor 
      WHERE id = ? OR nombre_abreviado = ?
    `, [estatus, estatus]);

    if (estatusData.length === 0) {
      return res.status(404).json({ message: "Estatus no encontrado" });
    }

    const estatusId = estatusData[0].id;

    const [proveedores] = await pool.query(`
      SELECT p.*, 
             e.nombre_completo AS estatus_nombre,
             e.nombre_abreviado AS estatus_abrev,
             e.color AS estatus_color
      FROM proveedores p
      JOIN estatus_proveedor e ON p.estatus_id = e.id
      WHERE p.estatus_id = ?
      ORDER BY p.nombre_comercial ASC
    `, [estatusId]);

    res.json(proveedores);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener proveedores por estatus" });
  }
};