import React from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

import { Grid3X3, List, Table } from 'lucide-react';

interface ViewToggleProps {
  view: 'grid' | 'list' | 'table';
  onViewChange: (view: 'grid' | 'list' | 'table') => void;
  className?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ViewToggle: React.FC<ViewToggleProps> = ({
  view,
  onViewChange,
  className,
  showLabels = true,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  const iconSize = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  const views = [
    {
      value: 'grid',
      icon: Grid3X3,
      label: 'Grid',
      description: 'Card layout',
    },
    {
      value: 'list',
      icon: List,
      label: 'List',
      description: 'Compact list',
    },
    {
      value: 'table',
      icon: Table,
      label: 'Table',
      description: 'Detailed table',
    },
  ];

  return (
    <div className={cn('flex items-center', className)}>
      <ToggleGroup
        type="single"
        value={view}
        onValueChange={(value) => {
          if (value) onViewChange(value as 'grid' | 'list' | 'table');
        }}
        className={cn(
          'border rounded-md overflow-hidden p-1',
          'bg-background'
        )}
      >
        {views.map(({ value, icon: Icon, label }) => (
          <ToggleGroupItem
            key={value}
            value={value}
            className={cn(
              'px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
              'data-[state=on]:shadow-sm',
              sizeClasses[size]
            )}
            aria-label={`Switch to ${label} view`}
          >
            <Icon size={iconSize[size]} className={cn(showLabels && "mr-2")} />
            {showLabels && label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default ViewToggle;