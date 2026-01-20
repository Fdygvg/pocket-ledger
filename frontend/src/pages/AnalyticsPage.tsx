// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '@/components/layout/Layout';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Separator } from '@/components/ui/separator';
// import { Progress } from '@/components/ui/progress';
// import PieChart from '@/components/section/PieChart';
// import { useAuth } from '@/hooks/useAuth';
// import { useBills } from '@/hooks/useBills';
// import { api } from '@/lib/api';
// import { cn, formatCurrency, formatDate, getRelativeTime } from '@/lib/utils';
// import type { Section, TagStat, DailyStat } from '@/types';

// import {
//     BarChart3,
//     TrendingUp,
//     TrendingDown,
//     DollarSign,
//     Calendar,
//     PieChart as PieChartIcon,
//     Tag,
//     Filter,
//     Download,
//     RefreshCw,
//     AlertCircle,
//     Eye,
//     EyeOff,
//     ChevronRight,
//     Target,
//     Wallet,
//     Clock,
//     Sparkles,
// } from 'lucide-react';

// const AnalyticsPage = () => {
//     const navigate = useNavigate();
//     const { user } = useAuth();
//     const { bills, stats, isLoading: billsLoading, refetch: refetchBills } = useBills({
//         view: 'stats',
//         limit: 1000,
//     });

//     const [sections, setSections] = useState<Section[]>([]);
//     const [tagStats, setTagStats] = useState<TagStat[]>([]);
//     const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
//     const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month');
//     const [activeTab, setActiveTab] = useState('overview');
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [selectedSection, setSelectedSection] = useState<string>('all');
//     const [showNegativeValues, setShowNegativeValues] = useState(true);

//     // Fetch sections and analytics data
//     const fetchAnalytics = async () => {
//         if (!user) return;

//         setIsLoading(true);
//         setError(null);

//         try {
//             // Fetch sections
//             const sectionsResponse = await api.get<{ success: boolean; data: { sections: Section[] } }>('/sections');
//             if (sectionsResponse.success && sectionsResponse.data?.sections) {
//                 setSections(sectionsResponse.data.sections);
//             }

//             // Fetch tag statistics
//             const daysMap = {
//                 week: 7,
//                 month: 30,
//                 year: 365,
//                 all: 9999,
//             };

//             const tagStatsResponse = await api.get<{ success: boolean; data: { tags: TagStat[] } }>(
//                 `/bills/tags/stats?days=${daysMap[timeRange]}`
//             );
//             if (tagStatsResponse.success && tagStatsResponse.data?.tags) {
//                 setTagStats(tagStatsResponse.data.tags);
//             }

//             // Fetch daily stats
//             const dailyStatsResponse = await api.get<{ success: boolean; data: { daily: DailyStat[] } }>(
//                 `/bills?view=stats&days=${daysMap[timeRange]}&limit=1000`
//             );
//             if (dailyStatsResponse.success && dailyStatsResponse.data?.daily) {
//                 setDailyStats(dailyStatsResponse.data.daily);
//             }

//             // Refresh bills for current filters
//             await refetchBills();
//         } catch (err: any) {
//             setError(err.message || 'Failed to load analytics');
//             console.error('Analytics error:', err);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (user) {
//             fetchAnalytics();
//         }
//     }, [user, timeRange]);

//     // Calculate analytics
//     const calculateAnalytics = () => {
//         const filteredBills = selectedSection === 'all'
//             ? bills
//             : bills.filter(bill =>
//                 typeof bill.section === 'string'
//                     ? bill.section === selectedSection
//                     : bill.section._id === selectedSection
//             );

//         const filteredSections = selectedSection === 'all'
//             ? sections
//             : sections.filter(s => s._id === selectedSection);

//         // Income vs Expenses
//         const income = filteredBills.reduce((sum, bill) => sum + (bill.amount > 0 ? bill.amount : 0), 0);
//         const expenses = filteredBills.reduce((sum, bill) => sum + (bill.amount < 0 ? bill.amount : 0), 0);
//         const netFlow = income + expenses; // expenses are negative

