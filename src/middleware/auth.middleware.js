// src/middleware/auth.middleware.js
import jwt from "jsonwebtoken"
import { pool } from "../db.js"
import { JWT_SECRET } from "../config.js"

// Protect routes - verify token
export const protect = async (req, res, next) => {
  let token;

  // Verificar si el token existe en los headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Obtener el token del header
      token = req.headers.authorization.split(" ")[1];

      // Verificar el token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Obtener el usuario desde la base de datos usando el ID decodificado del token
      const [users] = await pool.query("SELECT id, email, roleId FROM Users WHERE id = ?", [decoded.id]);

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Asignar el usuario a `req.user`
      req.user = users[0];
      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
};

// Check if user has admin role
export const admin = async (req, res, next) => {
  try {
    const [roles] = await pool.query(
      `
      SELECT r.name 
      FROM Roles r
      JOIN Users u ON r.id = u.roleId
      WHERE u.id = ?
    `,
      [req.user.id],
    )

    if (roles.length > 0 && (roles[0].name === "admin" || roles[0].name === "procura")) {
      next()
    } else {
      res.status(403).json({
        success: false,
        message: "Not authorized as an admin",
      })
    }
  } catch (error) {
    console.error("Admin middleware error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// Check if user has edit permission
export const canEdit = async (req, res, next) => {
  try {
    const [roles] = await pool.query(
      `
      SELECT r.permissionEdit 
      FROM Roles r
      JOIN Users u ON r.id = u.roleId
      WHERE u.id = ?
    `,
      [req.user.id],
    )

    if (roles.length > 0 && roles[0].permissionEdit === 1) {
      next()
    } else {
      res.status(403).json({
        success: false,
        message: "Not authorized to edit",
      })
    }
  } catch (error) {
    console.error("Can edit middleware error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}
