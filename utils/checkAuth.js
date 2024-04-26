import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


export default (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    if(token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRET);
            req.userId = decoded._id;
            next()
        } catch (e) {
            return res.status(403).json({
                message: 'Not authorized',
            });
        }

    } else {
        return res.status(403).json({
            message: 'Not authorized'
        })
    }
}