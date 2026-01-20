const Bill = require('../models/Bill');
const Section = require('../models/Section');
const math = require('mathjs');


/**
 * @desc    Create a new bill
 * @route   POST /api/bills
 * @access  Private
 */
const createBill = async (req, res) => {
  try {
    const { name, amount, description, tag, date, section: sectionId } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bill name is required'
      });
    }

    if (amount === undefined || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }

    if (!sectionId) {
      return res.status(400).json({
        success: false,
        error: 'Section ID is required'
      });
    }

    // Verify section belongs to user
    const section = await Section.findOne({
      _id: sectionId,
      user: userId
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    // Check if amount is negative and if section allows it
    if (amount < 0 && !section.settings.allowNegative) {
      return res.status(400).json({
        success: false,
        error: 'Negative amounts not allowed in this section'
      });
    }

    // Parse amount (handle string input with calculations)
    let parsedAmount = amount;
    if (typeof amount === 'string') {
      try {
        // Remove any currency symbols and commas
        const cleanAmount = amount.replace(/[$,]/g, '');
        // Try to evaluate if it's a calculation
        if (cleanAmount.includes('+') || cleanAmount.includes('-') ||
          cleanAmount.includes('*') || cleanAmount.includes('/')) {
          // In a real app, you'd use a safe eval or math library
          // For now, we'll just parseFloat the result
          parsedAmount = math.evaluate(cleanAmount); // Note: eval is dangerous, use math.js in production
        } else {
          parsedAmount = parseFloat(cleanAmount);
        }

        if (isNaN(parsedAmount)) {
          throw new Error('Invalid amount calculation');
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid amount format',
          message: 'Amount must be a number or valid calculation'
        });
      }
    }

    // Parse date
    let parsedDate = date ? new Date(date) : new Date();
    if (isNaN(parsedDate.getTime())) {
      parsedDate = new Date();
    }

    // Create bill
    const bill = new Bill({
      name: name.trim(),
      amount: parsedAmount,
      description: description?.trim() || '',
      tag: tag || '📝',
      date: parsedDate,
      section: sectionId,
      user: userId,
      metadata: {
        createdBy: 'web',
        device: req.headers['user-agent'] || 'unknown'
      }
    });

    await bill.save();

    // Populate section info
    const populatedBill = await Bill.findById(bill._id)
      .populate('section', 'name theme.color')
      .lean();

    // UPDATE RECENT TAGS PERSISTENTLY
    // We do this asynchronously so we don't block the response
    (async () => {
      try {
        const User = require('../models/User');
        const user = await User.findById(userId);
        if (user && tag && tag !== '📝') {
          // Remove if exists (to move to front)
          let tags = user.preferences.recentTags || [];
          tags = tags.filter(t => t !== tag);
          // Add to front
          tags.unshift(tag);
          // Limit to 5
          tags = tags.slice(0, 5);

          user.preferences.recentTags = tags;
          await user.save();
        }
      } catch (err) {
        console.error('Failed to update recent tags persistence:', err);
      }
    })();

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: {
        bill: {
          ...populatedBill,
          amountFormatted: bill.amountFormatted,
          dateFormatted: bill.dateFormatted,
          timeFormatted: bill.timeFormatted,
          daysAgo: bill.daysAgo,
          amountColor: bill.amountColor,
          amountIcon: bill.amountIcon
        }
      }
    });

  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create bill',
      message: error.message
    });
  }
};

/**
 * @desc    Get all bills with filters
 * @route   GET /api/bills
 * @access  Private
 */
