const Section = require('../models/Section');
const Bill = require('../models/Bill');

/**
 * @desc    Create a new section
 * @route   POST /api/sections
 * @access  Private
 */
const createSection = async (req, res) => {
  try {
    const { name, budget, description, theme } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Section name is required'
      });
    }

    // Validate budget
    if (budget !== undefined && (isNaN(budget) || budget < 0)) {
      return res.status(400).json({
        success: false,
        error: 'Budget must be a positive number'
      });
    }

    // Default theme if not provided
    const defaultTheme = {
      color: '#3B82F6',
      icon: '📁',
      name: 'Blue'
    };

    // Create section
    const section = new Section({
      name: name.trim(),
      budget: budget || 0,
      description: description?.trim() || '',
      theme: {
        ...defaultTheme,
        ...theme,
        color: theme?.color || defaultTheme.color,
        name: theme?.name || defaultTheme.name
      },
      user: userId,
      stats: {
        totalBills: 0,
        totalAmount: 0,
        remainingBudget: budget || 0
      }
    });

    await section.save();

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: {
        section: {
          ...section.toObject(),
          isOverspent: section.isOverspent,
          budgetPercentage: section.budgetPercentage,
          totalAmountFormatted: section.totalAmountFormatted,
          remainingBudgetFormatted: section.remainingBudgetFormatted
        }
      }
    });

  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create section',
      message: error.message
    });
  }
};

/**
 * @desc    Get all sections for current user
 * @route   GET /api/sections
 * @access  Private
 */
const getSections = async (req, res) => {
  try {
    const userId = req.user._id;
    const { archived, search } = req.query;

    // Build query
    const query = { user: userId };

    // Filter by archived status
    if (archived !== undefined) {
      query['settings.isArchived'] = archived === 'true';
    }

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Get sections
    const sections = await Section.find(query)
      .sort({ 'settings.showInDashboard': -1, createdAt: -1 })
      .lean();

    // Add virtual properties
    const sectionsWithVirtuals = sections.map(section => ({
      ...section,
      isOverspent: section.stats.remainingBudget < 0,
      budgetPercentage: section.budget > 0
        ? Math.min((section.stats.totalAmount / section.budget) * 100, 100)
        : 0,
      totalAmountFormatted: `₦${section.stats.totalAmount.toFixed(2)}`,
      remainingBudgetFormatted: `₦${section.stats.remainingBudget.toFixed(2)}`,
      budgetFormatted: `₦${section.budget.toFixed(2)}`
    }));

    // Calculate totals
    const totals = {
      totalSections: sections.length,
      totalBudget: sections.reduce((sum, s) => sum + s.budget, 0),
      totalSpent: sections.reduce((sum, s) => sum + s.stats.totalAmount, 0),
      totalRemaining: sections.reduce((sum, s) => sum + s.stats.remainingBudget, 0),
      overspentSections: sections.filter(s => s.stats.remainingBudget < 0).length
    };

    res.json({
      success: true,
      data: {
        sections: sectionsWithVirtuals,
        totals,
        count: sections.length
      }
    });

  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sections',
      message: error.message
    });
  }
};

/**
 * @desc    Get single section by ID
 * @route   GET /api/sections/:id
 * @access  Private
 */
const getSectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const section = await Section.findOne({
      _id: id,
      user: userId
    }).lean();

    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    // Get recent bills for this section
    const recentBills = await Bill.find({
      section: id,
      user: userId,
      status: 'active'
    })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Add virtual properties
    const sectionWithVirtuals = {
      ...section,
      isOverspent: section.stats.remainingBudget < 0,
      budgetPercentage: section.budget > 0
        ? Math.min((section.stats.totalAmount / section.budget) * 100, 100)
        : 0,
      totalAmountFormatted: `₦${section.stats.totalAmount.toFixed(2)}`,
      remainingBudgetFormatted: `₦${section.stats.remainingBudget.toFixed(2)}`,
      budgetFormatted: `₦${section.budget.toFixed(2)}`,
      recentBills
    };

    res.json({
      success: true,
      data: {
        section: sectionWithVirtuals
      }
    });

  } catch (error) {
    console.error('Get section error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch section',
      message: error.message
    });
  }
};

/**
 * @desc    Update section
 * @route   PUT /api/sections/:id
 * @access  Private
 */
const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    // Find section
    const section = await Section.findOne({
      _id: id,
      user: userId
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    // Allowed fields to update
    const allowedUpdates = ['name', 'budget', 'description', 'theme', 'settings'];
    const updateData = {};

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'theme') {
          // Merge theme updates
          updateData.theme = {
            ...section.theme,
            ...updates.theme
          };
        } else if (field === 'settings') {
          // Merge settings updates
          updateData.settings = {
            ...section.settings,
            ...updates.settings
          };
        } else {
          updateData[field] = updates[field];
        }
      }
    });

    // If budget changed, update remaining budget calculation
    if (updates.budget !== undefined) {
      updateData['stats.remainingBudget'] = updates.budget - section.stats.totalAmount;
    }

    // Apply updates
    Object.keys(updateData).forEach(key => {
      section[key] = updateData[key];
    });

    await section.save();

    // Update section stats
    await Section.updateSectionStats(id);

    res.json({
      success: true,
      message: 'Section updated successfully',
      data: {
        section: {
          ...section.toObject(),
          isOverspent: section.isOverspent,
          budgetPercentage: section.budgetPercentage,
          totalAmountFormatted: section.totalAmountFormatted,
          remainingBudgetFormatted: section.remainingBudgetFormatted
        }
      }
    });

  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update section',
      message: error.message
    });
  }
};

