import express from 'express';
const router = express.Router();
import projectController from '../controllers/project.controller.js';
import visitorController from '../controllers/visitor.controller.js';
import auth from '../middleware/auth.js';

router.use(auth); // Protect all project routes

router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.get('/:id/stats', projectController.getProjectStats);
router.get('/:id/detailed-stats', visitorController.getProjectDetailedStats);
router.get('/:id/activity', projectController.getProjectActivity);
router.get('/:id/pages', projectController.getProjectPages);
router.put('/:id/pin', projectController.togglePin);
router.post('/:id/share-token', projectController.regenerateShareToken);
router.delete('/:id/share-token', projectController.revokeShareToken);

export default router;
