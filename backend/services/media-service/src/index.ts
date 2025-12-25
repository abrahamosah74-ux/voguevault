// Media Service - Main Entry Point
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import 'express-async-errors';
import config from '../../config';
import { errorResponse } from '../../shared/utils';
import mediaController from './controllers/media.controller';

const app = express();
const PORT = config.server.port;

// Middleware
app.use(cors());
app.use(express.json());

// File Upload Middleware
const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'media-service',
    timestamp: new Date(),
  });
});

// Routes
const apiRouter = express.Router();

// Media Routes
apiRouter.post('/upload', upload.single('file'), mediaController.uploadMedia);
apiRouter.post('/upload-multiple', upload.array('files', 10), mediaController.uploadMultiple);
apiRouter.get('/media/:mediaId', mediaController.getMedia);
apiRouter.delete('/media/:mediaId', mediaController.deleteMedia);
apiRouter.post('/resize', mediaController.resizeImage);
apiRouter.post('/optimize', mediaController.optimizeImage);

app.use('/api/v1', apiRouter);

// Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Media Service Error]', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json(errorResponse(message, statusCode));
});

// Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Media Service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Media Service closed');
    process.exit(0);
  });
});

export default app;
