import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api.ts";
import type {
  Bill,
  BillsResponse,
  BillResponse,
  CreateBillData,
  UpdateBillData,
  BillFilters,
  TagStat,
  DailyStat,
} from "@/types";

export const useBills = (
  initialFilters?: Partial<BillFilters>
) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<BillFilters>({
    page: 1,
    limit: 50,
    sortBy: "date",
    sortOrder: "desc",
    view: "list",
    ...initialFilters,
  });
  const [stats, setStats] = useState<{
    totals: {
      totalAmount: number;
      count: number;
      positive: number;
      negative: number;
    };
    tagStats: TagStat[];
    dailyStats: DailyStat[];
  } | null>(null);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    pages: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch bills when filters change
  useEffect(() => {
    const fetchBills = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Build query string from filters
        const queryParams = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value));
          }
        });

        // Always request stats for the filter bar and recent tags
        queryParams.append("includeStats", "true");

        const response = await api.get<BillsResponse["data"]>(
          `/bills?${queryParams}`
        );

        if (!response.success) {
          throw new Error(response.error || "Failed to fetch bills");
        }

        if (response.data) {
          setBills(response.data.bills || []);

          if (response.data.statistics) {
            setStats(response.data.statistics);
          } else {
            // Calculate basic stats if not provided
            const totals = (response.data.bills || []).reduce(
              (acc, bill) => ({
                totalAmount: acc.totalAmount + bill.amount,
                count: acc.count + 1,
                positive: acc.positive + (bill.amount > 0 ? bill.amount : 0),
                negative: acc.negative + (bill.amount < 0 ? bill.amount : 0),
              }),
              { totalAmount: 0, count: 0, positive: 0, negative: 0 }
            );

            setStats({
              totals,
              tagStats: [],
              dailyStats: [],
            });
          }

          if (response.data.pagination) {
            setPagination(response.data.pagination);
          }
        }
      } catch (err: unknown) {
        const erroMessage =
          err instanceof Error ? err.message : "Failed To Load Bills.";
        setError(erroMessage);
        setBills([]);
        setStats(null);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBills();
  }, [filters]);

  const updateFilters = useCallback((newFilters: Partial<BillFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when filters change (except page itself)
      ...(newFilters.page === undefined && Object.keys(newFilters).length > 0
        ? { page: 1 }
        : {}),
    }));
  }, []);


  const refetch = useCallback(async (silent = false): Promise<void> => {
    if (!silent) setIsLoading(true);

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });

      // Always request stats for the filter bar and recent tags
      queryParams.append("includeStats", "true");

      const response = await api.get<BillsResponse["data"]>(
        `/bills?${queryParams}`
      );

      if (response.success && response.data) {
        setBills(response.data.bills || []);

        if (response.data.statistics) {
          setStats(response.data.statistics);
        }

        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to refetch bills:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [filters]);

  const createBill = useCallback(
    async (data: CreateBillData): Promise<Bill> => {
      // Don't set global loading here to avoid full page skeleton
      // The modal can handle its own loading state

      try {
        const response = await api.post<BillResponse["data"]>("/bills", data);

        if (!response.success) {
          throw new Error(response.error || "Failed to create bill");
        }

        if (!response.data?.bill) {
          throw new Error("No bill data received");
        }

        // Refresh bills list silently
        await refetch(true);

        return response.data.bill;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed To Create Bill.";
        setError(errorMessage);
        throw err;
      }
    },
    [refetch]
  );

  const updateBill = useCallback(
    async (id: string, data: UpdateBillData): Promise<Bill> => {
      // No loading state needed here as optimistically updating or UI handles it
      setError(null);

      try {
        const response = await api.put<BillResponse["data"]>(
          `/bills/${id}`,
          data
        );

        if (!response.success) {
          throw new Error(response.error || "Failed to update bill");
        }

        if (!response.data?.bill) {
          throw new Error("No bill data received");
        }

        // Update local state directly
        setBills((prev) =>
          prev.map((bill) => (bill._id === id ? response.data!.bill : bill))
        );

        // Silently refetch to update stats
        refetch(true);

        return response.data.bill;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed To Update Bill.";
        setError(errorMessage);
        throw err;
      }
    },
    [refetch]
  );

  const deleteBill = useCallback(
    async (id: string): Promise<void> => {
      // No loading state to avoid flash
      setError(null);

      try {
        const response = await api.delete(`/bills/${id}`);

        if (!response.success) {
          throw new Error(response.error || "Failed to delete bill");
        }

        // Remove from local state immediately
        setBills((prev) => prev.filter((bill) => bill._id !== id));

        // Update stats locally first for responsiveness
        if (stats) {
          const billToDelete = bills.find((bill) => bill._id === id);
          if (billToDelete) {
            setStats((prev) =>
              prev
                ? {
                  ...prev,
                  totals: {
                    totalAmount:
                      prev.totals.totalAmount - billToDelete.amount,
                    count: prev.totals.count - 1,
                    positive:
                      prev.totals.positive -
                      (billToDelete.amount > 0 ? billToDelete.amount : 0),
                    negative:
                      prev.totals.negative -
                      (billToDelete.amount < 0 ? billToDelete.amount : 0),
                  },
                }
                : null
            );
          }
        }

        // Silently refetch to ensure server sync
        refetch(true);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed To Delete Bill.";
        setError(errorMessage);
        throw err;
      }
    },
    [bills, stats, refetch]
  );

  const bulkDeleteBills = useCallback(async (ids: string[]): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.delete("/bills/bulk", { billIds: ids });

      if (!response.success) {
        throw new Error(response.error || "Failed to delete bills");
      }

      // Remove from local state
      setBills((prev) => prev.filter((bill) => !ids.includes(bill._id)));

      // Refetch to update stats properly
      await refetch();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed To Delete Bill.";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [refetch]);



  // Get recent tags
  const getRecentTags = useCallback(async (sectionId?: string): Promise<TagStat[]> => {
    try {
      let url = "/bills/tags/recent";
      if (sectionId) url += `?sectionId=${sectionId}`;

      const response = await api.get<{
        success: boolean;
        data: { tags: TagStat[] };
      }>(url);

      if (response.success && response.data.data?.tags) {
        return response.data.data.tags;
      }

      return [];
    } catch (err) {
      console.error("Failed to fetch recent tags:", err);
      return [];
    }
  }, []);

  // Get tag statistics
  const getTagStatistics = useCallback(
    async (days = 365, sectionId?: string): Promise<TagStat[]> => {
      try {
        let url = `/bills/tags/stats?days=${days}`;
        if (sectionId) url += `&sectionId=${sectionId}`;

        const response = await api.get<{
          success: boolean;
          data: { tags: TagStat[] };
        }>(url);

        if (response.success && response.data.data?.tags) {
          return response.data.data.tags;
        }

        return [];
      } catch (err) {
        console.error("Failed to fetch tag statistics:", err);
        return [];
      }
    },
    []
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    bills,
    isLoading,
    filters,
    stats,
    pagination,
    error: error,

    // Actions
    setFilters: updateFilters,
    createBill,
    updateBill,
    deleteBill,
    bulkDeleteBills,
    refetch,

    // Tag functions
    getRecentTags,
    getTagStatistics,

    // Utilities
    clearError,
  };
};
