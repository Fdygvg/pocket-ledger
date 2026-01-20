// ========================
// AUTH TYPES
// ========================

export interface User {
  _id: string;
  accessToken?: string; // Only returned on registration
  username: string;
  avatar: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    currency: string;
    recentTags?: string[];
  };
  stats: {
    totalSections: number;
    totalBills: number;
    totalSpent: number;
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  needsProfileSetup?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken?: string;
    cookieInfo?: string;
    instructions?: string[];
  };
}

export interface RegisterResponse extends AuthResponse {
  data: AuthResponse['data'] & {
    accessToken: string; // Required for registration
    warning: string;
  };
}

export interface LoginCredentials {
  accessToken: string;
}

export interface ProfileSetupData {
  username: string;
  avatar: string;
}

export interface PreferencesData {
  theme?: 'light' | 'dark' | 'system';
  currency?: string;
}

// ========================
// SECTION TYPES
// ========================

export interface Theme {
  color: string; // Hex color
  icon: string;  // Lucide icon name
  name: string;  // Theme name
}

export interface SectionStats {
  totalBills: number;
  totalAmount: number;
  remainingBudget: number;
  lastUpdated: string;
}

export interface SectionSettings {
  allowNegative: boolean;
  showInDashboard: boolean;
  isArchived: boolean;
}

export interface Section {
  _id: string;
  name: string;
  budget: number;
  description: string;
  theme: Theme;
  user: string;
  stats: SectionStats;
  settings: SectionSettings;
  createdAt: string;
  updatedAt: string;

  // Virtual fields (computed)
  isOverspent?: boolean;
  budgetPercentage?: number;
  totalAmountFormatted?: string;
  remainingBudgetFormatted?: string;
  budgetFormatted?: string;
}

export interface CreateSectionData {
  name: string;
  budget?: number;
  description?: string;
  theme?: Partial<Theme>;
}

export interface UpdateSectionData extends Partial<CreateSectionData> {
  settings?: Partial<SectionSettings>;
}

export interface SectionResponse {
  success: boolean;
  message: string;
  data: {
    section: Section;
    totals?: {
      totalSections: number;
      totalBudget: number;
      totalSpent: number;
      totalRemaining: number;
      overspentSections: number;
    };
    count?: number;
  };
}

export interface SectionsResponse {
  success: boolean;
  data: {
    sections: Section[];
    totals: {
      totalSections: number;
      totalBudget: number;
      totalSpent: number;
      totalRemaining: number;
      overspentSections: number;
    };
    count: number;
  };
}

// ========================
// BILL TYPES
// ========================

export interface Bill {
  _id: string;
  name: string;
  amount: number;
  description: string;
  tag: string; // Emoji
  date: string;
  timeFrame: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'one-time';
  section: string | Pick<Section, '_id' | 'name' | 'theme'>;
  user: string;
  status: 'active' | 'archived' | 'deleted';
  metadata?: {
    createdBy?: string;
    updatedBy?: string;
    device?: string;
    location?: string;
  };
  createdAt: string;
  updatedAt: string;

  // Virtual fields (computed)
  amountFormatted?: string;
  dateFormatted?: string;
  timeFormatted?: string;
  daysAgo?: string;
  amountColor?: string;
  amountIcon?: string;
  isNegative?: boolean;
}

export interface CreateBillData {
  name: string;
  amount: number | string; // Allow string for calculations
  description?: string;
  tag?: string;
  date?: string;
  section: string;
}

export type UpdateBillData = Partial<CreateBillData>;


export interface BillFilters {
  section?: string;
  tag?: string;
  startDate?: string;
  endDate?: string;
  timeFrame?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'one-time';
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  sortBy?: 'date' | 'amount' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  view?: 'list' | 'stats';
}

export interface BillResponse {
  success: boolean;
  message: string;
  data: {
    bill: Bill;
  };
}

