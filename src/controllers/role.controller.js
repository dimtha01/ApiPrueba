// src/controllers/role.controller.js

import { pool } from "../db.js"


// @desc    Get all roles
// @route   GET /api/roles
// @access  Private/Admin
export const getRoles = async (req, res) => {
  try {
    const [roles] = await pool.query("SELECT * FROM roles")

    res.status(200).json({
      success: true,
      count: roles.length,
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        permissionEdit: role.permissionEdit === 1, // Convert to boolean
        createdAt: role.createdAt,
      })),
    })
  } catch (error) {
    console.error("Get roles error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get role by ID
// @route   GET /api/roles/:id
// @access  Private/Admin
export const getRoleById = async (req, res) => {
  try {
    const [roles] = await pool.query("SELECT * FROM roles WHERE id = ?", [req.params.id])

    if (roles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      })
    }

    const role = roles[0]

    res.status(200).json({
      success: true,
      role: {
        id: role.id,
        name: role.name,
        permissionEdit: role.permissionEdit === 1, // Convert to boolean
        createdAt: role.createdAt,
      },
    })
  } catch (error) {
    console.error("Get role by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Create a new role
// @route   POST /api/roles
// @access  Private/Admin
export const createRole = async (req, res) => {
  try {
    const { name, permissionEdit = true } = req.body

    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      })
    }

    // Check if role already exists
    const [existingRoles] = await pool.query("SELECT * FROM roles WHERE name = ?", [name])

    if (existingRoles.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Role already exists",
      })
    }

    // Create role
    const [result] = await pool.query("INSERT INTO roles (name, permissionEdit) VALUES (?, ?)", [
      name,
      permissionEdit ? 1 : 0,
    ])

    if (result.affectedRows > 0) {
      // Get the created role
      const [roles] = await pool.query("SELECT * FROM roles WHERE id = ?", [result.insertId])
      const role = roles[0]

      res.status(201).json({
        success: true,
        role: {
          id: role.id,
          name: role.name,
          permissionEdit: role.permissionEdit === 1, // Convert to boolean
          createdAt: role.createdAt,
        },
      })
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid role data",
      })
    }
  } catch (error) {
    console.error("Create role error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private/Admin
export const updateRole = async (req, res) => {
  try {
    const { name, permissionEdit } = req.body

    // Check if role exists
    const [roles] = await pool.query("SELECT * FROM roles WHERE id = ?", [req.params.id])

    if (roles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      })
    }

    const role = roles[0]

    // Check if updating to an existing name
    if (name && name !== role.name) {
      const [existingRoles] = await pool.query("SELECT * FROM roles WHERE name = ? AND id != ?", [name, role.id])

      if (existingRoles.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Role name already exists",
        })
      }
    }

    // Update role
    await pool.query("UPDATE roles SET name = ?, permissionEdit = ? WHERE id = ?", [
      name || role.name,
      permissionEdit !== undefined ? (permissionEdit ? 1 : 0) : role.permissionEdit,
      role.id,
    ])

    // Get updated role
    const [updatedRoles] = await pool.query("SELECT * FROM roles WHERE id = ?", [role.id])
    const updatedRole = updatedRoles[0]

    res.status(200).json({
      success: true,
      role: {
        id: updatedRole.id,
        name: updatedRole.name,
        permissionEdit: updatedRole.permissionEdit === 1, // Convert to boolean
        createdAt: updatedRole.createdAt,
      },
    })
  } catch (error) {
    console.error("Update role error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private/Admin
export const deleteRole = async (req, res) => {
  try {
    // Check if role exists
    const [roles] = await pool.query("SELECT * FROM roles WHERE id = ?", [req.params.id])

    if (roles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      })
    }

    // Check if role is assigned to any users
    const [users] = await pool.query("SELECT COUNT(*) as count FROM users WHERE roleId = ?", [req.params.id])

    if (users[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete role that is assigned to users",
      })
    }

    // Delete role
    await pool.query("DELETE FROM roles WHERE id = ?", [req.params.id])

    res.status(200).json({
      success: true,
      message: "Role removed",
    })
  } catch (error) {
    console.error("Delete role error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}
