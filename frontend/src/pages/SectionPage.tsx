import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useBills } from '@/hooks/useBills';
import BillCard from '@/components/section/BillCard';
import BillFormModal from '@/components/section/BillFormModal';
import PieChart from '@/components/section/PieChart';
import TagFilter from '@/components/section/TagFilter';
import ViewToggle from '@/components/section/ViewToggle';
import CalendarPicker from '@/components/section/CalendarPicker';
import { cn, formatCurrency, formatDate, getRelativeTime } from '@/lib/utils';
import type { Section, Bill, CreateBillData, UpdateBillData } from '@/types';
import IconRenderer from '@/components/ui/IconRenderer';
import { api } from '@/lib/api';

import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  List,
  PieChart as PieChartIcon,
  MoreVertical,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CalendarDays,
} from 'lucide-react';

const SectionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    bills,
    stats,
    pagination,
    isLoading: billsLoading,
    setFilters,
    createBill,
    updateBill,
    deleteBill,
  } = useBills({
    section: id,
    limit: 50,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // State
  const [section, setSection] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'list'>('grid');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeFrame, setTimeFrame] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [showBillForm, setShowBillForm] = useState(false);
  const [billToEdit, setBillToEdit] = useState<Bill | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);


  // Fetch section details
  const fetchSection = useCallback(async (silent = false) => {
    if (!id || !user) return;

    if (!silent) setIsLoading(true);
    try {
      const response = await api.get(`/sections/${id}`);
      if (response.success) {
        setSection((response as any).data.section);
      } else {
        throw new Error((response as any).error?.message || 'Failed to fetch section');
      }
    } catch (error) {
      console.error('Failed to fetch section:', error);
      navigate('/dashboard'); // Redirect if section not found
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [id, user, navigate]);

  useEffect(() => {
    fetchSection();
    // Update bills filter when section changes
    if (id) {
      setFilters({ section: id });
    }
  }, [id, fetchSection, setFilters]);

  // Filter bills based on search, tag, and date
  const filteredBills = bills.filter(bill => {
    const matchesSearch = searchQuery === '' ||
      bill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = !selectedTag || bill.tag === selectedTag;

    // Helper for local YYYY-MM-DD string
    const getLocalDateStr = (d: Date) => {
      const offset = d.getTimezoneOffset();
      const local = new Date(d.getTime() - (offset * 60 * 1000));
      return local.toISOString().split('T')[0];
    };

    const billDateStr = bill.date.split('T')[0];

    const matchesDate = !selectedDate ||
      billDateStr === getLocalDateStr(selectedDate);

    const matchesTimeFrame = (() => {
      if (timeFrame === 'all') return true;

      const now = new Date();
      const todayStr = getLocalDateStr(now);

      if (timeFrame === 'daily') return billDateStr === todayStr;

      // For weekly/monthly, use day difference based on local dates
      const billDate = new Date(bill.date);
      const diffTime = now.getTime() - billDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (timeFrame === 'weekly') return diffDays < 7;
      if (timeFrame === 'monthly') return diffDays < 30;

      return bill.timeFrame === timeFrame;
    })();

    return matchesSearch && matchesTag && matchesDate && matchesTimeFrame;
  });

  // Handle bill creation
  const handleCreateBill = async (data: CreateBillData) => {
    try {
      await createBill({
        ...data,
        section: id!,
      });
      setShowBillForm(false);
      // Data is already refetched by createBill, we just need to update section stats silently
      await fetchSection(true);
    } catch (error) {
      console.error('Failed to create bill:', error);
    }
  };

  // Handle bill update
  const handleUpdateBill = async (billId: string, data: UpdateBillData) => {
    try {
      await updateBill(billId, data);
      setBillToEdit(null);
      // Data refetched by updateBill, update section stats silently
      await fetchSection(true);
    } catch (error) {
      console.error('Failed to update bill:', error);
    }
  };

  // Handle bill deletion
  const handleDeleteBill = async (billId: string) => {
    try {
      await deleteBill(billId);
      // Data updated by deleteBill, update section stats silently
      await fetchSection(true);
    } catch (error) {
      console.error('Failed to delete bill:', error);
    }
  };

  // Handle tag selection
  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
  };

  // Handle date selection
  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      setTimeFrame('all'); // Clear time frame when specific date selected
    }
  };
  // Prepare chart data
  const chartData = stats?.tagStats.map(tag => ({
    label: tag.emoji || '?',
    value: Math.abs(tag.totalAmount),
    // Color is now handled internally by PieChart
    icon: tag.emoji || '📝',
  })) || [];

  // Top Expenses
  const topExpenses = [...bills]
    .filter(b => b.amount > 0) // Only expenses
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Section not found</h2>
        <p className="text-muted-foreground mb-6">
          The section you're looking for doesn't exist or you don't have access.
        </p>
        <Button onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isOverspent = section.stats.remainingBudget < 0;
  const budgetPercentage = section.budget > 0
    ? Math.min((section.stats.totalAmount / section.budget) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="hidden sm:inline-flex"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: section.theme.color }}
                >
                  <IconRenderer iconName={section.theme.icon} className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{section.name}</h1>
                    {section.settings.isArchived && (
                      <Badge variant="outline">Archived</Badge>
                    )}
                    {isOverspent && (
                      <Badge variant="destructive">Overspent</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {section.description || 'No description'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Show Details
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBillForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Bill
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/sections/${id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Section Details */}
      {showDetails && (
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Section Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{formatDate(section.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span>{getRelativeTime(section.updatedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={section.settings.isArchived ? "outline" : "default"}>
                        {section.settings.isArchived ? 'Archived' : 'Active'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Theme</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded"
                          style={{ backgroundColor: section.theme.color }}
                        />
                        <span>{section.theme.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Budget Overview</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Budget Utilization</span>
                        <span className="font-medium">{budgetPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={budgetPercentage} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <div className="text-lg font-bold">
                          {formatCurrency(section.stats.totalAmount)}
                        </div>
                        <div className="text-xs text-muted-foreground">Spent</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <div className={cn(
                          "text-lg font-bold",
                          isOverspent && "text-red-600"
                        )}>
                          {formatCurrency(section.stats.remainingBudget)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isOverspent ? 'Overspent' : 'Remaining'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Bills</span>
                      <span className="font-medium">{section.stats.totalBills}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Bill</span>
                      <span className="font-medium">
                        {section.stats.totalBills > 0
                          ? formatCurrency(section.stats.totalAmount / section.stats.totalBills)
                          : formatCurrency(0)
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-medium">{formatCurrency(section.budget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Bill Added</span>
                      <span>{getRelativeTime(section.stats.lastUpdated)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {section.description && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="bills" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="bills">
              <List className="h-4 w-4 mr-2" />
              Bills ({filteredBills.length})
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings">
              <MoreVertical className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Bills Tab */}
          <TabsContent value="bills" className="space-y-6">
            {/* Filters and Controls */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Top Row: Search & View Controls */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search bills..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <ViewToggle
                        view={viewMode}
                        onViewChange={setViewMode}
                      />
                      <Button
                        variant={showCalendar ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setShowCalendar(!showCalendar)}
                        className={cn("h-10", selectedDate && "border-primary text-primary")}
                      >
                        <CalendarDays className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Calendar</span>
                        {selectedDate && (
                          <Badge variant="secondary" className="ml-2 px-1 py-0 h-4 text-[10px]">
                            1
                          </Badge>
                        )}
                      </Button>

                      {(searchQuery || selectedTag || selectedDate || timeFrame !== 'all') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedTag(null);
                            setSelectedDate(null);
                            setTimeFrame('all');
                            setShowCalendar(false);
                          }}
                          className="h-10 w-10 text-muted-foreground hover:text-foreground"
                          title="Clear filters"
                        >
                          <Filter className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Middle Sections: Calendar */}
                  {showCalendar && (
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <CalendarPicker
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                        bills={bills}
                        onClose={() => setShowCalendar(false)}
                        className="border-none shadow-none p-0 mx-auto"
                      />
                    </div>
                  )}

                  {/* Bottom Control Bar: Tags & Timeframe */}
                  <div className="flex flex-col gap-4">
                    <TagFilter
                      tags={stats?.tagStats || []}
                      selectedTag={selectedTag}
                      onTagSelect={handleTagSelect}
                      onClear={() => setSelectedTag(null)}
                      className="pb-2"
                    />

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                      {['all', 'daily', 'weekly', 'monthly'].map((frame) => (
                        <Button
                          key={frame}
                          variant={timeFrame === frame ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setTimeFrame(frame as 'all' | 'daily' | 'weekly' | 'monthly');
                            if (frame !== 'all') {
                              setSelectedDate(null); // Clear specific date when time frame selected
                            }
                          }}
                          className="whitespace-nowrap rounded-full px-4"
                        >
                          {frame === 'all' ? 'All Time' :
                            frame === 'daily' ? 'Today' :
                              frame === 'weekly' ? 'This Week' : 'This Month'}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {formatCurrency(
                        filteredBills.reduce((sum, bill) => sum + (bill.amount > 0 ? bill.amount : 0), 0)
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Expenses</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(
                        Math.abs(filteredBills.reduce((sum, bill) => sum + (bill.amount < 0 ? bill.amount : 0), 0))
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Income</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {formatCurrency(
                        filteredBills.reduce((sum, bill) => sum + bill.amount, 0)
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">Net Flow</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bills List/Grid/Table */}
            {billsLoading ? (
              <div className={cn(
                "grid gap-4",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" :
                  viewMode === 'table' ? "grid-cols-1" :
                    "grid-cols-1"
              )}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredBills.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="mx-auto max-w-md">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No bills found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || selectedTag || selectedDate || timeFrame !== 'all'
                        ? 'No bills match your current filters'
                        : 'Add your first bill to this section'
                      }
                    </p>
                    <Button onClick={() => setShowBillForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Bill
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className={cn(
                viewMode === 'table' ? "overflow-x-auto" : "grid gap-4",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" :
                  viewMode === 'list' ? "grid-cols-1" :
                    ""
              )}>
                {viewMode === 'table' ? (
                  <Card>
                    <CardContent className="p-0">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4 font-medium">Name</th>
                            <th className="text-left p-4 font-medium">Tag</th>
                            <th className="text-left p-4 font-medium">Date</th>
                            <th className="text-left p-4 font-medium">Amount</th>
                            <th className="text-left p-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBills.map((bill) => (
                            <tr key={bill._id} className="border-b hover:bg-muted/50">
                              <td className="p-4">
                                <div className="font-medium">{bill.name}</div>
                                {bill.description && (
                                  <div className="text-sm text-muted-foreground">
                                    {truncateText(bill.description, 50)}
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="text-2xl">{bill.tag || '📝'}</div>
                              </td>
                              <td className="p-4">
                                <div>{formatDate(bill.date)}</div>
                                <div className="text-sm text-muted-foreground">
                                  {getRelativeTime(bill.date)}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className={cn(
                                  "font-bold",
                                  bill.amount < 0 ? "text-green-600" : "text-red-600"
                                )}>
                                  {formatCurrency(bill.amount)}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setBillToEdit(bill)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteBill(bill._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                ) : (
                  filteredBills.map((bill) => (
                    <BillCard
                      key={bill._id}
                      bill={bill}
                      viewMode={viewMode}
                      onEdit={() => setBillToEdit(bill)}
                      onDelete={() => handleDeleteBill(bill._id)}
                    />
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setFilters({ page: pagination.page - 1 })}
                >
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setFilters({ page: pagination.page + 1 })}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <PieChart
                data={chartData}
                className="h-full min-h-[400px]"
                height={350}
              />

              {/* Top Expenses - NEW */}
              <Card className="flex flex-col h-full">
                <CardHeader>
                  <CardTitle>Top Expenses</CardTitle>
                  <CardDescription>
                    Your largest individual bills
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {topExpenses.length > 0 ? (
                    <div className="space-y-4">
                      {topExpenses.map((bill) => (
                        <div key={bill._id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                              {bill.tag || '📝'}
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{bill.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(bill.date)} • {getRelativeTime(bill.date)}
                              </div>
                            </div>
                          </div>
                          <div className="font-bold font-mono">
                            {formatCurrency(bill.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
                      <AlertCircle className="h-8 w-8" />
                      <p>No expenses recorded yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tag Statistics & Daily (Secondary Row) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tag Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Tag Statistics</CardTitle>
                  <CardDescription>
                    Most used tags and their totals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.tagStats && stats.tagStats.length > 0 ? (
                    <div className="space-y-4">
                      {stats.tagStats.slice(0, 5).map((tag) => (
                        <div key={tag.emoji} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{tag.emoji}</div>
                            <div>
                              <div className="font-medium">{tag.count} bills</div>
                              <div className="text-xs text-muted-foreground">
                                Last used {getRelativeTime(tag.lastUsed)}
                              </div>
                            </div>
                          </div>
                          <div className={cn(
                            "font-bold",
                            tag.totalAmount < 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {formatCurrency(tag.totalAmount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No tag statistics available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Daily Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Spending</CardTitle>
                  <CardDescription>
                    Expenses over the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.dailyStats && stats.dailyStats.length > 0 ? (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {stats.dailyStats.map((day) => (
                        <div key={day._id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{formatDate(day._id)}</span>
                            <span className={cn(
                              "font-bold",
                              day.totalAmount < 0 ? "text-green-600" : "text-red-600"
                            )}>
                              {formatCurrency(day.totalAmount)}
                            </span>
                          </div>
                          <Progress
                            value={Math.min(Math.abs(day.totalAmount) / 500 * 100, 100)}
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{day.count} bills</span>
                            {day.tags && day.tags.length > 0 && (
                              <span>{day.tags.slice(0, 3).join(' ')}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-muted-foreground">
                      No daily statistics available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Section Settings</CardTitle>
                <CardDescription>
                  Manage section preferences and actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Danger Zone */}
                <div className="rounded-lg border border-red-200 dark:border-red-900 p-6">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    These actions are irreversible. Please proceed with caution.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Archive Section</h4>
                        <p className="text-sm text-muted-foreground">
                          Hide this section from the dashboard
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (!section) return;
                          try {
                            const newStatus = !section.settings.isArchived;
                            const response = await api.patch(`/sections/${id}/archive`, { archive: newStatus });
                            if (response.success) {
                              setSection(prev => prev ? {
                                ...prev,
                                settings: { ...prev.settings, isArchived: newStatus }
                              } : null);
                            }
                          } catch (error) {
                            console.error('Failed to archive section:', error);
                          }
                        }}
                      >
                        {section.settings.isArchived ? 'Unarchive' : 'Archive'}
                      </Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-600">Delete Section</h4>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete this section and all its bills
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to delete "${section.name}"? This action cannot be undone.`)) {
                            try {
                              const response = await api.delete(`/sections/${id}`);
                              if (response.success) {
                                navigate('/dashboard');
                              }
                            } catch (error) {
                              console.error('Failed to delete section:', error);
                            }
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Section
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bill Form Modal */}
      <BillFormModal
        isOpen={showBillForm || !!billToEdit}
        onClose={() => {
          setShowBillForm(false);
          setBillToEdit(null);
        }}
        sectionId={id!}
        billToEdit={billToEdit}
        recentTags={stats?.tagStats}
        onSubmit={billToEdit ?
          (data) => handleUpdateBill(billToEdit._id, data) :
          handleCreateBill
        }
      />

      {/* Delete Confirmation Dialog would go here */}
    </div>
  );
};

// Helper function
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export default SectionPage;