const express = require('express');
const { Notification } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get user notifications
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, read_status } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {
    recipient_id: req.user.id,
    recipient_type: req.userRole
  };

  if (read_status !== undefined) {
    whereClause.read_status = read_status === 'true';
  }

  const { rows: notifications, count } = await Notification.findAndCountAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  // Get unread count
  const unreadCount = await Notification.count({
    where: {
      recipient_id: req.user.id,
      recipient_type: req.userRole,
      read_status: false
    }
  });

  res.json({
    success: true,
    data: {
      notifications,
      unreadCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        total: count,
        hasNext: count > offset + parseInt(limit),
        hasPrev: page > 1
      }
    }
  });
}));

// Mark notification as read
router.put('/:id/read', asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    where: {
      id: req.params.id,
      recipient_id: req.user.id,
      recipient_type: req.userRole
    }
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  await notification.update({ read_status: true });

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: notification
  });
}));

// Mark all notifications as read
router.put('/read-all', asyncHandler(async (req, res) => {
  await Notification.update(
    { read_status: true },
    {
      where: {
        recipient_id: req.user.id,
        recipient_type: req.userRole,
        read_status: false
      }
    }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
}));

// Create notification (for system use)
router.post('/', asyncHandler(async (req, res) => {
  const { recipient_id, recipient_type, message, type } = req.body;

  const notification = await Notification.create({
    recipient_id,
    recipient_type,
    sender_id: req.user.id,
    sender_type: req.userRole,
    message,
    type: type || 'general'
  });

  res.status(201).json({
    success: true,
    message: 'Notification created successfully',
    data: notification
  });
}));

// Delete notification
router.delete('/:id', asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    where: {
      id: req.params.id,
      recipient_id: req.user.id,
      recipient_type: req.userRole
    }
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  await notification.destroy();

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
}));

// Get notification statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const [total, unread, byType] = await Promise.all([
    Notification.count({
      where: {
        recipient_id: req.user.id,
        recipient_type: req.userRole
      }
    }),
    Notification.count({
      where: {
        recipient_id: req.user.id,
        recipient_type: req.userRole,
        read_status: false
      }
    }),
    Notification.findAll({
      where: {
        recipient_id: req.user.id,
        recipient_type: req.userRole
      },
      attributes: [
        'type',
        [Notification.sequelize.fn('COUNT', Notification.sequelize.col('type')), 'count']
      ],
      group: ['type']
    })
  ]);

  res.json({
    success: true,
    data: {
      total,
      unread,
      read: total - unread,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = parseInt(item.dataValues.count);
        return acc;
      }, {})
    }
  });
}));

module.exports = router;