/**
 * @desc    Delete section
 * @route   DELETE /api/sections/:id
 * @access  Private
 */
const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find section
    const section = await Section.findOne({
      _id: id,
      user: userId
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    // Check if section has bills
    const billCount = await Bill.countDocuments({
      section: id,
      user: userId,
      status: 'active'
    });

    if (billCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete section with bills',
        message: `This section has ${billCount} bill(s). Delete all bills first or archive the section.`,
        billCount
      });
    }

    // Delete section
    await section.deleteOne();

    res.json({
      success: true,
      message: 'Section deleted successfully',
      data: {
        deletedSectionId: id,
        deletedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Delete section error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete section',
      message: error.message
    });
  }
};

/**
 * @desc    Archive/Unarchive section
 * @route   PATCH /api/sections/:id/archive
 * @access  Private
 */
const toggleArchiveSection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { archive } = req.body;

    const section = await Section.findOneAndUpdate(
      { _id: id, user: userId },
      {
        $set: {
          'settings.isArchived': archive === true,
          'settings.showInDashboard': archive === true ? false : true
        }
      },
      { new: true, runValidators: true }
    );

    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    const action = archive ? 'archived' : 'unarchived';

    res.json({
      success: true,
      message: `Section ${action} successfully`,
      data: {
        section: {
          ...section.toObject(),
          isArchived: section.settings.isArchived
        }
      }
    });

  } catch (error) {
    console.error('Archive section error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive section',
      message: error.message
    });
  }
};

/**
 * @desc    Get section statistics
 * @route   GET /api/sections/:id/stats
 * @access  Private
 */
const getSectionStats = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { days = 30 } = req.query;

    // Verify section belongs to user
    const section = await Section.findOne({
      _id: id,
      user: userId
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get bill statistics
    const billStats = await Bill.aggregate([
      {
        $match: {
          section: section._id,
          user: userId,
          status: 'active',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' },
          maxAmount: { $max: '$amount' },
          minAmount: { $min: '$amount' },
          positiveAmount: { $sum: { $cond: [{ $gt: ['$amount', 0] }, '$amount', 0] } },
          negativeAmount: { $sum: { $cond: [{ $lt: ['$amount', 0] }, '$amount', 0] } }
        }
      }
    ]);

    // Get tag statistics
    const tagStats = await Bill.aggregate([
      {
        $match: {
          section: section._id,
          user: userId,
          status: 'active',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$tag',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get daily spending
    const dailyStats = await Bill.aggregate([
      {
        $match: {
          section: section._id,
          user: userId,
          status: 'active',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const stats = billStats[0] || {
      totalAmount: 0,
      count: 0,
      averageAmount: 0,
      maxAmount: 0,
      minAmount: 0,
      positiveAmount: 0,
      negativeAmount: 0
    };

    res.json({
      success: true,
      data: {
        section: {
          _id: section._id,
          name: section.name,
          budget: section.budget,
          remainingBudget: section.stats.remainingBudget
        },
        overview: {
          totalSpent: stats.totalAmount,
          totalBills: stats.count,
          averageBill: stats.averageAmount,
          largestBill: stats.maxAmount,
          smallestBill: stats.minAmount,
          income: Math.abs(stats.negativeAmount), // Negative amounts are income
          expenses: stats.positiveAmount,
          netFlow: stats.totalAmount
        },
        tags: tagStats.map(s => ({
          ...s,
          emoji: s._id || '📝',
        })),
        daily: dailyStats,
        timeRange: {
          startDate,
          endDate,
          days: parseInt(days)
        }
      }
    });

  } catch (error) {
    console.error('Get section stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get section statistics',
      message: error.message
    });
  }
};

/**
 * @desc    Duplicate section
 * @route   POST /api/sections/:id/duplicate
 * @access  Private
 */
const duplicateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { newName } = req.body;

    // Find original section
    const originalSection = await Section.findOne({
      _id: id,
      user: userId
    }).lean();

    if (!originalSection) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    // Create new section based on original
    const newSection = new Section({
      ...originalSection,
      _id: undefined, // Let MongoDB generate new ID
      name: newName || `${originalSection.name} (Copy)`,
      stats: {
        totalBills: 0,
        totalAmount: 0,
        remainingBudget: originalSection.budget,
        lastUpdated: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newSection.save();

    res.status(201).json({
      success: true,
      message: 'Section duplicated successfully',
      data: {
        section: {
          ...newSection.toObject(),
          isOverspent: newSection.isOverspent,
          budgetPercentage: newSection.budgetPercentage
        }
      }
    });

  } catch (error) {
    console.error('Duplicate section error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to duplicate section',
      message: error.message
    });
  }
};

module.exports = {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
  toggleArchiveSection,
  getSectionStats,
  duplicateSection
};