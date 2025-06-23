import express from 'express';
import { executeCode } from '../Controllers/CodeExecution.controller.js';

const router = express.Router();

// Route for executing code
router.post('/execute', executeCode);

export default router;
