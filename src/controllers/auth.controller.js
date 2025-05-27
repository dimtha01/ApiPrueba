import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { pool } from "../db.js"

const JWT_SECRET = "6eafa26b974aab4fc374b776435857f559a3396a29c9ac42a4d42d557b6c22ff"
// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET)
}

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      })
    }

    // Check if user exists
    const [users] = await pool.query(
      `
       SELECT u.*, r.name as roleName, r.permissionEdit, reg.nombre as regionName
       FROM users u
       JOIN roles r ON u.roleId = r.id
       JOIN regiones reg ON reg.id = u.id_region
       WHERE u.email = ?
    `,
      [email],
    )

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    const user = users[0]

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Generate token
    const token = generateToken(user.id)

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.roleName,
        permissionEdit: user.permissionEdit === 1, // Convert to boolean
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Private/Admin
export const register = async (req, res) => {
  try {
    const { email, password, roleName } = req.body

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
      // Generate token
      const token = generateToken(result.insertId)

      res.status(201).json({
        success: true,
        token,
        user: {
          id: result.insertId,
          email,
          role: role.name,
          permissionEdit: role.permissionEdit === 1, // Convert to boolean
        },
      })
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid user data",
      })
    }
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      `
      SELECT u.*, r.name as roleName, r.permissionEdit, reg.nombre as regionName
FROM users u
JOIN roles r ON u.roleId = r.id
JOIN regiones reg ON reg.id = u.id_region
WHERE u.id = ?	
    `,
      [req.user.id],
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
        permissionEdit: user.permissionEdit === 1,
        regionName: user.regionName // Convert to boolean
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}
