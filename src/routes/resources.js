import  express from 'express';
import AuthMiddleware from '../../shared/middlewares/ensure_auth.js';
import UserController from '../controllers/auth/user_controller.js'
import publicationController from '../controllers/pubication/pubication_controller.js'

let router = express.Router();

router.use(AuthMiddleware.user);

router.route('/users/:id?')
    .get(UserController.get)
    .post(UserController.store)
    .put(UserController.store)
    .delete(UserController.soft);

router.route('/publications/:id?')
    .get(publicationController.get)
    .post(publicationController.store)
    .put(publicationController.store)
    .delete(publicationController.soft);

router.post('/publications/likes/:id', publicationController.like);


export default router;