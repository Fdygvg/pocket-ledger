import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { TagStat } from '@/types';
import { X, Filter } from 'lucide-react';

interface TagFilterProps {
  tags: TagStat[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  onClear: () => void;
  className?: string;
}

const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  selectedTag,
  onTagSelect,
  onClear,
  className,
}) => {
  if (tags.length === 0) return null;

  // Sort tags by frequency (count) descending
  const sortedTags = [...tags].sort((a, b) => b.count - a.count);

  return (
    <div className={cn("w-full mb-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filter by tag:</span>
        {selectedTag && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-6 px-2 text-xs hover:bg-muted"
          >
            Clear
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      <ScrollArea className="w-full whitespace-nowrap pb-2">
        <div className="flex w-max space-x-2">
          <Button
            variant={selectedTag === null ? "default" : "outline"}
            size="sm"
            onClick={() => onTagSelect(null)}
            className="rounded-full"
          >
            All
          </Button>

          {sortedTags.map((tag) => {
            const emoji = tag.emoji || (tag as any)._id || '📝';
            const isSelected = selectedTag === emoji;

            return (
              <Button
                key={emoji}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onTagSelect(isSelected ? null : emoji)}
                className={cn(
                  "rounded-full border-dashed",
                  isSelected && "border-solid"
                )}
              >
                <span className="mr-1 text-base">{emoji}</span>
                <span className="text-xs opacity-70">({tag.count})</span>
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default TagFilter;