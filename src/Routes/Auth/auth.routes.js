// GitHub authentication routes
import { Router } from "express";
import { login, register } from "../../Controllers/Auth/authentication.controller.js";
const manualAuthentication = Router();
manualAuthentication.post('/register', register);
manualAuthentication.post('/login', login);
export default manualAuthentication;