//         // Monthly averages
//         const totalDays = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === 'year' ? 365 : filteredBills.length;
//         const dailyAverage = netFlow / totalDays;
//         const monthlyAverage = dailyAverage * 30;

//         // Largest transactions
//         const largestIncome = Math.max(...filteredBills.map(b => b.amount > 0 ? b.amount : 0), 0);
//         const largestExpense = Math.min(...filteredBills.map(b => b.amount < 0 ? b.amount : 0), 0);

//         // Busiest days
//         const dayCounts: Record<string, number> = {};
//         filteredBills.forEach(bill => {
//             const day = new Date(bill.date).toLocaleDateString('en-US', { weekday: 'long' });
//             dayCounts[day] = (dayCounts[day] || 0) + 1;
//         });
//         const busiestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

//         // Section budgets
//         const totalBudget = filteredSections.reduce((sum, s) => sum + s.budget, 0);
//         const totalSpent = filteredSections.reduce((sum, s) => sum + s.stats.totalAmount, 0);
//         const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

//         return {
//             totalBills: filteredBills.length,
//             income,
//             expenses: Math.abs(expenses),
//             netFlow,
//             dailyAverage,
//             monthlyAverage,
//             largestIncome,
//             largestExpense: Math.abs(largestExpense),
//             busiestDay,
//             totalBudget,
//             totalSpent,
//             budgetUsage,
//             filteredBills,
//             filteredSections,
//         };
//     };

//     const analytics = calculateAnalytics();

//     // Prepare chart data
//     const preparePieChartData = () => {
//         // Top spending categories by tag
//         const topTags = tagStats
//             .filter(tag => showNegativeValues || tag.totalAmount < 0)
//             .slice(0, 8)
//             .map((tag, index) => ({
//                 label: tag.emoji || 'Untagged',
//                 value: Math.abs(tag.totalAmount),
//                 color: `hsl(${index * 45}, 70%, 60%)`,
//                 emoji: tag.emoji,
//             }));

//         // Section spending
//         const sectionData = sections
//             .filter(s => showNegativeValues || s.stats.totalAmount < 0)
//             .slice(0, 6)
//             .map((section, index) => ({
//                 label: section.name,
//                 value: Math.abs(section.stats.totalAmount),
//                 color: section.theme.color,
//                 emoji: section.theme.icon,
//             }));

//         return {
//             tags: topTags,
//             sections: sectionData,
//         };
//     };

//     const chartData = preparePieChartData();

//     // Export data
//     const handleExportData = () => {
//         const exportData = {
//             timestamp: new Date().toISOString(),
//             timeRange,
//             selectedSection: selectedSection === 'all' ? 'All Sections' :
//                 sections.find(s => s._id === selectedSection)?.name,
//             analytics,
//             sections: sections.map(s => ({
//                 name: s.name,
//                 budget: s.budget,
//                 spent: s.stats.totalAmount,
//                 remaining: s.stats.remainingBudget,
//             })),
//             tagStats,
//             dailyStats,
//         };

//         const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `pocketledger-analytics-${new Date().toISOString().split('T')[0]}.json`;
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         URL.revokeObjectURL(url);
//     };

//     if (!user) {
//         return (
//             <Layout>
//                 <div className="container mx-auto px-4 py-12">
//                     <Alert>
//                         <AlertCircle className="h-4 w-4" />
//                         <AlertDescription>
//                             Please log in to view analytics.
//                         </AlertDescription>
//                     </Alert>
//                 </div>
//             </Layout>
//         );
//     }

//     return (
//         <Layout>
//             <div className="container mx-auto px-4 py-6">
//                 {/* Header */}
//                 <div className="mb-8">
//                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//                         <div>
//                             <h1 className="text-3xl font-bold flex items-center gap-2">
//                                 <BarChart3 className="h-8 w-8 text-primary" />
//                                 Financial Analytics
//                             </h1>
//                             <p className="text-muted-foreground mt-1">
//                                 Insights and trends from your spending habits
//                             </p>
//                         </div>

