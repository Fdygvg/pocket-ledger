// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '@/components/layout/Layout';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuSeparator,
//     DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import SectionCard from '@/components/dashboard/SectionCard';
// import CreateSectionModal from '@/components/dashboard/CreateSectionModal';
// import { useAuth } from '@/hooks/useAuth';
// import { api } from '@/lib/api';
// import { cn } from '@/lib/utils';
// import type { Section } from '@/types';

// import {
//     Plus,
//     Search,
//     Filter,
//     Grid3X3,
//     List,
//     BarChart3,
//     Archive,
//     RefreshCw,
//     TrendingUp,
//     TrendingDown,
//     DollarSign,
//     FolderOpen,
//     MoreVertical,
//     AlertCircle,
// } from 'lucide-react';

// const SectionsPage = () => {
//     const navigate = useNavigate();
//     const { user } = useAuth();
//     const [sections, setSections] = useState<Section[]>([]);
//     const [filteredSections, setFilteredSections] = useState<Section[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [showCreateModal, setShowCreateModal] = useState(false);

//     // Filters
//     const [searchQuery, setSearchQuery] = useState('');
//     const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
//     const [activeTab, setActiveTab] = useState('all');
//     const [sortBy, setSortBy] = useState<'name' | 'budget' | 'date' | 'spent'>('date');
//     const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
//     const [showArchived, setShowArchived] = useState(false);

//     // Fetch sections
//     const fetchSections = async () => {
//         setIsLoading(true);
//         setError(null);

//         try {
//             const response = await api.get<{ success: boolean; data: { sections: Section[] } }>('/sections');

//             if (response.success && response.data?.sections) {
//                 setSections(response.data.sections);
//             } else {
//                 setError('Failed to load sections');
//             }
//         } catch (err: any) {
//             setError(err.message || 'Failed to load sections');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (user) {
//             fetchSections();
//         }
//     }, [user]);

//     // Apply filters and sorting
//     useEffect(() => {
//         let result = [...sections];

//         // Filter by active/archived
//         if (!showArchived) {
//             result = result.filter(section => !section.settings.isArchived);
//         }

//         // Filter by tab
//         switch (activeTab) {
//             case 'active':
//                 result = result.filter(section => !section.settings.isArchived);
//                 break;
//             case 'archived':
//                 result = result.filter(section => section.settings.isArchived);
//                 break;
//             case 'overspent':
//                 result = result.filter(section => section.stats.remainingBudget < 0);
//                 break;
//             case 'budget':
//                 result = result.filter(section => section.budget > 0);
//                 break;
//         }

//         // Filter by search
//         if (searchQuery) {
//             const query = searchQuery.toLowerCase();
//             result = result.filter(section =>
//                 section.name.toLowerCase().includes(query) ||
//                 section.description?.toLowerCase().includes(query)
//             );
//         }

//         // Apply sorting
//         result.sort((a, b) => {
//             let comparison = 0;

//             switch (sortBy) {
//                 case 'name':
//                     comparison = a.name.localeCompare(b.name);
//                     break;
//                 case 'budget':
//                     comparison = a.budget - b.budget;
//                     break;
//                 case 'spent':
//                     comparison = a.stats.totalAmount - b.stats.totalAmount;
//                     break;
//                 case 'date':
//                 default:
//                     comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
//                     break;
//             }

//             return sortOrder === 'desc' ? -comparison : comparison;
//         });

//         setFilteredSections(result);
//     }, [sections, searchQuery, activeTab, sortBy, sortOrder, showArchived]);

//     const handleCreateSection = async (data: any) => {
//         try {
//             const response = await api.post('/sections', data);
//             if (response.success) {
//                 fetchSections();
//                 setShowCreateModal(false);
//             }
//         } catch (err) {
//             console.error('Failed to create section:', err);
//         }
//     };

//     const handleDeleteSection = async (sectionId: string) => {
//         if (!confirm('Are you sure you want to delete this section? This cannot be undone.')) {
//             return;
//         }

