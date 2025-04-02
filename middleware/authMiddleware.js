const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    let token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        if (token.startsWith("Bearer ")) {
            token = token.split(" ")[1]; // Remove "Bearer" prefix
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.userId; // Fix: Use "userId" as stored in JWT

        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

module.exports = protect;