const getBills = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      section,
      tag,
      startDate,
      endDate,
      timeFrame,
      minAmount,
      maxAmount,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      limit = 50,
      page = 1,
      view = 'list', // 'list' or 'stats'
      includeStats = false
    } = req.query;

    // Build filters
    const filters = {
      userId,
      sectionId: section,
      tag,
      startDate,
      endDate,
      timeFrame,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      search,
      sortBy,
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    // Get bills based on view
    let result;

    if (view === 'stats' || includeStats === 'true' || includeStats === true) {
      // Get statistics view
      const [bills, tagStats, dailyStats] = await Promise.all([
        Bill.getFilteredBills(filters),
        Bill.getTagStats(userId, section),
        Bill.getDailySummary(userId, 30, section)
      ]);

      // Calculate totals
      const totals = bills.reduce((acc, bill) => {
        acc.totalAmount += bill.amount;
        acc.count += 1;
        if (bill.amount > 0) acc.positive += bill.amount;
        if (bill.amount < 0) acc.negative += bill.amount;
        return acc;
      }, { totalAmount: 0, count: 0, positive: 0, negative: 0 });

      result = {
        bills: bills.map(bill => ({
          ...bill,
          amountFormatted: `₦${Math.abs(bill.amount).toLocaleString()}`,
          dateFormatted: new Date(bill.date).toLocaleDateString(),
          amountColor: bill.amount < 0 ? 'text-red-600' : 'text-green-600'
        })),
        statistics: {
          totals: {
            ...totals,
            positiveFormatted: `₦${totals.positive.toLocaleString()}`,
            negativeFormatted: `₦${Math.abs(totals.negative).toLocaleString()}`,
            netFormatted: `₦${totals.totalAmount.toLocaleString()}`
          },
          tagStats: tagStats.map(s => ({
            ...s,
            emoji: s._id || '📝',
          })),
          dailyStats
        }
      };

    } else {
      // Get list view
      const bills = await Bill.getFilteredBills(filters);

      // Get total count for pagination
      const count = await Bill.countDocuments({
        user: userId,
        status: 'active'
      });

      result = {
        bills: bills.map(bill => ({
          ...bill,
          amountFormatted: `₦${Math.abs(bill.amount).toLocaleString()}`,
          dateFormatted: new Date(bill.date).toLocaleDateString(),
          timeFormatted: new Date(bill.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          daysAgo: (() => {
            const now = new Date();
            const billDate = new Date(bill.date);
            const diffTime = Math.abs(now - billDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
            return `${Math.floor(diffDays / 30)} months ago`;
          })(),
          amountColor: bill.amount < 0 ? 'text-red-600' : 'text-green-600',
          amountIcon: bill.amount < 0 ? '📉' : '📈'
        })),
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / parseInt(limit))
        }
      };

      // If stats requested, fetch them
      if (includeStats === 'true') {
        const [tagStats, dailyStats] = await Promise.all([
          Bill.getTagStats(userId, section),
          Bill.getDailySummary(userId, 30, section)
        ]);

        // Calculate totals for consistency
        const totals = bills.reduce((acc, bill) => {
          acc.totalAmount += bill.amount;
          acc.count += 1;
          if (bill.amount > 0) acc.positive += bill.amount;
          if (bill.amount < 0) acc.negative += bill.amount;
          return acc;
        }, { totalAmount: 0, count: 0, positive: 0, negative: 0 });

        result.statistics = {
          totals: {
            ...totals,
            positiveFormatted: `₦${totals.positive.toLocaleString()}`,
            negativeFormatted: `₦${Math.abs(totals.negative).toLocaleString()}`,
            netFormatted: `₦${totals.totalAmount.toLocaleString()}`
          },
          tagStats: tagStats.map(s => ({
            ...s,
            emoji: s._id || '📝',
          })),
          dailyStats
        };
      }
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bills',
      message: error.message
    });
  }
};

/**
 * @desc    Get single bill by ID
 * @route   GET /api/bills/:id
 * @access  Private
 */
const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const bill = await Bill.findOne({
      _id: id,
      user: userId,
      status: 'active'
    })
      .populate('section', 'name theme.color budget')
      .lean();

    if (!bill) {
      return res.status(404).json({
        success: false,
        error: 'Bill not found'
      });
    }

    // Format dates
    const billDate = new Date(bill.date);

    res.json({
      success: true,
      data: {
        bill: {
          ...bill,
          amountFormatted: `$${Math.abs(bill.amount).toFixed(2)}`,
          dateFormatted: billDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          timeFormatted: billDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          daysAgo: (() => {
            const now = new Date();
            const diffTime = Math.abs(now - billDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
            return `${Math.floor(diffDays / 30)} months ago`;
          })(),
          amountColor: bill.amount < 0 ? 'text-red-600' : 'text-green-600',
          amountIcon: bill.amount < 0 ? '📉' : '📈',
          isNegative: bill.amount < 0
        }
      }
    });

  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bill',
      message: error.message
    });
  }
};