//         try {
//             const response = await api.delete(`/sections/${sectionId}`);
//             if (response.success) {
//                 fetchSections();
//             }
//         } catch (err) {
//             console.error('Failed to delete section:', err);
//         }
//     };

//     const handleArchiveSection = async (sectionId: string, archive: boolean) => {
//         try {
//             const response = await api.patch(`/sections/${sectionId}/archive`, { archive });
//             if (response.success) {
//                 fetchSections();
//             }
//         } catch (err) {
//             console.error('Failed to archive section:', err);
//         }
//     };

//     const handleEditSection = (section: Section) => {
//         // Navigate to edit page or open edit modal
//         console.log('Edit section:', section);
//         // You can implement edit functionality here
//     };

//     const handleViewDetails = (sectionId: string) => {
//         navigate(`/sections/${sectionId}`);
//     };

//     // Calculate stats
//     const stats = {
//         totalSections: sections.length,
//         totalBudget: sections.reduce((sum, s) => sum + s.budget, 0),
//         totalSpent: sections.reduce((sum, s) => sum + s.stats.totalAmount, 0),
//         activeSections: sections.filter(s => !s.settings.isArchived).length,
//         archivedSections: sections.filter(s => s.settings.isArchived).length,
//         overspentSections: sections.filter(s => s.stats.remainingBudget < 0).length,
//     };

//     if (!user) {
//         return (
//             <Layout>
//                 <div className="container mx-auto px-4 py-12">
//                     <Alert>
//                         <AlertCircle className="h-4 w-4" />
//                         <AlertDescription>
//                             Please log in to view your sections.
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
//                                 <FolderOpen className="h-8 w-8 text-primary" />
//                                 My Sections
//                             </h1>
//                             <p className="text-muted-foreground mt-1">
//                                 Organize your expenses into custom categories
//                             </p>
//                         </div>

//                         <Button
//                             onClick={() => setShowCreateModal(true)}
//                             className="gap-2"
//                         >
//                             <Plus className="h-5 w-5" />
//                             New Section
//                         </Button>
//                     </div>

//                     {/* Stats Cards */}
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//                         <Card>
//                             <CardContent className="p-4">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm text-muted-foreground">Total Sections</p>
//                                         <p className="text-2xl font-bold">{stats.totalSections}</p>
//                                     </div>
//                                     <FolderOpen className="h-8 w-8 text-primary/30" />
//                                 </div>
//                             </CardContent>
//                         </Card>

//                         <Card>
//                             <CardContent className="p-4">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm text-muted-foreground">Total Budget</p>
//                                         <p className="text-2xl font-bold">${stats.totalBudget.toFixed(2)}</p>
//                                     </div>
//                                     <DollarSign className="h-8 w-8 text-green-500/30" />
//                                 </div>
//                             </CardContent>
//                         </Card>

//                         <Card>
//                             <CardContent className="p-4">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm text-muted-foreground">Total Spent</p>
//                                         <p className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</p>
//                                     </div>
//                                     <TrendingUp className="h-8 w-8 text-blue-500/30" />
//                                 </div>
//                             </CardContent>
//                         </Card>

//                         <Card>
//                             <CardContent className="p-4">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm text-muted-foreground">Active</p>
//                                         <p className="text-2xl font-bold">{stats.activeSections}</p>
//                                     </div>
//                                     <BarChart3 className="h-8 w-8 text-purple-500/30" />
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     </div>
//                 </div>

//                 {/* Filters & Controls */}
//                 <Card className="mb-6">
//                     <CardContent className="p-4">
//                         <div className="flex flex-col md:flex-row gap-4">
//                             {/* Search */}
//                             <div className="relative flex-1">
//                                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                                 <Input
//                                     placeholder="Search sections..."
//                                     value={searchQuery}
//                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                     className="pl-10"
//                                 />
//                             </div>

