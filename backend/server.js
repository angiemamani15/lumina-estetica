
const express = require("express");
const cors = require("cors");
const { DatabaseSync } = require("node:sqlite");
const path = require("node:path");

const app = express();
const PORT = 3001;

// ========================================
// CONFIGURACIÓN DEL SERVIDOR
// ========================================

app.use(cors());
app.use(express.json());

// Abrir o crear la base de datos SQLite
const db = new DatabaseSync(
  path.join(__dirname, "lumina.db")
);

// ========================================
// CREACIÓN DE TABLAS
// ========================================

// Tabla Clientes
db.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    telefono TEXT NOT NULL,
    email TEXT NOT NULL
  )
`);

// Tabla Servicios
db.exec(`
  CREATE TABLE IF NOT EXISTS servicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    precio REAL NOT NULL CHECK (precio >= 0),
    duracion INTEGER NOT NULL CHECK (duracion > 0)
  )
`);

// Tabla Turnos
db.exec(`
  CREATE TABLE IF NOT EXISTS turnos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente TEXT NOT NULL,
    servicio TEXT NOT NULL,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'Pendiente'
      CHECK (estado IN ('Pendiente', 'Cancelado'))
  )
`);

// ========================================
// RUTA PRINCIPAL DE LA API
// ========================================

app.get("/api", (req, res) => {
  res.json({
    mensaje:
      "API REST de Lúmina Estética funcionando correctamente",
  });
});

// ========================================
// MÓDULO CLIENTES
// ========================================

// GET - Obtener todos los clientes
app.get("/api/clientes", (req, res) => {
  try {
    const clientes = db
      .prepare("SELECT * FROM clientes ORDER BY id DESC")
      .all();

    res.json(clientes);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudieron obtener los clientes",
    });
  }
});

// POST - Registrar un cliente
app.post("/api/clientes", (req, res) => {
  const { nombre, apellido, telefono, email } = req.body;

  if (
    typeof nombre !== "string" ||
    typeof apellido !== "string" ||
    typeof telefono !== "string" ||
    typeof email !== "string" ||
    !nombre.trim() ||
    !apellido.trim() ||
    !telefono.trim() ||
    !email.trim()
  ) {
    return res.status(400).json({
      error: "Todos los campos son obligatorios",
    });
  }

  try {
    const resultado = db
      .prepare(`
        INSERT INTO clientes
        (nombre, apellido, telefono, email)
        VALUES (?, ?, ?, ?)
      `)
      .run(
        nombre.trim(),
        apellido.trim(),
        telefono.trim(),
        email.trim()
      );

    const cliente = db
      .prepare("SELECT * FROM clientes WHERE id = ?")
      .get(resultado.lastInsertRowid);

    res.status(201).json(cliente);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo registrar el cliente",
    });
  }
});

// DELETE - Eliminar un cliente
app.delete("/api/clientes/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "ID de cliente inválido",
    });
  }

  try {
    const resultado = db
      .prepare("DELETE FROM clientes WHERE id = ?")
      .run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({
        error: "Cliente no encontrado",
      });
    }

    res.json({
      mensaje: "Cliente eliminado correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo eliminar el cliente",
    });
  }
});

// ========================================
// MÓDULO SERVICIOS
// ========================================

// GET - Obtener todos los servicios
app.get("/api/servicios", (req, res) => {
  try {
    const servicios = db
      .prepare("SELECT * FROM servicios ORDER BY id DESC")
      .all();

    res.json(servicios);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudieron obtener los servicios",
    });
  }
});

// POST - Registrar un servicio
app.post("/api/servicios", (req, res) => {
  const { nombre, precio, duracion } = req.body;

  if (
    typeof nombre !== "string" ||
    !nombre.trim() ||
    typeof precio !== "number" ||
    !Number.isFinite(precio) ||
    precio < 0 ||
    !Number.isSafeInteger(duracion) ||
    duracion <= 0
  ) {
    return res.status(400).json({
      error: "Ingresá un nombre, precio y duración válidos",
    });
  }

  try {
    const resultado = db
      .prepare(`
        INSERT INTO servicios
        (nombre, precio, duracion)
        VALUES (?, ?, ?)
      `)
      .run(nombre.trim(), precio, duracion);

    const servicio = db
      .prepare("SELECT * FROM servicios WHERE id = ?")
      .get(resultado.lastInsertRowid);

    res.status(201).json(servicio);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo registrar el servicio",
    });
  }
});

// DELETE - Eliminar un servicio
app.delete("/api/servicios/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "ID de servicio inválido",
    });
  }

  try {
    const resultado = db
      .prepare("DELETE FROM servicios WHERE id = ?")
      .run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({
        error: "Servicio no encontrado",
      });
    }

    res.json({
      mensaje: "Servicio eliminado correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo eliminar el servicio",
    });
  }
});

// ========================================
// MÓDULO TURNOS
// ========================================

// GET - Obtener todos los turnos
app.get("/api/turnos", (req, res) => {
  try {
    const turnos = db
      .prepare(`
        SELECT * FROM turnos
        ORDER BY fecha DESC, hora DESC
      `)
      .all();

    res.json(turnos);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudieron obtener los turnos",
    });
  }
});

// POST - Registrar un turno
app.post("/api/turnos", (req, res) => {
  const { cliente, servicio, fecha, hora } = req.body;

  if (
    typeof cliente !== "string" ||
    !cliente.trim() ||
    typeof servicio !== "string" ||
    !servicio.trim() ||
    typeof fecha !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fecha) ||
    typeof hora !== "string" ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)
  ) {
    return res.status(400).json({
      error: "Completá correctamente los datos del turno",
    });
  }

  try {
    const resultado = db
      .prepare(`
        INSERT INTO turnos
        (cliente, servicio, fecha, hora, estado)
        VALUES (?, ?, ?, ?, 'Pendiente')
      `)
      .run(
        cliente.trim(),
        servicio.trim(),
        fecha,
        hora
      );

    const turno = db
      .prepare("SELECT * FROM turnos WHERE id = ?")
      .get(resultado.lastInsertRowid);

    res.status(201).json(turno);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo registrar el turno",
    });
  }
});

// PATCH - Cancelar un turno
app.patch("/api/turnos/:id/cancelar", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "ID de turno inválido",
    });
  }

  try {
    const resultado = db
      .prepare(`
        UPDATE turnos
        SET estado = 'Cancelado'
        WHERE id = ?
      `)
      .run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({
        error: "Turno no encontrado",
      });
    }

    const turno = db
      .prepare("SELECT * FROM turnos WHERE id = ?")
      .get(id);

    res.json(turno);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo cancelar el turno",
    });
  }
});

// DELETE - Eliminar un turno
app.delete("/api/turnos/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "ID de turno inválido",
    });
  }

  try {
    const resultado = db
      .prepare("DELETE FROM turnos WHERE id = ?")
      .run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({
        error: "Turno no encontrado",
      });
    }

    res.json({
      mensaje: "Turno eliminado correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo eliminar el turno",
    });
  }
});


/* ========================================
   MÓDULO VENTAS - API REST
======================================== */

// Crear tabla de ventas en SQLite
db.exec(`
  CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente TEXT NOT NULL,
    servicio TEXT NOT NULL,
    monto REAL NOT NULL CHECK (monto > 0),
    metodoPago TEXT NOT NULL
      CHECK (metodoPago IN ('Efectivo', 'Transferencia', 'Tarjeta')),
    fecha TEXT NOT NULL
  )
