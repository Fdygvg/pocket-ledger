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
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Palette, Eye, Type, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Theme, CreateSectionData } from '@/types';
import IconRenderer from '@/components/ui/IconRenderer';

interface CreateSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSectionData) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<CreateSectionData>;
}

const themePresets: Theme[] = [
  { color: '#3B82F6', icon: 'folder', name: 'Blue' },
  { color: '#10B981', icon: 'wallet', name: 'Green' },
  { color: '#EF4444', icon: 'flame', name: 'Red' },
  { color: '#8B5CF6', icon: 'crown', name: 'Purple' },
  { color: '#F59E0B', icon: 'star', name: 'Yellow' },
  { color: '#EC4899', icon: 'flower', name: 'Pink' },
  { color: '#6366F1', icon: 'sparkles', name: 'Indigo' },
  { color: '#6B7280', icon: 'settings', name: 'Gray' },
];

const CreateSectionModal: React.FC<CreateSectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  defaultValues,
}) => {
  const [formData, setFormData] = useState<CreateSectionData>({
    name: '',
    budget: 0,
    description: '',
    theme: themePresets[0],
    ...defaultValues,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themePresets[0]);

  useEffect(() => {
    if (defaultValues?.theme) {
      setSelectedTheme({
        ...themePresets[0],
        ...defaultValues.theme,
      } as Theme);
    }
  }, [defaultValues]);

  const handleChange = (field: keyof CreateSectionData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Section name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    if (formData.budget !== undefined && formData.budget < 0) {
      newErrors.budget = 'Budget cannot be negative';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit({
        ...formData,
        theme: selectedTheme,
      });
      handleClose();
    } catch (error) {
      console.error('Failed to create section:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      budget: 0,
      description: '',
      theme: themePresets[0],
      ...defaultValues,
    });
    setErrors({});
    setSelectedTheme(themePresets[0]);
    onClose();
  };

  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl">Create New Section</DialogTitle>
          <DialogDescription>
            Organize your expenses into custom categories with budgets and themes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="create-section-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Section Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Section Name
              </Label>
              <Input
                id="name"
                placeholder="e.g., Groceries, Rent, Entertainment"
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
                Give your section a descriptive name (max 50 characters)
              </p>
            </div>

            {/* Budget */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="budget" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Monthly Budget
                </Label>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(formData.budget || 0)}
                </span>
              </div>

              <div className="space-y-2">
                <Slider
                  value={[formData.budget || 0]}
                  onValueChange={([value]) => handleChange('budget', value)}
                  max={250000}
                  step={100}
                  className="w-full"
                  disabled={isLoading}
                />
                <div className="flex justify-between text-[10px] md:text-sm text-muted-foreground px-1">
                  <span>₦0</span>
                  <span>₦50k</span>
                  <span>₦100k</span>
                  <span>₦150k</span>
                  <span>₦200k</span>
                  <span>₦250k</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[0, 25000, 50000, 100000, 150000, 250000].map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleChange('budget', amount)}
                    className={cn(
                      'w-full text-xs md:text-sm h-10',
                      (formData.budget || 0) === amount && 'border-primary bg-primary/10'
                    )}
                  >
                    {amount === 0 ? 'None' : formatCurrency(amount)}
                  </Button>
                ))}
              </div>

              {errors.budget && (
                <p className="text-sm text-red-500">{errors.budget}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What expenses belong in this section?"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className={cn('min-h-[100px]', errors.description && 'border-red-500')}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Brief description of this section</span>
                <span>{(formData.description || '').length}/200</span>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Choose a Theme
              </Label>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {themePresets.map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => setSelectedTheme(theme)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all hover:scale-105',
                      selectedTheme.name === theme.name
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent hover:border-muted-foreground/30'
                    )}
                    disabled={isLoading}
                  >
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: theme.color }}
                    >
                      <IconRenderer iconName={theme.icon} className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-medium">{theme.name}</span>
                  </button>
                ))}
              </div>

              {/* Theme Preview */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: selectedTheme.color }}
                  >
                    <IconRenderer iconName={selectedTheme.icon} className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{formData.name || 'Section Name'}</p>
                    <p className="text-sm text-muted-foreground">
                      Budget: {formatCurrency(formData.budget || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="p-6 pt-4 border-t gap-2 sm:gap-0">
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
            form="create-section-form"
            disabled={isLoading || !formData.name.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Section'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSectionModal;