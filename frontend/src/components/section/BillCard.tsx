import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { cn, formatCurrency } from '@/lib/utils';
import type { Bill } from '@/types';
import IconRenderer from '@/components/ui/IconRenderer';

import {
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Calendar,
  Tag,
  FileText,
  TrendingUp,
  TrendingDown,
  Copy,
  Check,
} from 'lucide-react';

interface BillCardProps {
  bill: Bill;
  viewMode?: 'grid' | 'list' | 'table';
  onEdit?: (bill: Bill) => void;
  onDelete?: (billId: string) => void;
  onExpand?: (billId: string) => void;
  expanded?: boolean;
  className?: string;
}

const BillCard: React.FC<BillCardProps> = ({
  bill,
  viewMode = 'grid',
  onEdit,
  onDelete,
  onExpand,
  expanded = false,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [internalExpanded, setInternalExpanded] = useState(false);

  // Use external expanded state if provided, otherwise use internal state
  const isExpanded = className?.includes('controlled-expanded') ? expanded : internalExpanded;

  const {
    _id,
    name,
    amount,
    description,
    tag,
    date,
    dateFormatted = new Date(date).toLocaleDateString(),
    daysAgo,
    amountColor = amount < 0 ? 'text-red-600' : 'text-green-600',
    amountIcon = amount < 0 ? 'trending-down' : 'trending-up',
    isNegative = amount < 0,
    section,
  } = bill;

  const handleExpandToggle = () => {
    setInternalExpanded(!internalExpanded);
    onExpand?.(_id);
  };

  const handleCopyDetails = async () => {
    const details = `${name}: ${formatCurrency(amount)} - ${description || 'No description'}`;
    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(_id);
    } catch (error) {
      console.error('Failed to delete bill:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderGridCard = () => (
    <Card className={cn(
      'overflow-hidden transition-all hover:shadow-lg border-2',
      isNegative ? 'border-red-100 dark:border-red-900/30' : 'border-green-100 dark:border-green-900/30',
      className
    )}>
      {/* Status bar */}
      <div className={cn(
        'h-1 w-full',
        isNegative ? 'bg-red-500' : 'bg-green-500'
      )} />

      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-10 w-10 rounded-lg flex items-center justify-center text-lg',
              isNegative ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'
            )}>
              <IconRenderer iconName={amountIcon} className={cn('h-5 w-5', isNegative ? 'text-red-600' : 'text-green-600')} />
            </div>
            <div>
              <h3 className="font-semibold line-clamp-1">{name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{dateFormatted}</span>
                {daysAgo && <span className="text-xs">• {daysAgo}</span>}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(bill)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyDetails}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Details
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600"
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Amount & Tag */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="text-sm gap-1.5 py-1">
              <span className="text-lg">{tag || '📝'}</span>
              {tag}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {isNegative ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-green-500" />
            )}
            <span className={cn('text-2xl font-bold', amountColor)}>
              {formatCurrency(amount)}
            </span>
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="mb-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
        )}

        {/* Section info */}
        {section && typeof section === 'object' && (
          <div className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: section.theme?.color || '#3B82F6',
              }}
            />
            <span className="text-muted-foreground">{section.name}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-2"
          onClick={handleExpandToggle}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show Details
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  const renderListCard = () => (
    <Card className={cn(
      'overflow-hidden border-l-4 transition-all hover:shadow-md',
      isNegative
        ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10'
        : 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10',
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Tag */}
            <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center text-xl">
              {tag || '📝'}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{name}</h3>
                <Badge variant="outline" className="text-xs gap-1.5">
                  <span className="text-sm">{tag || '📝'}</span>
                  {tag}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {dateFormatted} • {formatTime(date)}
                </span>
                {daysAgo && <span>• {daysAgo}</span>}
              </div>
              {description && (
                <p className="text-sm text-muted-foreground mt-1 truncate">
                  {description}
                </p>
              )}
            </div>

            {/* Amount & Actions */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={cn('text-xl font-bold', amountColor)}>
                  {formatCurrency(amount)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isNegative ? 'Expense' : 'Income'}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(bill)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExpandToggle}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600"
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderExpandedDetails = () => (
    <div className="mt-4 space-y-3 animate-in fade-in">
      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Date & Time</p>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{dateFormatted} at {formatTime(date)}</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Type</p>
          <Badge variant={isNegative ? 'destructive' : 'outline'}>
            {isNegative ? 'Expense' : 'Income'}
          </Badge>
        </div>
      </div>

      {description && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Description
          </p>
          <p className="text-sm">{description}</p>
        </div>
      )}

      {section && typeof section === 'object' && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Section</p>
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded"
              style={{
                backgroundColor: section.theme?.color || '#3B82F6',
              }}
            />
            <span>{section.name}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={() => onEdit?.(bill)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopyDetails}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Details
            </>
          )}
        </Button>
      </div>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <>
        {renderListCard()}
        {isExpanded && renderExpandedDetails()}
      </>
    );
  }

  return (
    <>
      {renderGridCard()}
      {isExpanded && renderExpandedDetails()}
    </>
  );
};

export default BillCard;