export interface BillsResponse {
  success: boolean;
  data: {
    bills: Bill[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
    statistics?: {
      totals: {
        totalAmount: number;
        count: number;
        positive: number;
        negative: number;
        positiveFormatted: string;
        negativeFormatted: string;
        netFormatted: string;
      };
      tagStats: TagStat[];
      dailyStats: DailyStat[];
    };
    error: string;
  };
}

// ========================
// STATISTICS TYPES
// ========================

export interface TagStat {
  emoji: string;
  count: number;
  totalAmount: number;
  averageAmount: number;
  lastUsed: string;
  lastUsedFormatted?: string;
  percentageOfTotal?: number;
}

export interface DailyStat {
  _id: string; // Date string YYYY-MM-DD
  totalAmount: number;
  count: number;
  tags?: string[];
}
//
export interface SectionStatsResponse {
  success: boolean;
  data: {
    section: Pick<Section, '_id' | 'name' | 'budget' | 'stats'>;
    overview: {
      totalSpent: number;
      totalBills: number;
      averageBill: number;
      largestBill: number;
      smallestBill: number;
      income: number;
      expenses: number;
      netFlow: number;
    };
    tags: TagStat[];
    daily: DailyStat[];
    timeRange: {
      startDate: string;
      endDate: string;
      days: number;
    };
  };
}

// ========================
// API RESPONSE TYPES
// ========================

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  errors?: ValidationError[];
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
// ========================
// COMPONENT PROPS TYPES
// ========================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface CreateSectionModalProps extends ModalProps {
  defaultValues?: Partial<CreateSectionData>;
}

export interface BillFormModalProps extends ModalProps {
  sectionId: string;
  billToEdit?: Bill;
  defaultValues?: Partial<CreateBillData>;
}

export interface SectionCardProps {
  section: Section;
  onEdit?: (section: Section) => void;
  onDelete?: (sectionId: string) => void;
  onArchive?: (sectionId: string, archive: boolean) => void;
  onViewDetails?: (sectionId: string) => void;
}

export interface BillCardProps {
  bill: Bill;
  viewMode?: 'grid' | 'table' | 'list';
  onEdit?: (bill: Bill) => void;
  onDelete?: (billId: string) => void;
  onExpand?: (billId: string) => void;
  expanded?: boolean;
}

export interface PieChartProps {
  data: {
    label: string;
    value: number;
    color: string;
    emoji?: string;
  }[];
  title?: string;
  height?: number;
  width?: number;
}

export interface CalculatorPopoverProps {
  value: string;
  onChange: (value: string) => void;
  onCalculate: (result: number) => void;
}

export interface TagFilterProps {
  tags: TagStat[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  onClear: () => void;
}

export interface ViewToggleProps {
  view: 'grid' | 'table' | 'list';
  onViewChange: (view: 'grid' | 'table' | 'list') => void;
}

export interface CalendarPickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  bills: Bill[];
  className?: string;
}

// ========================
// HOOKS TYPES
// ========================

export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  register: () => Promise<string>; // Returns token
  setupProfile: (data: ProfileSetupData) => Promise<void>;
  updatePreferences: (data: PreferencesData) => Promise<void>;
}

export interface UseBillsReturn {
  bills: Bill[];
  isLoading: boolean;
  error: string | null;
  filters: BillFilters;
  stats: {
    totals: {
      totalAmount: number;
      count: number;
      positive: number;
      negative: number;
    };
    tagStats: TagStat[];
    dailyStats: DailyStat[];
  } | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  } | null;
  setFilters: (filters: Partial<BillFilters>) => void;
  createBill: (data: CreateBillData) => Promise<Bill>;
  updateBill: (id: string, data: UpdateBillData) => Promise<Bill>;
  deleteBill: (id: string) => Promise<void>;
  bulkDeleteBills: (ids: string[]) => Promise<void>;
  refetch: () => Promise<void>;
  getRecentTags: () => Promise<TagStat[]>;
  getTagStatistics: (days?: number) => Promise<TagStat[]>;
  clearError: () => void;
}

// ========================
// UTILITY TYPES
// ========================


export interface AppConfig {
  apiUrl: string;
  appName: string;
  version: string;
  defaultCurrency: string;
  themeColors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
  };
}

// ========================
// FORM TYPES
// ========================



export interface FormState<T = Record<string, unknown>> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

// ========================
// ENUM TYPES
// ========================


export type BillStatus = 'active' | 'archived' | 'deleted';
export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'one-time';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'grid' | 'table' | 'list';


export const BILL_STATUS = {
  ACTIVE: 'active' as BillStatus,
  ARCHIVED: 'archived' as BillStatus,
  DELETED: 'deleted' as BillStatus,
};

export const TIME_FRAME = {
  DAILY: 'daily' as TimeFrame,
  WEEKLY: 'weekly' as TimeFrame,
  MONTHLY: 'monthly' as TimeFrame,
  YEARLY: 'yearly' as TimeFrame,
  ONE_TIME: 'one-time' as TimeFrame,
};

// Sort Order
export const SORT_ORDER = {
  ASC: 'asc' as SortOrder,
  DESC: 'desc' as SortOrder,
};

// View Mode
export const VIEW_MODE = {
  GRID: 'grid' as ViewMode,
  TABLE: 'table' as ViewMode,
  LIST: 'list' as ViewMode,
};

// Theme Mode
export const THEME_MODE = {
};