`);

// GET - Consultar todas las ventas
app.get("/api/ventas", (req, res) => {
  try {
    const ventas = db
      .prepare("SELECT * FROM ventas ORDER BY id DESC")
      .all();

    res.json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "No se pudieron obtener las ventas",
    });
  }
});

// POST - Registrar una venta
app.post("/api/ventas", (req, res) => {
  const { cliente, servicio, monto, metodoPago } = req.body;

  if (
    typeof cliente !== "string" ||
    !cliente.trim() ||
    typeof servicio !== "string" ||
    !servicio.trim() ||
    typeof monto !== "number" ||
    !Number.isFinite(monto) ||
    monto <= 0 ||
    !["Efectivo", "Transferencia", "Tarjeta"].includes(metodoPago)
  ) {
    return res.status(400).json({
      error: "Completá correctamente los datos de la venta",
    });
  }

  try {
    const fecha = new Date().toLocaleDateString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
    });

    const resultado = db
      .prepare(`
        INSERT INTO ventas
        (cliente, servicio, monto, metodoPago, fecha)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(
        cliente.trim(),
        servicio.trim(),
        monto,
        metodoPago,
        fecha
      );

    const venta = db
      .prepare("SELECT * FROM ventas WHERE id = ?")
      .get(resultado.lastInsertRowid);

    res.status(201).json(venta);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "No se pudo registrar la venta",
    });
  }
});

// DELETE - Eliminar una venta
app.delete("/api/ventas/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "ID de venta inválido",
    });
  }

  try {
    const resultado = db
      .prepare("DELETE FROM ventas WHERE id = ?")
      .run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({
        error: "Venta no encontrada",
      });
    }

    res.json({
      mensaje: "Venta eliminada correctamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "No se pudo eliminar la venta",
    });
  }
});

// ========================================
// INICIAR SERVIDOR
// ========================================

app.listen(PORT, () => {
  console.log(
    `Servidor funcionando en http://localhost:${PORT}`
  );
});
