require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const User = require("./models/user"); // User Model
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// ---------------------- AUTHENTICATION ----------------------

// Signup Route
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Signup successful!" });
  } catch (err) {
    res.status(500).json({ message: "Error signing up", error: err.message });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, message: "Login successful!" });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
});

// ---------------------- VERIFY TOKEN ----------------------
app.post("/verify-token", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    User.findById(decoded.userId, (err, user) => {
      if (err || !user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      res.json({ success: true, username: user.username });
    });
  });
});

// ---------------------- LOGOUT ROUTE ----------------------
app.post("/logout", (req, res) => {
  res.json({ message: "Logout successful!" });
});

// ---------------------- DASHBOARD ROUTE ----------------------
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ---------------------- QUIZ QUESTIONS API ----------------------
app.get("/api/questions", (req, res) => {
  const questions = [
    {
      question: "Q1. What is the unit of resistance?",
      options: ["Volt", "Ampere", "Ohm", "Watt"],
      correctAnswer: "Ohm"
    },
    {
      question: "Q2. Which component is used to store electric charge?",
      options: ["Inductor", "Diode", "Capacitor", "Resistor"],
      correctAnswer: "Capacitor"
    },
    {
      question: "Q3. A NOT gate gives the output as:",
      options: ["Same as input", "Inverse of input", "Always HIGH", "Always LOW"],
      correctAnswer: "Inverse of input"
    },
    {
      question: "Q4. In AM (Amplitude Modulation), which signal is varied?",
      options: ["Frequency", "Amplitude", "Phase", "All of the above"],
      correctAnswer: "Amplitude"
    },
    {
      question: "Q5. Which device allows current to flow in one direction only?",
      options: ["Capacitor", "Transistor", "Diode", "Resistor"],
      correctAnswer: "Diode"
    },
    {
      question: "Q6. What is the binary equivalent of decimal number 5?",
      options: ["1100", "0101", "1111", "1001"],
      correctAnswer: "0101"
    },
    {
      question: "Q7. RAM is a type of:",
      options: ["Permanent memory", "Non-volatile memory", "Volatile memory", "Optical memory"],
      correctAnswer: "Volatile memory"
    },
    {
      question: "Q8. Which modulation technique is used for TV transmission?",
      options: ["AM", "FM", "QAM", "PCM"],
      correctAnswer: "AM"
    },
    {
      question: "Q9. Ohm’s Law is given by:",
      options: ["V = IR", "I = VR", "R = VI", "V = I + R"],
      correctAnswer: "V = IR"
    },
    {
      question: "Q10. Which logic gate has the output HIGH only when all inputs are HIGH?",
      options: ["OR", "NOR", "AND", "NAND"],
      correctAnswer: "AND"
    }
  ];
  res.json(questions);
});

// ---------------------- SERVER START ----------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
