import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, mkdir, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const writeFileAsync = promisify(writeFile);
const unlinkAsync = promisify(unlink);
const mkdirAsync = promisify(mkdir);
const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const languages = {
  javascript: {
    extension: 'js',
    command: (filePath) => `node ${filePath}`,
  },
  python: {
    extension: 'py',
    command: (filePath) => `python ${filePath}`,
  },
  java: {
    extension: 'java',
    command: (filePath) => {
      const className = filePath.split('/').pop().replace('.java', '');
      const dirPath = filePath.split('/').slice(0, -1).join('/');
      return `cd ${dirPath} && javac ${className}.java && java ${className} && cd -`;
    },
  },
  cpp: {
    extension: 'cpp',
    command: (filePath) => {
      const outputPath = filePath.replace('.cpp', '.out');
      return `g++ ${filePath} -o ${outputPath} && ${outputPath}`;
    },
  },
};

export const executeCode = async (req, res) => {
  const { code, language = 'javascript' } = req.body;

  if (!languages[language]) {
    return res.status(400).json({ 
      error: `Unsupported language: ${language}. Supported languages: ${Object.keys(languages).join(', ')}` 
    });
  }

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  const tempDir = join(__dirname, '../../temp');
  const fileName = `code-${uuidv4()}.${languages[language].extension}`;
  const filePath = join(tempDir, fileName);

  try {
    // Create temp directory if it doesn't exist
    if (!existsSync(tempDir)) {
      await mkdirAsync(tempDir, { recursive: true });
    }
    
    // Write code to a temporary file
    await writeFileAsync(filePath, code);

    // Execute the code
    const command = languages[language].command(filePath);
    const { stdout, stderr } = await execAsync(command);

    // Clean up
    try {
      if (existsSync(filePath)) {
        await unlinkAsync(filePath);
      }
      // Remove compiled files if they exist
      if (language === 'java') {
        const classFile = filePath.replace('.java', '.class');
        if (existsSync(classFile)) {
          await unlinkAsync(classFile).catch(() => {});
        }
      } else if (language === 'cpp') {
        const outFile = filePath.replace('.cpp', '.out');
        if (existsSync(outFile)) {
          await unlinkAsync(outFile).catch(() => {});
        }
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temporary files:', cleanupError);
    }

    // Return the execution result
    res.json({
      output: stdout || '',
      error: stderr || null,
    });
  } catch (error) {
    console.error('Execution error:', error);
    
    // Clean up the temporary file if it exists
    try {
      if (filePath && existsSync(filePath)) {
        await unlinkAsync(filePath).catch(() => {});
      }
    } catch (cleanupError) {
      console.error('Error cleaning up after error:', cleanupError);
    }

    res.status(500).json({
      output: '',
      error: error.stderr || 'Failed to execute code',
    });
  }
};
