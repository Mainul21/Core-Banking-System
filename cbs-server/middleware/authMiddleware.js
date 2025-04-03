const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    console.log("Middleware hit!");

    if (!req) {
        console.error("Request object is missing!");
        return next(new Error("Server error"));
    }

    if (!req.headers) {
        console.error("Headers missing in request!");
        return res.status(400).json({ message: "Invalid request structure" });
    }

    console.log("Headers:", req.headers);

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("Authorization header missing or invalid.");
        return res.status(401).json({ message: "Unauthorized - No Token" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.log("Token verification failed:", error.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authenticateToken;
