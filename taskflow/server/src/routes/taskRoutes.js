const router = require('express').Router();
const ctrl = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect); // every task route requires a logged-in user

router.get('/stats', ctrl.getStats); // keep fixed paths ABOVE "/:id"
router.delete('/completed', ctrl.clearCompleted);

router.route('/').get(ctrl.getTasks).post(ctrl.createTask);
router.route('/:id').get(ctrl.getTask).patch(ctrl.updateTask).put(ctrl.updateTask).delete(ctrl.deleteTask);
router.patch('/:id/toggle', ctrl.toggleTask);

module.exports = router;
