import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn, formatCurrency } from "@/lib/utils";
import type { Section } from "@/types";
import { Loader2 } from "lucide-react";
import IconRenderer from "@/components/ui/IconRenderer";

import {
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SectionCardProps {
  section: Section;
  onEdit?: (section: Section) => void;
  onDelete?: (sectionId: string) => void;
  onArchive?: (sectionId: string, archive: boolean) => void;
  onViewDetails?: (sectionId: string) => void;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  section,
  onEdit,
  onDelete,
  onArchive,
  onViewDetails,
  className,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    _id,
    name,
    description,
    budget,
    theme,
    stats,
    settings,
    createdAt,
    isOverspent,
    budgetPercentage = 0,
  } = section;

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(_id);
    } catch (error) {
      console.error("Failed to delete section:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleArchive = () => {
    if (onArchive) {
      onArchive(_id, !settings.isArchived);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <Card
        className={cn(
          "overflow-hidden transition-all hover:shadow-lg border-2",
          settings.isArchived && "opacity-60",
          isOverspent && "border-red-200 dark:border-red-900",
          className
        )}
      >
        {/* Header with theme color */}
        <div className="h-2 w-full" style={{ backgroundColor: theme.color }} />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${theme.color}20` }}
              >
                <IconRenderer iconName={theme.icon} className="h-7 w-7" style={{ color: theme.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{name}</h3>
                  {settings.isArchived && (
                    <Badge variant="outline" className="text-xs">
                      Archived
                    </Badge>
                  )}
                  {isOverspent && (
                    <Badge variant="destructive" className="text-xs">
                      Overspent
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Created {formatDate(createdAt)}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onViewDetails && (
                  <DropdownMenuItem onClick={() => onViewDetails(_id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(section)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onArchive && (
                  <DropdownMenuItem onClick={handleArchive}>
                    <Archive className="mr-2 h-4 w-4" />
                    {settings.isArchived ? "Unarchive" : "Archive"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {description}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Budget Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Budget Usage</span>
              <span
                className={cn(
                  "font-bold",
                  isOverspent ? "text-red-600" : "text-green-600"
                )}
              >
                {budgetPercentage.toFixed(1)}%
              </span>
            </div>

            <Progress
              value={Math.min(budgetPercentage, 100)}
              className={cn(
                "h-2",
                budgetPercentage > 90 && "bg-red-100 dark:bg-red-900/30",
                budgetPercentage > 75 &&
                budgetPercentage <= 90 &&
                "bg-amber-100 dark:bg-amber-900/30"
              )}
              style={
                {
                  // Override the CSS variable for indicator color
                  "--progress-indicator-color":
                    budgetPercentage > 90
                      ? "#ef4444" // red-500
                      : budgetPercentage > 75 && budgetPercentage <= 90
                        ? "#f59e0b" // amber-500
                        : "#10b981", // green-500
                } as React.CSSProperties
              }
            />
          </div>

          {/* Financial Stats */}
          <div className="grid grid-cols-3 gap-2 border-y py-3 my-2">
            <div className="text-center">
              <p className="text-lg font-bold truncate" title={formatCurrency(stats.totalAmount)}>
                {formatCurrency(stats.totalAmount)}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Spent</p>
            </div>
            <div className="text-center border-x px-1">
              <p className={cn(
                "text-lg font-bold truncate",
                isOverspent ? "text-red-600" : "text-foreground"
              )} title={formatCurrency(budget - stats.totalAmount)}>
                {formatCurrency(budget - stats.totalAmount)}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {isOverspent ? "Overspent" : "Remaining"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold truncate" title={formatCurrency(budget)}>
                {formatCurrency(budget)}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Budget</p>
            </div>
          </div>

          {/* Bills Count */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>{stats.totalBills} bills</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Updated {formatDate(stats.lastUpdated)}</span>
            </div>
          </div>

          {/* Toggle Details */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show Details
              </>
            )}
          </Button>

          {/* Expanded Details */}
          {showDetails && (
            <div className="space-y-3 pt-4 border-t animate-in fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge
                    variant={isOverspent ? "destructive" : "outline"}
                    className={cn(
                      "w-full justify-center",
                      !isOverspent &&
                      "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    )}
                  >
                    {isOverspent ? (
                      <>
                        <TrendingDown className="mr-1 h-3 w-3" />
                        Overspent
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-1 h-3 w-3" />
                        On Track
                      </>
                    )}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Visibility
                  </p>
                  <Badge variant="outline" className="w-full justify-center">
                    {settings.showInDashboard ? "Visible" : "Hidden"}
                  </Badge>
                </div>
              </div>

              {description && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Description
                  </p>
                  <p className="text-sm">{description}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          <Button
            variant="default"
            className="w-full"
            onClick={() => onViewDetails?.(_id)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Section
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{name}"? This action cannot be
              undone.
              {stats.totalBills > 0 && (
                <div className="mt-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    ⚠️ This section contains {stats.totalBills} bill(s).
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    All bills in this section will also be deleted.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Section"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SectionCard;
