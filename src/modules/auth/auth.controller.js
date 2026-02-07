import { Router } from 'express'
import {  signup, login, updateUser, deleteUser, getUser } from './auth.service.js';
import { successResponse } from '../../common/utils/index.js';
import { authMiddleware } from '../../common/middlewere/auth.middlewere.js';
const router = Router(); 




router.post("/signup", async (req, res, next) => {
    const account = await signup(req.body)
    return successResponse({res, statusCode:201, data:{account}})
})

router.post("/login", async (req, res, next) => {
    const { user, token } = await login(req.body);
    return successResponse({ res, statusCode: 200, data: { user, token } });
  });

  router.patch("/users", authMiddleware, async (req, res) => {
    const userId = req.user.userId; 
    const updatedUser = await updateUser(userId, req.body);
    return successResponse({ res, statusCode: 200, data: { user: updatedUser } });
  });

  router.delete('/users', authMiddleware, async (req, res) => {
    const deletedUser = await deleteUser(req.user.userId);
    return successResponse({ res, statusCode: 200, data: { message: "User deleted" } });
  });
  
  
  router.get('/users', authMiddleware, async (req, res) => {
    const user = await getUser(req.user.userId);
    return successResponse({ res, statusCode: 200, data: { user } });
  });
  

export default router