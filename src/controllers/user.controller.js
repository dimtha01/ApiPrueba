// src/controllers/user.controller.js
import { pool } from "../db.js"
import bcrypt from "bcryptjs"

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.id, u.email, u.createdAt, r.name as roleName, r.permissionEdit 
      FROM users u
      JOIN roles r ON u.roleId = r.id
    `)

    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.roleName,
      permissionEdit: user.permissionEdit === 1, // Convert to boolean
      createdAt: user.createdAt,
    }))

    res.status(200).json({
      success: true,
      count: users.length,
      users: formattedUsers,
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const [users] = await pool.query(
      `
      SELECT u.id, u.email, u.createdAt, r.name as roleName, r.permissionEdit 
      FROM users u
      JOIN roles r ON u.roleId = r.id
      WHERE u.id = ?
    `,
      [req.params.id],
    )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const user = users[0]

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.roleName,
        permissionEdit: user.permissionEdit === 1, // Convert to boolean
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Get user by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Create a new user
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { email, password, roleName } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      })
    }

    // Check if user already exists
    const [existingUsers] = await pool.query("SELECT * FROM users WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      })
    }

    // Get role by name
    const [roles] = await pool.query("SELECT * FROM roles WHERE name = ?", [roleName || "user"])

    if (roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      })
    }

    const role = roles[0]

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const [result] = await pool.query("INSERT INTO users (email, password, roleId) VALUES (?, ?, ?)", [
      email,
      hashedPassword,
      role.id,
    ])

    if (result.affectedRows > 0) {
      // Get the created user
      const [createdUsers] = await pool.query(
        `
        SELECT u.id, u.email, u.createdAt, r.name as roleName, r.permissionEdit 
        FROM users u
        JOIN roles r ON u.roleId = r.id
        WHERE u.id = ?
      `,
        [result.insertId],
      )

      const createdUser = createdUsers[0]

      res.status(201).json({
        success: true,
        user: {
          id: createdUser.id,
          email: createdUser.email,
          role: createdUser.roleName,
          permissionEdit: createdUser.permissionEdit === 1, // Convert to boolean
          createdAt: createdUser.createdAt,
        },
      })
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid user data",
      })
    }
  } catch (error) {
    console.error("Create user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { email, password, roleName } = req.body

    // Check if user exists
    const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id])

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const user = users[0]
    let roleId = user.roleId

    // Update role if provided
    if (roleName) {
      const [roles] = await pool.query("SELECT * FROM roles WHERE name = ?", [roleName])

      if (roles.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        })
      }

      roleId = roles[0].id
    }

    // Check if new email already exists for another user
    if (email && email !== user.email) {
      const [existingUsers] = await pool.query("SELECT * FROM users WHERE email = ? AND id != ?", [email, user.id])

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        })
      }
    }

    // Update user
    if (password) {
      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10)
      await pool.query("UPDATE users SET email = ?, password = ?, roleId = ? WHERE id = ?", [
        email || user.email,
        hashedPassword,
        roleId,
        user.id,
      ])
    } else {
      await pool.query("UPDATE users SET email = ?, roleId = ? WHERE id = ?", [email || user.email, roleId, user.id])
    }

    // Get updated user
    const [updatedUsers] = await pool.query(
      `
      SELECT u.id, u.email, r.name as roleName, r.permissionEdit 
      FROM users u
      JOIN roles r ON u.roleId = r.id
      WHERE u.id = ?
    `,
      [user.id],
    )

    const updatedUser = updatedUsers[0]

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.roleName,
        permissionEdit: updatedUser.permissionEdit === 1, // Convert to boolean
      },
    })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    // Check if user exists
    const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id])

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Delete user
    await pool.query("DELETE FROM users WHERE id = ?", [req.params.id])

    res.status(200).json({
      success: true,
      message: "User removed",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}