//                         <div className="flex items-center gap-2">
//                             <Button
//                                 variant="outline"
//                                 onClick={handleExportData}
//                                 className="gap-2"
//                             >
//                                 <Download className="h-4 w-4" />
//                                 Export Data
//                             </Button>
//                             <Button
//                                 variant="outline"
//                                 size="icon"
//                                 onClick={fetchAnalytics}
//                                 disabled={isLoading || billsLoading}
//                             >
//                                 <RefreshCw className={cn('h-4 w-4', (isLoading || billsLoading) && 'animate-spin')} />
//                             </Button>
//                         </div>
//                     </div>

//                     {/* Filters */}
//                     <Card className="mb-6">
//                         <CardContent className="p-4">
//                             <div className="flex flex-col md:flex-row gap-4 items-center">
//                                 <div className="flex-1 flex flex-col sm:flex-row gap-3">
//                                     <div className="flex-1">
//                                         <label className="text-sm font-medium mb-1 block">Time Range</label>
//                                         <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
//                                             <SelectTrigger>
//                                                 <SelectValue />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 <SelectItem value="week">Last 7 Days</SelectItem>
//                                                 <SelectItem value="month">Last 30 Days</SelectItem>
//                                                 <SelectItem value="year">Last Year</SelectItem>
//                                                 <SelectItem value="all">All Time</SelectItem>
//                                             </SelectContent>
//                                         </Select>
//                                     </div>

//                                     <div className="flex-1">
//                                         <label className="text-sm font-medium mb-1 block">Filter by Section</label>
//                                         <Select value={selectedSection} onValueChange={setSelectedSection}>
//                                             <SelectTrigger>
//                                                 <SelectValue placeholder="All Sections" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 <SelectItem value="all">All Sections</SelectItem>
//                                                 {sections.map(section => (
//                                                     <SelectItem key={section._id} value={section._id}>
//                                                         <div className="flex items-center gap-2">
//                                                             <div
//                                                                 className="h-3 w-3 rounded-full"
//                                                                 style={{ backgroundColor: section.theme.color }}
//                                                             />
//                                                             {section.name}
//                                                         </div>
//                                                     </SelectItem>
//                                                 ))}
//                                             </SelectContent>
//                                         </Select>
//                                     </div>
//                                 </div>

//                                 <Button
//                                     variant={showNegativeValues ? "default" : "outline"}
//                                     size="sm"
//                                     onClick={() => setShowNegativeValues(!showNegativeValues)}
//                                     className="gap-2"
//                                 >
//                                     {showNegativeValues ? (
//                                         <>
//                                             <Eye className="h-4 w-4" />
//                                             Showing Expenses
//                                         </>
//                                     ) : (
//                                         <>
//                                             <EyeOff className="h-4 w-4" />
//                                             Showing Income Only
//                                         </>
//                                     )}
//                                 </Button>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </div>

//                 {/* Error Display */}
//                 {error && (
//                     <Alert variant="destructive" className="mb-6">
//                         <AlertCircle className="h-4 w-4" />
//                         <AlertDescription>{error}</AlertDescription>
//                     </Alert>
//                 )}

//                 {/* Tabs */}
//                 <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
//                     <TabsList className="grid grid-cols-4">
//                         <TabsTrigger value="overview">Overview</TabsTrigger>
//                         <TabsTrigger value="spending">Spending</TabsTrigger>
//                         <TabsTrigger value="trends">Trends</TabsTrigger>
//                         <TabsTrigger value="insights">Insights</TabsTrigger>
//                     </TabsList>
//                 </Tabs>

