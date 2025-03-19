const jwt = require("jsonwebtoken");

const authMiddleware = () => (req, res, next) => {
    const authHeader = req.headers.authorization;
    // console.log("Auth Header:", authHeader); // Debugging

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        // console.log("Authorization header missing or invalid.");
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    // console.log("Extracted Token:", token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("Decoded Token:", decoded);
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        // console.log("Token verification failed:", error.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;
