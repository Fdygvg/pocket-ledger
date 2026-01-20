import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Loader2, Calculator, CalendarIcon, Tag, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import CalculatorPopover from './CalculatorPopover';
import type { CreateBillData, Bill, TagStat } from '@/types';

interface BillFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBillData) => Promise<void>;
  isLoading?: boolean;
  billToEdit?: Bill | null;
  sectionId: string;
  recentTags?: TagStat[];
  defaultValues?: Partial<CreateBillData>;
}

const commonEmojis = ['📝', '💸', '🍔', '🚗', '🏠', '🛒', '🎮', '💡', '☕', '⛽'];

const BillFormModal: React.FC<BillFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  billToEdit,
  sectionId,
  recentTags = [],
  defaultValues,
}) => {
  const [formData, setFormData] = useState<CreateBillData>({
    name: '',
    amount: '',
    description: '',
    tag: '📝',
    date: format(new Date(), 'yyyy-MM-dd'),
    section: sectionId,
    ...defaultValues,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCalculator, setShowCalculator] = useState(false);
  const [date, setDate] = useState<Date>(new Date());

  // Initialize form with billToEdit data
  useEffect(() => {
    if (billToEdit) {
      setFormData({
        name: billToEdit.name,
        amount: billToEdit.amount.toString(),
        description: billToEdit.description || '',
        tag: billToEdit.tag || '📝',
        date: billToEdit.date.split('T')[0],
        section: typeof billToEdit.section === 'string'
          ? billToEdit.section
          : billToEdit.section._id,
      });
      setDate(new Date(billToEdit.date));
    } else if (defaultValues) {
      setFormData(prev => ({ ...prev, ...defaultValues }));
    }
  }, [billToEdit, defaultValues, sectionId]);

  const handleChange = (field: keyof CreateBillData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAmountChange = (value: string) => {
    // Allow only numbers, decimal point, and basic operators for calculator
    const cleanValue = value.replace(/[^0-9.\-+*/()]/g, '');
    handleChange('amount', cleanValue);
  };

  const handleCalculate = (result: number) => {
    handleChange('amount', result.toString());
    setShowCalculator(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Bill name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else {
      // Try to parse the amount
      try {
        const amountStr = formData.amount.toString().replace(/[$,]/g, '');
        const parsed = eval?.(amountStr);
        if (isNaN(parsed) || !isFinite(parsed)) {
          newErrors.amount = 'Invalid amount';
        }
      } catch {
        newErrors.amount = 'Invalid amount format';
      }
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.tag && formData.tag.length > 20) {
      newErrors.tag = 'Tag name is too long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Parse amount if it's a calculation
      let amountValue = formData.amount;
      if (typeof amountValue === 'string') {
        const cleanAmount = amountValue.replace(/[$,]/g, '');
        if (cleanAmount.includes('+') || cleanAmount.includes('-') ||
          cleanAmount.includes('*') || cleanAmount.includes('/')) {
          // Use safe evaluation
          amountValue = eval?.(cleanAmount);
        } else {
          amountValue = parseFloat(cleanAmount);
        }
      }

      await onSubmit({
        ...formData,
        amount: amountValue,
        date: format(date, 'yyyy-MM-dd'),
      });
      handleClose();
    } catch (error) {
      console.error('Failed to submit bill:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      amount: '',
      description: '',
      tag: '📝',
      date: new Date().toISOString().split('T')[0],
      section: sectionId,
      ...defaultValues,
    });
    setErrors({});
    setDate(new Date());
    setShowCalculator(false);
    onClose();
  };

  const getRecentEmojis = () => {
    // Sort tags by lastUsed (most recent first)
    // Note: TagStat has lastUsed field, but we check existence to be safe
    const sortedTags = [...recentTags].sort((a, b) => {
      const timeA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
      const timeB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
      return timeB - timeA;
    });

    // Get unique emojis from recent tags, prioritizing actually used ones
    const usedEmojis = sortedTags
      .map(tag => {
        // Handle both standard TagStat interface and potential raw aggregation result
        if (typeof tag === 'string') return tag;
        return tag.emoji || (tag as any)._id || '';
      })
      .filter(emoji => emoji && !commonEmojis.includes(emoji));

    // Combine with a few defaults if we don't have enough, but limit to 3 total
    return [...new Set([...usedEmojis, ...commonEmojis])].slice(0, 3);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[96vh] sm:max-h-[90vh] w-[95vw] sm:w-full flex flex-col p-0 overflow-hidden gap-0">
        <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b">
          <DialogTitle className="text-xl sm:text-2xl">
            {billToEdit ? 'Edit Bill' : 'Add New Bill'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {billToEdit ? 'Update your bill details' : 'Track your expenses or income'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form id="bill-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Bill Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Bill Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Grocery shopping, Salary, Rent payment"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={cn(errors.name && 'border-red-500')}
                disabled={isLoading}
                autoFocus
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Descriptive name for your bill (max 100 characters)
              </p>
            </div>

            {/* Amount with Calculator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">Amount *</Label>
                <CalculatorPopover
                  value={formData.amount.toString()}
                  onChange={handleAmountChange}
                  onCalculate={handleCalculate}
                />
              </div>

              <div className="relative">
                <Input
                  id="amount"
                  type="text"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={cn('pr-20 text-lg', errors.amount && 'border-red-500')}
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCalculator(!showCalculator)}
                    className="h-8 w-8"
                  >
                    <Calculator className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}

              {/* Quick amount buttons */}
              <div className="flex flex-wrap gap-2">
                {[100, 500, 1000, 5000, 10000, 50000].map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleChange('amount', amount.toString())}
                    className="text-xs"
                  >
                    ₦{amount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add notes or details about this bill..."
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className={cn('min-h-[80px]', errors.description && 'border-red-500')}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Additional details about this bill</span>
                <span>{(formData.description || '').length}/500</span>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tag (Emoji)
              </Label>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Paste or type an emoji (e.g., 🍕)"
                    value={formData.tag || ''}
                    onChange={(e) => handleChange('tag', e.target.value)}
                    className={cn('flex-1 text-lg', errors.tag && 'border-red-500')}
                    disabled={isLoading}
                    maxLength={10}
                  />
                  <div className="h-10 w-10 rounded border flex items-center justify-center text-xl bg-muted/30">
                    {formData.tag || '📝'}
                  </div>
                </div>

                {/* Recent tags as quick-select */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-muted-foreground mr-1">Recent:</span>
                  {getRecentEmojis().map((emoji) => (
                    <Button
                      key={emoji}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleChange('tag', emoji)}
                      className={cn(
                        'h-9 px-3 text-lg hover:bg-primary/10 transition-colors',
                        formData.tag === emoji && 'border-primary bg-primary/10 ring-1 ring-primary'
                      )}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>

                {errors.tag && (
                  <p className="text-sm text-red-500">{errors.tag}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Use emojis to categorize your bills. Last 3 used tags shown for quick selection.
                </p>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Date
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Quick date buttons */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Today', days: 0 },
                  { label: 'Yesterday', days: -1 },
                  { label: 'Tomorrow', days: 1 },
                  { label: 'Last Week', days: -7 },
                ].map(({ label, days }) => (
                  <Button
                    key={label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date();
                      newDate.setDate(newDate.getDate() + days);
                      setDate(newDate);
                    }}
                    className="text-xs"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please fix the errors above before submitting.
                </AlertDescription>
              </Alert>
            )}

            {/* Preview */}
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-2">Preview</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                  {formData.tag || '📝'}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {formData.name || 'Bill Name'}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{date ? format(date, 'MMM d, yyyy') : 'Date'}</span>
                    <span>•</span>
                    <span className={cn(
                      'font-semibold',
                      formData.amount && parseFloat(formData.amount.toString().replace(/[₦,]/g, '')) < 0
                        ? 'text-red-600'
                        : 'text-green-600'
                    )}>
                      {formData.amount
                        ? `₦${Math.abs(parseFloat(formData.amount.toString().replace(/[₦,]/g, '')) || 0).toLocaleString()}`
                        : '₦0.00'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="p-4 sm:p-6 pt-2 sm:pt-4 border-t gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="bill-form"
            disabled={isLoading || !formData.name.trim() || !formData.amount}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {billToEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              billToEdit ? 'Update Bill' : 'Add Bill'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BillFormModal;