//                 {/* Loading State */}
//                 {isLoading || billsLoading ? (
//                     <div className="flex flex-col items-center justify-center py-12">
//                         <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
//                         <p className="text-muted-foreground">Crunching the numbers...</p>
//                     </div>
//                 ) : (
//                     <>
//                         {/* Overview Tab */}
//                         <TabsContent value="overview" className="space-y-6">
//                             {/* Key Metrics */}
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                                 <Card>
//                                     <CardHeader className="pb-2">
//                                         <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                             <DollarSign className="h-4 w-4 text-green-500" />
//                                             Total Income
//                                         </CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold text-green-600">
//                                             {formatCurrency(analytics.income)}
//                                         </div>
//                                         <p className="text-xs text-muted-foreground mt-1">
//                                             From {analytics.totalBills} transactions
//                                         </p>
//                                     </CardContent>
//                                 </Card>

//                                 <Card>
//                                     <CardHeader className="pb-2">
//                                         <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                             <TrendingDown className="h-4 w-4 text-red-500" />
//                                             Total Expenses
//                                         </CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold text-red-600">
//                                             {formatCurrency(analytics.expenses)}
//                                         </div>
//                                         <p className="text-xs text-muted-foreground mt-1">
//                                             {showNegativeValues ? 'All expenses' : 'Filtered view'}
//                                         </p>
//                                     </CardContent>
//                                 </Card>

//                                 <Card>
//                                     <CardHeader className="pb-2">
//                                         <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                             <TrendingUp className="h-4 w-4 text-blue-500" />
//                                             Net Flow
//                                         </CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className={cn(
//                                             'text-2xl font-bold',
//                                             analytics.netFlow > 0 ? 'text-green-600' :
//                                                 analytics.netFlow < 0 ? 'text-red-600' :
//                                                     'text-muted-foreground'
//                                         )}>
//                                             {formatCurrency(analytics.netFlow)}
//                                         </div>
//                                         <p className="text-xs text-muted-foreground mt-1">
//                                             {analytics.netFlow > 0 ? 'Positive balance' : 'Negative balance'}
//                                         </p>
//                                     </CardContent>
//                                 </Card>

//                                 <Card>
//                                     <CardHeader className="pb-2">
//                                         <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                             <Calendar className="h-4 w-4 text-purple-500" />
//                                             Monthly Average
//                                         </CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className={cn(
//                                             'text-2xl font-bold',
//                                             analytics.monthlyAverage > 0 ? 'text-green-600' :
//                                                 analytics.monthlyAverage < 0 ? 'text-red-600' :
//                                                     'text-muted-foreground'
//                                         )}>
//                                             {formatCurrency(analytics.monthlyAverage)}
//                                         </div>
//                                         <p className="text-xs text-muted-foreground mt-1">
//                                             Projected monthly
//                                         </p>
//                                     </CardContent>
//                                 </Card>
//                             </div>

//                             {/* Charts Row */}
//                             <div className="grid lg:grid-cols-2 gap-6">
//                                 {/* Spending by Tag */}
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle className="flex items-center gap-2">
//                                             <Tag className="h-5 w-5" />
//                                             Spending by Tags
//                                         </CardTitle>
//                                         <CardDescription>
//                                             Where your money goes (by emoji tags)
//                                         </CardDescription>
//                                     </CardHeader>
//                                     <CardContent>
//                                         {chartData.tags.length > 0 ? (
//                                             <PieChart
//                                                 data={chartData.tags}
//                                                 title="Tag Distribution"
//                                                 height={300}
//                                                 showLegend={true}
//                                             />
//                                         ) : (
//                                             <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
//                                                 <PieChartIcon className="h-12 w-12 mb-4 opacity-30" />
//                                                 <p>No tag data available</p>
//                                                 <p className="text-sm">Add tags to your bills to see breakdown</p>
//                                             </div>
//                                         )}
//                                     </CardContent>
//                                 </Card>

