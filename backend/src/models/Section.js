const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true,
    maxlength: [50, 'Section name cannot exceed 50 characters'],
  },

  // Budget & Financials
  budget: {
    type: Number,
    default: 0,
    min: [0, 'Budget cannot be negative'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
  },

  // Theme & Styling
  theme: {
    color: {
      type: String,
      default: '#3B82F6', // Blue
      validate: {
        validator: function (v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: props => `${props.value} is not a valid hex color!`
      }
    },
    icon: {
      type: String,
      default: 'folder', // Default Lucide icon
      // maxlength removed to support Lucide icon names
    },
    name: {
      type: String,
      default: 'Blue',
      enum: ['Blue', 'Green', 'Red', 'Purple', 'Yellow', 'Pink', 'Indigo', 'Gray'],
    }
  },

  // Relationships
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // Statistics (calculated)
  stats: {
    totalBills: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    remainingBudget: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },

  // Settings
  settings: {
    allowNegative: {
      type: Boolean,
      default: true,
    },
    showInDashboard: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Update stats before saving
 */
SectionSchema.pre('save', function () {
  // Calculate remaining budget
  this.stats.remainingBudget = this.budget - this.stats.totalAmount;
  this.updatedAt = Date.now();
});

/**
 * Virtual for overspent status
 */
SectionSchema.virtual('isOverspent').get(function () {
  return this.stats.remainingBudget < 0;
});

/**
 * Virtual for budget percentage used
 */
SectionSchema.virtual('budgetPercentage').get(function () {
  if (this.budget <= 0) return 0;
  const percentage = (this.stats.totalAmount / this.budget) * 100;
  return Math.min(percentage, 100); // Cap at 100%
});

/**
 * Virtual for formatted total amount
 */
SectionSchema.virtual('totalAmountFormatted').get(function () {
  return `₦${this.stats.totalAmount.toFixed(2)}`;
});

/**
 * Virtual for formatted remaining budget
 */
SectionSchema.virtual('remainingBudgetFormatted').get(function () {
  return `₦${this.stats.remainingBudget.toFixed(2)}`;
});

/**
 * Virtual for formatted budget
 */
SectionSchema.virtual('budgetFormatted').get(function () {
  return `₦${this.budget.toFixed(2)}`;
});

/**
 * Update section statistics
 * @param {string} sectionId - Section ID
 */
SectionSchema.statics.updateSectionStats = async function (sectionId) {
  try {
    const Bill = mongoose.model('Bill');

    // Aggregate bill data for this section
    const stats = await Bill.aggregate([
      { $match: { section: new mongoose.Types.ObjectId(sectionId) } },
      {
        $group: {
          _id: '$section',
          totalBills: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          lastBillDate: { $max: '$date' }
        }
      }
    ]);

    const updateData = {
      'stats.totalBills': stats[0]?.totalBills || 0,
      'stats.totalAmount': stats[0]?.totalAmount || 0,
      'stats.lastUpdated': stats[0]?.lastBillDate || Date.now(),
    };

    // Calculate remaining budget
    const section = await this.findById(sectionId);
    if (section) {
      updateData['stats.remainingBudget'] = section.budget - (stats[0]?.totalAmount || 0);
    }

    return await this.findByIdAndUpdate(
      sectionId,
      { $set: updateData },
      { new: true }
    );

  } catch (error) {
    console.error('Error updating section stats:', error);
    throw error;
  }
};

/**
 * Get all sections for a user with statistics
 * @param {string} userId - User ID
 */
SectionSchema.statics.getUserSections = async function (userId) {
  return await this.find({ user: userId })
    .sort({ 'settings.showInDashboard': -1, createdAt: -1 })
    .lean();
};

// Create indexes
SectionSchema.index({ user: 1, createdAt: -1 });
SectionSchema.index({ 'settings.isArchived': 1 });
SectionSchema.index({ 'stats.totalAmount': -1 });

const Section = mongoose.model('Section', SectionSchema);

module.exports = Section;