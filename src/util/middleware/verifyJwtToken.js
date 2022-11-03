const jwt = require('jsonwebtoken');
import { JWT_SECRET } from "../../util/secrets";
// const db = require('../config/db.js');
// const User = db.user;
function verifyToken(req, res, next) {
	let token = req.header('Authorization');
	// let token = req.headers.authorization.split(' ')[1];
	//console.log(token);
	// console.log(token1);
	if (!token) {
		return res.status(601).json({ 'status': 0, 'message': 'Access denied. No token provided.' });
	}
	if (token) {
		token = token.replace('Bearer ', '');
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		next();
	}
	catch (ex) {
		return res.status(601).json({ 'status': 0, 'message': 'Invalid token.', err: ex });
	}
}
const authJwt = {};
authJwt.verifyToken = verifyToken;
module.exports = authJwt;