import dotenv from "dotenv";
//dotenv.config();
const result = dotenv.config()
//console.log(result)
export const JWT_SECRET = process.env.SECRET_KEY;

if (!JWT_SECRET) {
    console.log("No JWT secret string. Set JWT_SECRET environment variable.");
    process.exit(1);
}