/**
 * @desc    Update bill
 * @route   PUT /api/bills/:id
 * @access  Private
 */
const updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    // Find bill
    const bill = await Bill.findOne({
      _id: id,
      user: userId,
      status: 'active'
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        error: 'Bill not found'
      });
    }

    // Allowed fields to update
    const allowedUpdates = ['name', 'amount', 'description', 'tag', 'date', 'section'];
    const updateData = { updatedAt: new Date() };

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    // If section is being changed, verify new section belongs to user
    if (updates.section && updates.section !== bill.section.toString()) {
      const newSection = await Section.findOne({
        _id: updates.section,
        user: userId
      });

      if (!newSection) {
        return res.status(404).json({
          success: false,
          error: 'New section not found'
        });
      }

      // Check if amount is negative and if new section allows it
      const amount = updates.amount !== undefined ? updates.amount : bill.amount;
      if (amount < 0 && !newSection.settings.allowNegative) {
        return res.status(400).json({
          success: false,
          error: 'Negative amounts not allowed in the selected section'
        });
      }
    }

    // Parse amount if it's a string calculation
    if (updates.amount !== undefined && typeof updates.amount === 'string') {
      try {
        const cleanAmount = updates.amount.replace(/[$,]/g, '');
        if (cleanAmount.includes('+') || cleanAmount.includes('-') ||
          cleanAmount.includes('*') || cleanAmount.includes('/')) {
          updateData.amount = eval(cleanAmount); // Use math.js in production
        } else {
          updateData.amount = parseFloat(cleanAmount);
        }

        if (isNaN(updateData.amount)) {
          throw new Error('Invalid amount');
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid amount format'
        });
      }
    }

    // Parse date if provided
    if (updates.date) {
      const parsedDate = new Date(updates.date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format'
        });
      }
      updateData.date = parsedDate;
    }

    // Apply updates
    Object.keys(updateData).forEach(key => {
      bill[key] = updateData[key];
    });

    await bill.save();

    // Populate section info
    const updatedBill = await Bill.findById(bill._id)
      .populate('section', 'name theme.color')
      .lean();

    res.json({
      success: true,
      message: 'Bill updated successfully',
      data: {
        bill: {
          ...updatedBill,
          amountFormatted: `$${Math.abs(updatedBill.amount).toFixed(2)}`,
          dateFormatted: new Date(updatedBill.date).toLocaleDateString(),
          amountColor: updatedBill.amount < 0 ? 'text-red-600' : 'text-green-600'
        }
      }
    });

  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update bill',
      message: error.message
    });
  }
};

/**
 * @desc    Delete bill
 * @route   DELETE /api/bills/:id
 * @access  Private
 */
const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find and delete bill
    const bill = await Bill.findOneAndDelete({
      _id: id,
      user: userId
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        error: 'Bill not found'
      });
    }

    res.json({
      success: true,
      message: 'Bill deleted successfully',
      data: {
        deletedBillId: id,
        deletedAt: new Date(),
        billName: bill.name,
        amount: bill.amount
      }
    });

  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete bill',
      message: error.message
    });
  }
};

/**
 * @desc    Get recent tags for user
 * @route   GET /api/bills/tags/recent
 * @access  Private
 */
