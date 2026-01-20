import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useBills } from '@/hooks/useBills';
import CreateSectionModal from '@/components/dashboard/CreateSectionModal';
import SectionCard from '@/components/dashboard/SectionCard';
import { cn, formatCurrency, formatDate, getRelativeTime } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Section, CreateSectionData } from '@/types';
import ProfileSetupModal from "@/components/auth/ProfileSetupModal";


import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Calendar,
  PieChart,
  BarChart3,
  AlertCircle,
  ChevronRight,
  Grid3x3,
  List,
  Download,
  RefreshCw,
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, setupProfile } = useAuth();
  const { bills, isLoading: billsLoading } = useBills({
    limit: 5,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // State
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statsOverview, setStatsOverview] = useState({
    totalSections: 0,
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overspentSections: 0,
    averageSpending: 0,
  });

  const [showProfileSetupModal, setShowProfileSetupModal] = useState(false);

  // Fetch sections
  const fetchSections = useCallback(async (silent = false) => {
    if (!user) return;

    if (!silent) setIsLoading(true);
    try {
      const response = await api.get<{ sections: Section[] }>('/sections');
      const fetchedSections = response.success ? response.data.sections : [];
      setSections(fetchedSections);

      // Calculate stats from actual data
      const totals = fetchedSections.reduce(
        (acc: any, section: any) => ({
          totalSections: acc.totalSections + 1,
          totalBudget: acc.totalBudget + section.budget,
          totalSpent: acc.totalSpent + section.stats.totalAmount,
          totalRemaining: acc.totalRemaining + section.stats.remainingBudget,
          overspentSections: acc.overspentSections + (section.stats.remainingBudget < 0 ? 1 : 0),
          averageSpending: 0,
        }),
        {
          totalSections: 0,
          totalBudget: 0,
          totalSpent: 0,
          totalRemaining: 0,
          overspentSections: 0,
          averageSpending: 0,
        } as {
          totalSections: number;
          totalBudget: number;
          totalSpent: number;
          totalRemaining: number;
          overspentSections: number;
          averageSpending: number;
        }
      );

      totals.averageSpending = totals.totalSections > 0
        ? totals.totalSpent / totals.totalSections
        : 0;

      setStatsOverview(totals);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Filter sections based on search
  const filteredSections = sections.filter(section =>
    section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle section creation
  const handleCreateSection = async (data: CreateSectionData) => {
    try {
      const response = await api.post('/sections', data);
      if (response.success) {
        await fetchSections(true); // Silent refresh
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Failed to create section:', error);
    }
  };

  // Handle profile setup
  const handleSetupProfile = async (data: { username: string; avatar: string }) => {
    try {
      await setupProfile(data);
      setShowProfileSetupModal(false);
    } catch (error) {
      console.error('Failed to setup profile:', error);
      throw error;
    }
  };

  // Handle section deletion
  const handleDeleteSection = async (sectionId: string) => {
    try {
      await api.delete(`/sections/${sectionId}`);
      await fetchSections(true); // Silent refresh
    } catch (error) {
      console.error('Failed to delete section:', error);
    }
  };

  // Handle section archive
  const handleArchiveSection = async (sectionId: string, archive: boolean) => {
    try {
      await api.patch(`/sections/${sectionId}/archive`, { isArchived: archive });
      await fetchSections(true); // Silent refresh
    } catch (error) {
      console.error('Failed to archive section:', error);
    }
  };

  // Handle view details
  const handleViewDetails = (sectionId: string) => {
    navigate(`/sections/${sectionId}`);
  };

  // Recent bills data
  const recentBills = bills.slice(0, 5);

  return (
    <div className="min-h-screen container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.username}! Here's your financial overview.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => fetchSections()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Section
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(statsOverview.totalBudget)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                ₦ Across {statsOverview.totalSections} sections
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(statsOverview.totalSpent)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {statsOverview.totalSpent > 0 ? (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                ) : (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                )}
                {((statsOverview.totalSpent / statsOverview.totalBudget) * 100).toFixed(1)}% of budget
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                statsOverview.totalRemaining < 0 && "text-red-600"
              )}>
                {formatCurrency(statsOverview.totalRemaining)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {statsOverview.totalRemaining >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                )}
                {statsOverview.overspentSections > 0
                  ? `${statsOverview.overspentSections} section(s) overspent`
                  : 'All sections on track'
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(statsOverview.averageSpending)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <PieChart className="h-3 w-3 mr-1" />
                Per section
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="sections" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="sections">
            <Grid3x3 className="h-4 w-4 mr-2" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="recent">
            <List className="h-4 w-4 mr-2" />
            Recent Activity
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-6">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search sections..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          {/* Sections Grid/List */}
          {isLoading ? (
            <div className={cn(
              "grid gap-4",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {[1, 2, 3].map((i) => (
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
          ) : filteredSections.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto max-w-md">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <PieChart className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No sections found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? `No sections match "${searchQuery}"`
                      : "Get started by creating your first section"
                    }
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Section
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className={cn(
              "grid gap-4",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {filteredSections.map((section) => (
                <SectionCard
                  key={section._id}
                  section={section}
                  onDelete={handleDeleteSection}
                  onArchive={handleArchiveSection}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}

          {/* Section Stats */}
          {!isLoading && filteredSections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Section Overview</CardTitle>
                <CardDescription>
                  Budget utilization across all sections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSections.map((section) => {
                    const percentage = section.budget > 0
                      ? Math.min((section.stats.totalAmount / section.budget) * 100, 100)
                      : 0;

                    return (
                      <div key={section._id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded"
                              style={{ backgroundColor: section.theme.color }}
                            />
                            <span className="font-medium">{section.name}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{formatCurrency(section.stats.totalAmount)}</span>
                            <span className="text-muted-foreground"> / {formatCurrency(section.budget)}</span>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{percentage.toFixed(1)}% spent</span>
                          <span>{formatCurrency(section.stats.remainingBudget)} remaining</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest bills and expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {billsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentBills.length === 0 ? (
                <div className="text-center py-8">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No recent bills</h3>
                  <p className="text-muted-foreground">
                    Add your first bill to start tracking expenses
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBills.map((bill) => (
                    <div
                      key={bill._id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <span className="text-lg">{bill.tag || '📝'}</span>
                        </div>
                        <div>
                          <div className="font-medium">{bill.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {bill.section && typeof bill.section !== 'string'
                              ? bill.section.name
                              : 'Unknown section'} • {getRelativeTime(bill.date)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "font-semibold",
                          bill.amount < 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {formatCurrency(bill.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(bill.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {recentBills.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/bills')}
                  >
                    View All Bills
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending by Section</CardTitle>
                <CardDescription>Distribution of expenses</CardDescription>
              </CardHeader>
              <CardContent>
                {sections.length === 0 ? (
                  <div className="text-center py-12">
                    <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sections.map((section) => {
                      const percentage = statsOverview.totalSpent > 0
                        ? (section.stats.totalAmount / statsOverview.totalSpent) * 100
                        : 0;

                      return (
                        <div key={section._id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded"
                                style={{ backgroundColor: section.theme.color }}
                              />
                              <span>{section.name}</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">{formatCurrency(section.stats.totalAmount)}</span>
                              <span className="text-muted-foreground ml-1">({percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Health</CardTitle>
                <CardDescription>Section budget utilization</CardDescription>
              </CardHeader>
              <CardContent>
                {sections.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sections.map((section) => {
                      const isHealthy = section.stats.remainingBudget >= 0;
                      const utilization = section.budget > 0
                        ? (section.stats.totalAmount / section.budget) * 100
                        : 0;

                      return (
                        <div key={section._id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{section.name}</span>
                            <Badge
                              variant={isHealthy ? "outline" : "destructive"}
                              className={cn(
                                isHealthy && "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              )}
                            >
                              {isHealthy ? 'On Track' : 'Overspent'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(section.stats.totalAmount)} of {formatCurrency(section.budget)}
                            <span className="ml-2">({utilization.toFixed(1)}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Section Modal */}
      <CreateSectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSection}
      />

      <ProfileSetupModal
        isOpen={showProfileSetupModal}
        onClose={() => setShowProfileSetupModal(false)}
        onSubmit={handleSetupProfile}
        currentUsername={user?.username}
        currentAvatar={user?.avatar}
      />

      {/* Welcome Alert for New Users */}
      {user?.needsProfileSetup && (
        <div className="fixed bottom-6 right-6 max-w-sm">
          <Alert className="border-primary bg-primary/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Welcome to PocketLedger!</p>
                  <p className="text-sm">Set up your profile to get started.</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowProfileSetupModal(true)}
                >
                  Get Started
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default Dashboard;