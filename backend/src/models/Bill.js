const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Bill name is required'],
    trim: true,
    maxlength: [100, 'Bill name cannot exceed 100 characters'],
  },

  // Financial
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [-1000000, 'Amount is too low'],
    max: [1000000, 'Amount is too high'],
  },

  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },

  // Categorization
  tag: {
    type: String,
    default: '📝',
    trim: true,
    // maxlength removed to allow longer tags/icons
  },

  // Date Information
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },

  // Time-based categorization
  timeFrame: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'one-time'],
    default: 'one-time',
  },

  // Relationships
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
    index: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // Status & Metadata
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active',
  },

  metadata: {
    createdBy: String,
    updatedBy: String,
    device: String,
    location: String,
  },

  // Audit Trail
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },

  // For recurring bills (optional)
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurrence: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    nextDate: Date,
    endDate: Date,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Set timeFrame based on date before saving
 */
BillSchema.pre('save', function () {
  // Auto-update timeFrame if not set
  if (!this.timeFrame || this.timeFrame === 'one-time') {
    const now = new Date();
    const billDate = new Date(this.date);
    const diffTime = now - billDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) this.timeFrame = 'daily';
    else if (diffDays <= 7) this.timeFrame = 'weekly';
    else if (diffDays <= 30) this.timeFrame = 'monthly';
    else this.timeFrame = 'one-time';
  }

  this.updatedAt = Date.now();
});

/**
 * Update related section stats after saving
 */
BillSchema.post('save', async function () {
  try {
    const Section = mongoose.model('Section');
    await Section.updateSectionStats(this.section);

    // Update user stats
    const User = mongoose.model('User');
    await User.updateStats(this.user, {
      totalBills: 1,
      totalSpent: this.amount > 0 ? this.amount : 0
    });
  } catch (error) {
    console.error('Error updating stats after bill save:', error);
  }
});

/**
 * Update related section stats after removing
 */
BillSchema.post('remove', async function () {
  try {
    const Section = mongoose.model('Section');
    await Section.updateSectionStats(this.section);

    // Update user stats (subtract)
    const User = mongoose.model('User');
    await User.updateStats(this.user, {
      totalBills: -1,
      totalSpent: this.amount > 0 ? -this.amount : 0
    });
  } catch (error) {
    console.error('Error updating stats after bill removal:', error);
  }
});

/**
 * Virtual for formatted date
 */
BillSchema.virtual('dateFormatted').get(function () {
  return this.date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

/**
 * Virtual for formatted time
 */
BillSchema.virtual('timeFormatted').get(function () {
  return this.date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
});

/**
 * Virtual for formatted amount
 */
BillSchema.virtual('amountFormatted').get(function () {
  const sign = this.amount < 0 ? '-' : '';
  return `${sign}₦${Math.abs(this.amount).toFixed(2)}`;
});

/**
 * Virtual for amount color class
 */
BillSchema.virtual('amountColor').get(function () {
  return this.amount < 0 ? 'text-red-600' : 'text-green-600';
});

/**
 * Virtual for amount icon
 */
BillSchema.virtual('amountIcon').get(function () {
  return this.amount < 0 ? '🔽' : '🔼';
});

/**
 * Virtual for days ago
 */
BillSchema.virtual('daysAgo').get(function () {
  const now = new Date();
  const billDate = new Date(this.date);
  const diffTime = Math.abs(now - billDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
});

/**
 * Get bills with filters
 * @param {Object} filters - Filter criteria
 */
BillSchema.statics.getFilteredBills = async function (filters = {}) {
  const {
    userId,
    sectionId,
    tag,
    startDate,
    endDate,
    timeFrame,
    search,
    minAmount,
    maxAmount,
    sortBy = 'date',
    sortOrder = 'desc',
    limit = 50,
    skip = 0,
  } = filters;

  const query = { status: 'active' };

  if (userId) query.user = userId;
  if (sectionId) query.section = sectionId;
  if (tag) query.tag = tag;
  if (timeFrame) query.timeFrame = timeFrame;

  // Date range filter
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  // Amount range filter
  if (minAmount !== undefined || maxAmount !== undefined) {
    query.amount = {};
    if (minAmount !== undefined) query.amount.$gte = minAmount;
    if (maxAmount !== undefined) query.amount.$lte = maxAmount;
  }

  // Search in name or description
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Sorting
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return await this.find(query)
    .populate('section', 'name theme.color')
    .sort(sortOptions)
    .limit(limit)
    .skip(skip)
    .lean();
};

/**
 * Get tag statistics for a user
 * @param {string} userId - User ID
 * @param {string} sectionId - Optional Section ID
 */
BillSchema.statics.getTagStats = async function (userId, sectionId = null) {
  const match = { user: new mongoose.Types.ObjectId(userId), status: 'active' };
  if (sectionId) {
    match.section = new mongoose.Types.ObjectId(sectionId);
  }

  return await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$tag',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' },
        lastUsed: { $max: '$date' },
      }
    },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);
};

/**
 * Get daily spending summary
 * @param {string} userId - User ID
 * @param {number} days - Number of days to look back
 * @param {string} sectionId - Optional Section ID
 */
BillSchema.statics.getDailySummary = async function (userId, days = 30, sectionId = null) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const match = {
    user: new mongoose.Types.ObjectId(userId),
    status: 'active',
    date: { $gte: startDate }
  };

  if (sectionId) {
    match.section = new mongoose.Types.ObjectId(sectionId);
  }

  return await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' }
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        tags: { $addToSet: '$tag' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

// Create indexes
BillSchema.index({ user: 1, date: -1 });
BillSchema.index({ section: 1, date: -1 });
BillSchema.index({ tag: 1 });
BillSchema.index({ amount: 1 });
BillSchema.index({ name: 'text', description: 'text' });

const Bill = mongoose.model('Bill', BillSchema);

module.exports = Bill;