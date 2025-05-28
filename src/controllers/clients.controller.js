import { pool } from "../db.js";

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
        c.id_region,
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
}

export const createCliente = async (req, res) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const {
      nombre,
      razon_social,
      nombre_comercial,
      direccion_fiscal,
      pais,
      id_region,
      unidad_negocio,
      email, // Opcional
      telefono, // Opcional
      direccion, // Opcional
    } = req.body;

    // Validar que se proporcionen todos los campos obligatorios
    if (
      !nombre ||
      !razon_social ||
      !direccion_fiscal ||
      !pais ||
      !id_region ||
      !unidad_negocio
    ) {
      return res.status(400).json({ message: "Todos los campos obligatorios deben ser proporcionados" });
    }

    // Ejecutar la consulta SQL para insertar el nuevo cliente
    const [result] = await pool.query(
      `INSERT INTO clientes 
        (nombre, razon_social, nombre_comercial, direccion_fiscal, pais, id_region, unidad_negocio, email, telefono, direccion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        razon_social,
        nombre_comercial || null, // Permitir valores nulos
        direccion_fiscal,
        pais,
        id_region,
        unidad_negocio,
        email || null, // Permitir valores nulos
        telefono || null, // Permitir valores nulos
        direccion || null, // Permitir valores nulos
      ]
    );

    // Devolver el ID del cliente insertado y un mensaje personalizado
    res.status(201).json({
      id: result.insertId,
      nombre,
      razon_social,
      nombre_comercial,
      direccion_fiscal,
      pais,
      id_region,
      unidad_negocio,
      email,
      telefono,
      direccion,
      message: `El cliente "${nombre}" ha sido creado exitosamente.`,
    });
  } catch (error) {
    console.error(error); // Registrar el error en la consola para depuración
    return res.status(500).json({ message: "Ocurrió un error al intentar crear el cliente." });
  }
};

export const updateCliente = async (req, res) => {
  try {
    // Extraer el ID del cliente de los parámetros de la URL
    const { id } = req.params;

    // Extraer los datos del cuerpo de la solicitud
    const {
      nombre,
      razon_social,
      nombre_comercial,
      direccion_fiscal,
      pais,
      id_region,
      unidad_negocio,
      email, // Opcional
      telefono, // Opcional
      direccion, // Opcional
    } = req.body;

    // Validar que se proporcionen al menos algunos campos para actualizar
    if (
      !nombre &&
      !razon_social &&
      !nombre_comercial &&
      !direccion_fiscal &&
      !pais &&
      !id_region &&
      !unidad_negocio &&
      !email &&
      !telefono &&
      !direccion
    ) {
      return res.status(400).json({ message: "Debes proporcionar al menos un campo para actualizar" });
    }

    // Verificar si el cliente existe en la base de datos
    const [existingClient] = await pool.query("SELECT * FROM clientes WHERE id = ?", [id]);
    if (existingClient.length === 0) {
      return res.status(404).json({ message: "El cliente no existe" });
    }

    // Construir dinámicamente la consulta SQL para actualizar solo los campos proporcionados
    const updates = [];
    const values = [];

    if (nombre !== undefined) {
      updates.push("nombre = ?");
      values.push(nombre);
    }
    if (razon_social !== undefined) {
      updates.push("razon_social = ?");
      values.push(razon_social);
    }
    if (nombre_comercial !== undefined) {
      updates.push("nombre_comercial = ?");
      values.push(nombre_comercial || null);
    }
    if (direccion_fiscal !== undefined) {
      updates.push("direccion_fiscal = ?");
      values.push(direccion_fiscal);
    }
    if (pais !== undefined) {
      updates.push("pais = ?");
      values.push(pais);
    }
    if (id_region !== undefined) {
      updates.push("id_region = ?");
      values.push(id_region);
    }
    if (unidad_negocio !== undefined) {
      updates.push("unidad_negocio = ?");
      values.push(unidad_negocio);
    }
    if (email !== undefined) {
      updates.push("email = ?");
      values.push(email || null);
    }
    if (telefono !== undefined) {
      updates.push("telefono = ?");
      values.push(telefono || null);
    }
    if (direccion !== undefined) {
      updates.push("direccion = ?");
      values.push(direccion || null);
    }

    // Si no hay campos para actualizar, devolver un error
    if (updates.length === 0) {
      return res.status(400).json({ message: "No se proporcionaron campos válidos para actualizar" });
    }

    // Agregar el ID del cliente al final de los valores
    values.push(id);

    // Construir la consulta SQL final
    const query = `
      UPDATE clientes
      SET ${updates.join(", ")}
      WHERE id = ?
    `;

    // Ejecutar la consulta SQL
    const [result] = await pool.query(query, values);

    // Verificar si la actualización fue exitosa
    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "No se pudo actualizar el cliente" });
    }

    // Devolver una respuesta exitosa
    res.status(200).json({
      message: `El cliente con ID ${id} ha sido actualizado correctamente`,
      data: {
        id,
        nombre,
        razon_social,
        nombre_comercial,
        direccion_fiscal,
        pais,
        id_region,
        unidad_negocio,
        email,
        telefono,
        direccion,
      },
    });
  } catch (error) {
    console.error("Error al actualizar el cliente:", error); // Registrar el error en la consola
    return res.status(500).json({ message: "Ocurrió un error al intentar actualizar el cliente." });
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
