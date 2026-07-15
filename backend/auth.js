const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const client = require("./client");
const pool = require("./db");

router.post("/auth/google", async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      user = await pool.query(
        "INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *",
        [email, name]
      );
    }

    const dbUser = user.rows[0];

    const jwtToken = jwt.sign(
      { id: dbUser.id, email: dbUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ jwt: jwtToken });

  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Auth failed" });
  }
});

module.exports = router;