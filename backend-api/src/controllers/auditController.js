/**
 * Audit Log Controller
 * Handles HTTP requests for audit log retrieval and statistics
 */

const auditService = require('../services/auditService');

/**
 * Get audit logs with filters
 * Query params: userId, userRole, actionType, actionCategory, entityType, success, startDate, endDate, limit, offset
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const filters = {
      userId: req.query.userId ? Number.parseInt(req.query.userId) : undefined,
      userRole: req.query.userRole,
      actionType: req.query.actionType,
      actionCategory: req.query.actionCategory,
      entityType: req.query.entityType,
      success: req.query.success === undefined ? undefined : req.query.success === 'true',
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit ? Number.parseInt(req.query.limit) : 100,
      offset: req.query.offset ? Number.parseInt(req.query.offset) : 0,
    };

    // Authorization: Users can only view their own logs unless they're caterers viewing their business logs
    if (req.user?.role === 'customer' && filters.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only view your own audit logs' });
    }

    // Caterers can view logs for their catering business (all actions related to their catererId)
    if (req.user?.role === 'caterer') {
      // Allow caterers to view their own logs and logs related to their business
      if (filters.userId && filters.userId !== req.user.id) {
        return res.status(403).json({ error: 'You can only view your own audit logs' });
      }
    }

    const logs = await auditService.getAuditLogs(filters);
    res.json(logs);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get audit log statistics
 * Query params: userId, startDate, endDate
 */
exports.getAuditStats = async (req, res) => {
  try {
    const filters = {
      userId: req.query.userId ? Number.parseInt(req.query.userId) : undefined,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    // Authorization: Users can only view their own stats
    if (req.user?.role === 'customer' && filters.userId && filters.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only view your own statistics' });
    }

    if (req.user?.role === 'caterer') {
      // Caterers can view stats for their own account
      if (filters.userId && filters.userId !== req.user.id) {
        return res.status(403).json({ error: 'You can only view your own statistics' });
      }
    }

    const stats = await auditService.getAuditStats(filters);
    res.json(stats);
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get user activity timeline (convenience endpoint)
 */
exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Authorization check
    if (req.user && req.user.id !== Number.parseInt(userId)) {
      return res.status(403).json({ error: 'You can only view your own activity' });
    }

    const logs = await auditService.getAuditLogs({
      userId: Number.parseInt(userId),
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
    });

    res.json({
      userId: Number.parseInt(userId),
      totalLogs: logs.length,
      logs,
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
