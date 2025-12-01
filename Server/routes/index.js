const express = require('express');
const { auth, checkRole } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');
const router = express.Router();

// 导入控制器
const poemController = require('../controllers/poem');
const authController = require('../controllers/auth');
const commentController = require('../controllers/comment');
const tagController = require('../controllers/tag');
const authorController = require('../controllers/author');

// 认证路由
router.post('/auth/register', validateRegister, authController.register);
router.post('/auth/login', validateLogin, authController.login);

// 诗词路由
router.get('/poems', poemController.list);
router.get('/poems/random', poemController.random);
router.get('/poems/:id', poemController.detail);
router.post('/poems', auth, checkRole(['admin']), poemController.create);
router.put('/poems/:id', auth, checkRole(['admin']), poemController.update);
router.delete('/poems/:id', auth, checkRole(['admin']), poemController.delete);
router.patch('/poems/:id/like', poemController.like);

// 评论路由
router.post('/poems/:id/comments', auth, commentController.create);
router.get('/poems/:id/comments', commentController.list);

// 标签路由
// 公开接口
router.get('/tags', tagController.getTags); // 获取标签列表
router.get('/tags/popular', tagController.getPopularTags); // 获取热门标签
router.get('/tags/:id', tagController.getTagById); // 获取标签详情

// 需要管理员权限的接口
router.post('/tags', auth, checkRole(['admin']), tagController.createTag); // 创建标签
router.put('/tags/:id', auth, checkRole(['admin']), tagController.updateTag); // 更新标签
router.delete('/tags/:id', auth, checkRole(['admin']), tagController.deleteTag); // 删除标签
router.post('/tags/bulk', auth, checkRole(['admin']), tagController.bulkCreateTags); // 批量创建标签

// 作者路由
// 公开接口
router.get('/authors', authorController.list); // 获取作者列表
router.get('/authors/:id', authorController.detail); // 获取作者详情
router.get('/authors/:id/poems', authorController.getAuthorPoems); // 获取作者的诗词列表

// 需要管理员权限的接口
router.post('/authors', auth, checkRole(['admin']), authorController.create); // 创建作者
router.put('/authors/:id', auth, checkRole(['admin']), authorController.update); // 更新作者信息
router.delete('/authors/:id', auth, checkRole(['admin']), authorController.delete); // 删除作者

module.exports = router;