//                                 {/* Spending by Section */}
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle className="flex items-center gap-2">
//                                             <Wallet className="h-5 w-5" />
//                                             Spending by Section
//                                         </CardTitle>
//                                         <CardDescription>
//                                             Budget allocation across categories
//                                         </CardDescription>
//                                     </CardHeader>
//                                     <CardContent>
//                                         {chartData.sections.length > 0 ? (
//                                             <PieChart
//                                                 data={chartData.sections}
//                                                 title="Section Distribution"
//                                                 height={300}
//                                                 showLegend={true}
//                                             />
//                                         ) : (
//                                             <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
//                                                 <Wallet className="h-12 w-12 mb-4 opacity-30" />
//                                                 <p>No section data available</p>
//                                                 <p className="text-sm">Create sections to organize spending</p>
//                                             </div>
//                                         )}
//                                     </CardContent>
//                                 </Card>
//                             </div>

//                             {/* Budget Progress */}
//                             {analytics.totalBudget > 0 && (
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle className="flex items-center gap-2">
//                                             <Target className="h-5 w-5" />
//                                             Budget Overview
//                                         </CardTitle>
//                                         <CardDescription>
//                                             {selectedSection === 'all' ? 'All sections' : 'Selected section'}
//                                         </CardDescription>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="space-y-4">
//                                             <div>
//                                                 <div className="flex justify-between text-sm mb-1">
//                                                     <span>Budget Usage</span>
//                                                     <span className="font-semibold">
//                                                         {analytics.budgetUsage.toFixed(1)}%
//                                                     </span>
//                                                 </div>
//                                                 <Progress
//                                                     value={Math.min(analytics.budgetUsage, 100)}
//                                                     className={cn(
//                                                         'h-2',
//                                                         analytics.budgetUsage > 90 && 'bg-red-100',
//                                                         analytics.budgetUsage > 75 && analytics.budgetUsage <= 90 && 'bg-amber-100'
//                                                     )}
//                                                     indicatorClassName={cn(
//                                                         analytics.budgetUsage > 90 && 'bg-red-500',
//                                                         analytics.budgetUsage > 75 && analytics.budgetUsage <= 90 && 'bg-amber-500'
//                                                     )}
//                                                 />
//                                             </div>
//                                             <div className="grid grid-cols-3 gap-4 text-center">
//                                                 <div>
//                                                     <div className="text-2xl font-bold">
//                                                         {formatCurrency(analytics.totalBudget)}
//                                                     </div>
//                                                     <div className="text-xs text-muted-foreground">Total Budget</div>
//                                                 </div>
//                                                 <div>
//                                                     <div className="text-2xl font-bold">
//                                                         {formatCurrency(analytics.totalSpent)}
//                                                     </div>
//                                                     <div className="text-xs text-muted-foreground">Total Spent</div>
//                                                 </div>
//                                                 <div>
//                                                     <div className="text-2xl font-bold">
//                                                         {formatCurrency(analytics.totalBudget - analytics.totalSpent)}
//                                                     </div>
//                                                     <div className="text-xs text-muted-foreground">Remaining</div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             )}
//                         </TabsContent>

