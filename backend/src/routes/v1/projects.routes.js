import express from 'express';
const router = express.Router();
import projectController from '../../controllers/project.controller.js';
import trackingCors from '../../middleware/trackingCors.js';
import auth from '../../middleware/auth.js';

// Public routes
router.get('/share/:shareToken', projectController.getShareReport);

router.use(auth);
router.use(trackingCors);

router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.put('/:id/pin', projectController.togglePin);
router.post('/:id/regenerate-token', projectController.regenerateShareToken);

export default router;