//                             {/* Tabs */}
//                             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
//                                 <TabsList className="grid grid-cols-5">
//                                     <TabsTrigger value="all">All</TabsTrigger>
//                                     <TabsTrigger value="active">Active</TabsTrigger>
//                                     <TabsTrigger value="archived">Archived</TabsTrigger>
//                                     <TabsTrigger value="overspent">Overspent</TabsTrigger>
//                                     <TabsTrigger value="budget">With Budget</TabsTrigger>
//                                 </TabsList>
//                             </Tabs>

//                             {/* View Toggle */}
//                             <div className="flex items-center gap-2">
//                                 <Button
//                                     variant={viewMode === 'grid' ? 'default' : 'outline'}
//                                     size="icon"
//                                     onClick={() => setViewMode('grid')}
//                                 >
//                                     <Grid3X3 className="h-4 w-4" />
//                                 </Button>
//                                 <Button
//                                     variant={viewMode === 'list' ? 'default' : 'outline'}
//                                     size="icon"
//                                     onClick={() => setViewMode('list')}
//                                 >
//                                     <List className="h-4 w-4" />
//                                 </Button>
//                             </div>

//                             {/* Sort Dropdown */}
//                             <DropdownMenu>
//                                 <DropdownMenuTrigger asChild>
//                                     <Button variant="outline" className="gap-2">
//                                         <Filter className="h-4 w-4" />
//                                         Sort
//                                     </Button>
//                                 </DropdownMenuTrigger>
//                                 <DropdownMenuContent align="end">
//                                     <DropdownMenuItem onClick={() => { setSortBy('date'); setSortOrder('desc'); }}>
//                                         Newest First
//                                     </DropdownMenuItem>
//                                     <DropdownMenuItem onClick={() => { setSortBy('date'); setSortOrder('asc'); }}>
//                                         Oldest First
//                                     </DropdownMenuItem>
//                                     <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder('asc'); }}>
//                                         Name A-Z
//                                     </DropdownMenuItem>
//                                     <DropdownMenuItem onClick={() => { setSortBy('budget'); setSortOrder('desc'); }}>
//                                         Highest Budget
//                                     </DropdownMenuItem>
//                                     <DropdownMenuItem onClick={() => { setSortBy('spent'); setSortOrder('desc'); }}>
//                                         Most Spent
//                                     </DropdownMenuItem>
//                                     <DropdownMenuSeparator />
//                                     <DropdownMenuItem onClick={() => setShowArchived(!showArchived)}>
//                                         {showArchived ? 'Hide Archived' : 'Show Archived'}
//                                     </DropdownMenuItem>
//                                 </DropdownMenuContent>
//                             </DropdownMenu>

//                             {/* Refresh */}
//                             <Button
//                                 variant="outline"
//                                 size="icon"
//                                 onClick={fetchSections}
//                                 disabled={isLoading}
//                             >
//                                 <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
//                             </Button>
//                         </div>

//                         {/* Active Filters */}
//                         <div className="flex flex-wrap gap-2 mt-4">
//                             {searchQuery && (
//                                 <Badge variant="secondary" className="gap-1">
//                                     Search: {searchQuery}
//                                     <Button
//                                         variant="ghost"
//                                         size="icon"
//                                         className="h-3 w-3 p-0 ml-1"
//                                         onClick={() => setSearchQuery('')}
//                                     >
//                                         ×
//                                     </Button>
//                                 </Badge>
//                             )}
//                             {activeTab !== 'all' && (
//                                 <Badge variant="secondary" className="gap-1">
//                                     {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
//                                     <Button
//                                         variant="ghost"
//                                         size="icon"
//                                         className="h-3 w-3 p-0 ml-1"
//                                         onClick={() => setActiveTab('all')}
//                                     >
//                                         ×
//                                     </Button>
//                                 </Badge>
//                             )}
//                             {showArchived && (
//                                 <Badge variant="secondary" className="gap-1">
//                                     Showing Archived
//                                     <Button
//                                         variant="ghost"
//                                         size="icon"
//                                         className="h-3 w-3 p-0 ml-1"
//                                         onClick={() => setShowArchived(false)}
//                                     >
//                                         ×
//                                     </Button>
//                                 </Badge>
//                             )}
//                         </div>
//                     </CardContent>
//                 </Card>