//                         {/* Spending Tab */}
//                         <TabsContent value="spending" className="space-y-6">
//                             <div className="grid lg:grid-cols-2 gap-6">
//                                 {/* Top Tags */}
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle>Top Spending Tags</CardTitle>
//                                         <CardDescription>Your most frequent categories</CardDescription>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="space-y-4">
//                                             {tagStats
//                                                 .filter(tag => showNegativeValues || tag.totalAmount < 0)
//                                                 .slice(0, 10)
//                                                 .map((tag, index) => (
//                                                     <div key={tag.emoji || index} className="flex items-center justify-between p-2 hover:bg-accent rounded-lg">
//                                                         <div className="flex items-center gap-3">
//                                                             <div className="text-2xl">{tag.emoji || '📝'}</div>
//                                                             <div>
//                                                                 <div className="font-medium">
//                                                                     {tag.emoji ? `Tag: ${tag.emoji}` : 'Untagged'}
//                                                                 </div>
//                                                                 <div className="text-xs text-muted-foreground">
//                                                                     {tag.count} bills • {getRelativeTime(tag.lastUsed)}
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                         <div className={cn(
//                                                             'font-semibold',
//                                                             tag.totalAmount < 0 ? 'text-red-600' : 'text-green-600'
//                                                         )}>
//                                                             {formatCurrency(tag.totalAmount)}
//                                                         </div>
//                                                     </div>
//                                                 ))}
//                                         </div>
//                                     </CardContent>
//                                 </Card>

//                                 {/* Daily Spending */}
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle>Daily Spending Pattern</CardTitle>
//                                         <CardDescription>Average by day of week</CardDescription>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="space-y-4">
//                                             {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
//                                                 .map(day => {
//                                                     const dayBills = dailyStats.filter(d => {
//                                                         const date = new Date(d._id);
//                                                         return date.toLocaleDateString('en-US', { weekday: 'long' }) === day;
//                                                     });
//                                                     const dayTotal = dayBills.reduce((sum, d) => sum + d.totalAmount, 0);
//                                                     const dayCount = dayBills.reduce((sum, d) => sum + d.count, 0);

//                                                     return (
//                                                         <div key={day} className="space-y-1">
//                                                             <div className="flex justify-between text-sm">
//                                                                 <span className="font-medium">{day}</span>
//                                                                 <span className={cn(
//                                                                     'font-semibold',
//                                                                     dayTotal < 0 ? 'text-red-600' : 'text-green-600'
//                                                                 )}>
//                                                                     {formatCurrency(dayTotal)}
//                                                                 </span>
//                                                             </div>
//                                                             <div className="flex items-center gap-2">
//                                                                 <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
//                                                                     <div
//                                                                         className={cn(
//                                                                             'h-full rounded-full',
//                                                                             dayTotal < 0 ? 'bg-red-500' : 'bg-green-500'
//                                                                         )}
//                                                                         style={{
//                                                                             width: `${Math.min(Math.abs(dayTotal) / 1000 * 100, 100)}%`
//                                                                         }}
//                                                                     />
//                                                                 </div>
//                                                                 <span className="text-xs text-muted-foreground w-12 text-right">
//                                                                     {dayCount} bills
//                                                                 </span>
//                                                             </div>
//                                                         </div>
//                                                     );
//                                                 })}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             </div>

//                             {/* Largest Transactions */}
//                             <Card>
//                                 <CardHeader>
//                                     <CardTitle>Largest Transactions</CardTitle>
//                                     <CardDescription>Your biggest income and expenses</CardDescription>
//                                 </CardHeader>
//                                 <CardContent>
//                                     <div className="grid md:grid-cols-2 gap-6">
//                                         <div>
//                                             <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
//                                                 <TrendingUp className="h-4 w-4" />
//                                                 Top Income
//                                             </h4>
//                                             {analytics.largestIncome > 0 ? (
//                                                 <div className="text-center p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20">
//                                                     <div className="text-3xl font-bold text-green-600">
//                                                         {formatCurrency(analytics.largestIncome)}
//                                                     </div>
//                                                     <p className="text-sm text-muted-foreground mt-2">
//                                                         Largest single income
//                                                     </p>
//                                                 </div>
//                                             ) : (
//                                                 <p className="text-muted-foreground text-center py-4">No income recorded</p>
//                                             )}
//                                         </div>

//                                         <div>
//                                             <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
//                                                 <TrendingDown className="h-4 w-4" />
//                                                 Top Expense
//                                             </h4>
//                                             {analytics.largestExpense > 0 ? (
//                                                 <div className="text-center p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20">
//                                                     <div className="text-3xl font-bold text-red-600">
//                                                         {formatCurrency(analytics.largestExpense)}
//                                                     </div>
//                                                     <p className="text-sm text-muted-foreground mt-2">
//                                                         Largest single expense
//                                                     </p>
//                                                 </div>
//                                             ) : (
//                                                 <p className="text-muted-foreground text-center py-4">No expenses recorded</p>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         </TabsContent>

//                         {/* Insights Tab */}
//                         <TabsContent value="insights" className="space-y-6">
//                             <Card>
//                                 <CardHeader>
//                                     <CardTitle className="flex items-center gap-2">
//                                         <Sparkles className="h-5 w-5 text-yellow-500" />
//                                         Financial Insights
//                                     </CardTitle>
//                                     <CardDescription>
//                                         Personalized recommendations based on your spending
//                                     </CardDescription>
//                                 </CardHeader>
//                                 <CardContent>
//                                     <div className="space-y-4">
//                                         {/* Insight Cards */}
//                                         {analytics.netFlow < 0 && (
//                                             <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
//                                                 <AlertCircle className="h-4 w-4 text-amber-600" />
//                                                 <AlertDescription>
//                                                     <strong>Spending Alert:</strong> Your expenses exceed your income.
//                                                     Consider reviewing your budget or reducing discretionary spending.
//                                                 </AlertDescription>
//                                             </Alert>
//                                         )}

//                                         {analytics.budgetUsage > 90 && (
//                                             <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
//                                                 <AlertCircle className="h-4 w-4 text-red-600" />
//                                                 <AlertDescription>
//                                                     <strong>Budget Warning:</strong> You've used over 90% of your budget.
//                                                     Consider adjusting your spending or increasing your budget.
//                                                 </AlertDescription>
//                                             </Alert>
//                                         )}

//                                         {analytics.dailyAverage < -50 && (
//                                             <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
//                                                 <AlertCircle className="h-4 w-4 text-blue-600" />
//                                                 <AlertDescription>
//                                                     <strong>Daily Average:</strong> You're spending ${Math.abs(analytics.dailyAverage).toFixed(2)} per day.
//                                                     At this rate, you'll spend {formatCurrency(analytics.monthlyAverage)} this month.
//                                                 </AlertDescription>
//                                             </Alert>
//                                         )}

//                                         {tagStats.length > 0 && (
//                                             <div className="p-4 border rounded-lg">
//                                                 <h4 className="font-semibold mb-2">Top Spending Category:</h4>
//                                                 {tagStats
//                                                     .filter(tag => tag.totalAmount < 0)
//                                                     .slice(0, 1)
//                                                     .map(tag => (
//                                                         <div key={tag.emoji} className="flex items-center justify-between">
//                                                             <div className="flex items-center gap-3">
//                                                                 <div className="text-2xl">{tag.emoji}</div>
//                                                                 <div>
//                                                                     <div className="font-medium">
//                                                                         {tag.emoji ? `Tag: ${tag.emoji}` : 'Untagged'}
//                                                                     </div>
//                                                                     <div className="text-sm text-muted-foreground">
//                                                                         {tag.count} transactions
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                             <div className="text-red-600 font-semibold">
//                                                                 {formatCurrency(tag.totalAmount)}
//                                                             </div>
//                                                         </div>
//                                                     ))}
//                                             </div>
//                                         )}

//                                         {/* Recommendations */}
//                                         <div className="grid md:grid-cols-2 gap-4">
//                                             <div className="p-4 border rounded-lg">
//                                                 <h4 className="font-semibold mb-2 flex items-center gap-2">
//                                                     <Clock className="h-4 w-4" />
//                                                     Busiest Day
//                                                 </h4>
//                                                 <p className="text-lg font-bold">{analytics.busiestDay}</p>
//                                                 <p className="text-sm text-muted-foreground">
//                                                     Most transactions occur on this day
//                                                 </p>
//                                             </div>

//                                             <div className="p-4 border rounded-lg">
//                                                 <h4 className="font-semibold mb-2">Savings Potential</h4>
//                                                 <p className="text-lg font-bold text-green-600">
//                                                     {formatCurrency(Math.abs(analytics.monthlyAverage) * 0.2)}
//                                                 </p>
//                                                 <p className="text-sm text-muted-foreground">
//                                                     Potential monthly savings (20% reduction)
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         </TabsContent>
//                     </>
//                 )}
//             </div>
//         </Layout>
//     );
// };

// export default AnalyticsPage;