const getRecentTags = async (req, res) => {
  try {
    const userId = req.user._id;
    // We get the fresh user data since prefs might have changed
    const User = require('../models/User');
    const user = await User.findById(userId);

    // Get tags from persistent preferences
    let recentTags = user && user.preferences && user.preferences.recentTags
      ? user.preferences.recentTags
      : [];

    // Fallback: If empty, try to get from history (migration/init)
    if (recentTags.length === 0) {
      const stats = await Bill.getTagStats(userId);
      recentTags = stats.map(s => s._id).filter(t => t && t !== '📝').slice(0, 5);

      // Save these back to preferences for next time
      if (recentTags.length > 0 && user) {
        user.preferences.recentTags = recentTags;
        await user.save();
      }
    }

    // Format to match expected frontend interface (TagStat structure)
    // The frontend expects objects with 'emoji' property
    const formattedTags = recentTags.map((tag, index) => ({
      emoji: tag,
      // Fake other props that might be expected but aren't critical for the simple list
      count: 1,
      totalAmount: 0,
      averageAmount: 0,
      // Provide dates that ensure order is preserved if sorted by date
      lastUsed: new Date(Date.now() - index * 1000).toISOString()
    }));

    res.json({
      success: true,
      data: {
        tags: formattedTags
      }
    });

  } catch (error) {
    console.error('Get recent tags error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent tags',
      message: error.message
    });
  }
};

/**
 * @desc    Get tag statistics
 * @route   GET /api/bills/tags/stats
 * @access  Private
 */
const getTagStatistics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 365, sectionId } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const match = {
      user: userId,
      status: 'active',
      date: { $gte: startDate },
      tag: { $exists: true, $ne: '' }
    };

    if (sectionId) {
      match.section = mongoose.Types.ObjectId(sectionId);
    }

    const tagStats = await Bill.aggregate([
      {
        $match: match
      },
      {
        $group: {
          _id: '$tag',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
          positiveAmount: { $sum: { $cond: [{ $gt: ['$amount', 0] }, '$amount', 0] } },
          negativeAmount: { $sum: { $cond: [{ $lt: ['$amount', 0] }, '$amount', 0] } },
          lastUsed: { $max: '$date' }
        }
      },
      {
        $project: {
          emoji: '$_id',
          count: 1,
          totalAmount: 1,
          averageAmount: 1,
          positiveAmount: 1,
          negativeAmount: 1,
          lastUsed: 1,
          percentage: {
            $multiply: [
              { $divide: ['$totalAmount', { $abs: '$totalAmount' }] },
              100
            ]
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Calculate totals for percentages
    const totalAmount = tagStats.reduce((sum, tag) => sum + Math.abs(tag.totalAmount), 0);

    const tagsWithPercentages = tagStats.map(tag => ({
      ...tag,
      percentageOfTotal: totalAmount > 0 ? (Math.abs(tag.totalAmount) / totalAmount) * 100 : 0,
      lastUsedFormatted: new Date(tag.lastUsed).toLocaleDateString()
    }));

    res.json({
      success: true,
      data: {
        tags: tagsWithPercentages,
        summary: {
          totalTags: tagStats.length,
          totalAmount,
          timeRange: {
            startDate,
            endDate: new Date(),
            days: parseInt(days)
          }
        }
      }
    });

  } catch (error) {
    console.error('Get tag statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tag statistics',
      message: error.message
    });
  }
};

/**
 * @desc    Bulk delete bills
 * @route   DELETE /api/bills/bulk
 * @access  Private
 */
const bulkDeleteBills = async (req, res) => {
  try {
    const userId = req.user._id;
    const { billIds, sectionId } = req.body;

    if (!billIds || !Array.isArray(billIds) || billIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bill IDs are required'
      });
    }

    // Build query
    const query = {
      _id: { $in: billIds },
      user: userId
    };

    // Optionally filter by section
    if (sectionId) {
      query.section = sectionId;
    }

    // Delete bills
    const result = await Bill.deleteMany(query);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'No bills found to delete'
      });
    }

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} bill(s) successfully`,
      data: {
        deletedCount: result.deletedCount,
        deletedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Bulk delete bills error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete bills',
      message: error.message
    });
  }
};

module.exports = {
  createBill,
  getBills,
  getBillById,
  updateBill,
  deleteBill,
  getRecentTags,
  getTagStatistics,
  bulkDeleteBills
};