//                 {/* Error Display */}
//                 {error && (
//                     <Alert variant="destructive" className="mb-6">
//                         <AlertCircle className="h-4 w-4" />
//                         <AlertDescription>{error}</AlertDescription>
//                     </Alert>
//                 )}

//                 {/* Loading State */}
//                 {isLoading ? (
//                     <div className="flex flex-col items-center justify-center py-12">
//                         <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
//                         <p className="text-muted-foreground">Loading your sections...</p>
//                     </div>
//                 ) : (
//                     <>
//                         {/* Results Summary */}
//                         <div className="flex items-center justify-between mb-4">
//                             <p className="text-sm text-muted-foreground">
//                                 Showing {filteredSections.length} of {sections.length} sections
//                             </p>
//                             {stats.overspentSections > 0 && (
//                                 <Badge variant="destructive" className="gap-1">
//                                     <TrendingDown className="h-3 w-3" />
//                                     {stats.overspentSections} section(s) overspent
//                                 </Badge>
//                             )}
//                         </div>

//                         {/* Empty State */}
//                         {filteredSections.length === 0 ? (
//                             <Card className="py-12">
//                                 <CardContent className="flex flex-col items-center justify-center text-center">
//                                     <FolderOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
//                                     <h3 className="text-xl font-semibold mb-2">No sections found</h3>
//                                     <p className="text-muted-foreground mb-6 max-w-md">
//                                         {searchQuery || activeTab !== 'all'
//                                             ? 'Try adjusting your filters or search terms'
//                                             : 'Create your first section to start organizing your expenses'}
//                                     </p>
//                                     <Button onClick={() => setShowCreateModal(true)}>
//                                         <Plus className="mr-2 h-4 w-4" />
//                                         Create Your First Section
//                                     </Button>
//                                 </CardContent>
//                             </Card>
//                         ) : (
//                             /* Sections Grid/List */
//                             <div className={cn(
//                                 'gap-4',
//                                 viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'
//                             )}>
//                                 {filteredSections.map((section) => (
//                                     <SectionCard
//                                         key={section._id}
//                                         section={section}
//                                         onEdit={handleEditSection}
//                                         onDelete={handleDeleteSection}
//                                         onArchive={handleArchiveSection}
//                                         onViewDetails={handleViewDetails}
//                                         className={viewMode === 'list' ? 'w-full' : ''}
//                                     />
//                                 ))}
//                             </div>
//                         )}

//                         {/* Archived Section Notice */}
//                         {!showArchived && stats.archivedSections > 0 && (
//                             <Card className="mt-6 border-dashed">
//                                 <CardContent className="p-4 flex items-center justify-between">
//                                     <div className="flex items-center gap-3">
//                                         <Archive className="h-5 w-5 text-muted-foreground" />
//                                         <div>
//                                             <p className="font-medium">You have {stats.archivedSections} archived section(s)</p>
//                                             <p className="text-sm text-muted-foreground">
//                                                 Archived sections are hidden from view
//                                             </p>
//                                         </div>
//                                     </div>
//                                     <Button
//                                         variant="outline"
//                                         size="sm"
//                                         onClick={() => setShowArchived(true)}
//                                     >
//                                         Show Archived
//                                     </Button>
//                                 </CardContent>
//                             </Card>
//                         )}
//                     </>
//                 )}
//             </div>

//             {/* Create Section Modal */}
//             <CreateSectionModal
//                 isOpen={showCreateModal}
//                 onClose={() => setShowCreateModal(false)}
//                 onSubmit={handleCreateSection}
//                 isLoading={isLoading}
//             />
//         </Layout>
//     );
// };

// export default SectionsPage;