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

// ✅ Serve static files properly
app.use(express.static(path.join(__dirname, "public")));

// ✅ Connect to MongoDB
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

// ---------------------- LOGOUT ROUTE (OPTIONAL) ----------------------
app.post("/logout", (req, res) => {
    // Since JWT is stateless, we don't store it on the backend
    // The frontend simply clears the token from localStorage
    res.json({ message: "Logout successful!" });
});

// ---------------------- DASHBOARD ROUTE ----------------------
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ---------------------- QUIZ QUESTIONS API ----------------------
app.get("/api/questions", (req, res) => {
    const questions = [
        { question: "Q1. Which language is primarily used for developing Android applications?", options: ["Python", "Swift", "Java", "C++"], correctAnswer: "Java" },
        { question: "Q2. Which data structure uses LIFO (Last In, First Out) principle?", options: ["Queue", "Stack", "Linked List", "Heap"], correctAnswer: "Stack" },
        { question: "Q3. What does ‘O’ represent in Big-O Notation?", options: ["Order", "Overflow", "Object", "Optimization"], correctAnswer: "Order" },
        { question: "Q4. Which of the following is NOT an OOP (Object-Oriented Programming) principle?", options: ["Encapsulation", "Inheritance", "Compilation", "Polymorphism"], correctAnswer: "Compilation" },
        { question: "Q5. Which of the following sorting algorithms has the worst-case time complexity of O(n²)?", options: ["Merge Sort", "Quick Sort", "Bubble Sort", "Heap Sort"], correctAnswer: "Bubble Sort" },
        { question: "Q6. What will be the output of print(2 ** 3) in Python?", options: ["5", "6", "8", "9"], correctAnswer: "8" },
        { question: "Q7. Which SQL command is used to fetch unique records from a table?", options: ["DISTINCT", "UNIQUE", "SELECT UNIQUE", "SELECT DISTINCT VALUES"], correctAnswer: "DISTINCT" },
        { question: "Q8. What will be the output of console.log(typeof NaN) in JavaScript?", options: ["Undefined", "Object", "Number", "Null"], correctAnswer: "Number" },
        { question: "Q9. Which of the following is true about Node.js?", options: ["Node.js is a front-end framework", "Node.js runs on a browser", "Node.js is single-threaded but can handle asynchronous operations", "Node.js does not use JavaScript"], correctAnswer: "Node.js is single-threaded but can handle asynchronous operations" },
        { question: "Q10. Which method is used in Express.js to define a route that handles HTTP GET requests?", options: ["app.post()", "app.route()", "app.get()", "app.http()"], correctAnswer: "app.get()" }
    ];
    res.json(questions);
});

// ---------------------- SERVER START ----------------------
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
