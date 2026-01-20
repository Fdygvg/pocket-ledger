import React, { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, formatCurrency } from '@/lib/utils';
import { format, isSameDay, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import type { Bill } from '@/types';

import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  TrendingDown,
  X,
  Filter,
  CalendarDays,
} from 'lucide-react';

interface CalendarPickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  bills: Bill[];
  className?: string;
  showStats?: boolean;
  showBillsList?: boolean;
  onClose?: () => void;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onDateSelect,
  bills,
  className,
  showStats = true,
  showBillsList = true,
  onClose,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  // Filter bills for current month
  const monthBills = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    return bills.filter(bill => {
      const billDate = new Date(bill.date);
      return isWithinInterval(billDate, { start, end });
    });
  }, [bills, currentMonth]);

  // Get bills for a specific date
  const getBillsForDate = (date: Date): Bill[] => {
    return bills.filter(bill => isSameDay(new Date(bill.date), date));
  };

  // Calculate daily totals
  const getDailyTotal = (date: Date): number => {
    return getBillsForDate(date).reduce((sum, bill) => sum + bill.amount, 0);
  };

  // Calculate month stats
  const getMonthStats = () => {
    const income = monthBills.reduce((sum, bill) => sum + (bill.amount > 0 ? bill.amount : 0), 0);
    const expenses = monthBills.reduce((sum, bill) => sum + (bill.amount < 0 ? bill.amount : 0), 0);
    const net = income + expenses; // expenses are negative

    return {
      income,
      expenses: Math.abs(expenses),
      net,
      billCount: monthBills.length,
    };
  };

  const monthStats = getMonthStats();

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Calendar View
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>

            {selectedDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDateSelect(null)}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}

            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const prevMonth = new Date(currentMonth);
                  prevMonth.setMonth(prevMonth.getMonth() - 1);
                  setCurrentMonth(prevMonth);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="text-center">
                <div className="text-lg font-semibold">
                  {format(currentMonth, 'MMMM yyyy')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {monthBills.length} bills this month
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const nextMonth = new Date(currentMonth);
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  setCurrentMonth(nextMonth);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar */}
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={(date) => date && onDateSelect(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border"
            />

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Income</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span>Expense</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded border-2 border-primary" />
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Selected Date Info */}
            {selectedDate ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </CardTitle>
                    <Badge variant="outline">
                      {getBillsForDate(selectedDate).length} bills
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Daily Total */}
                  <div className="mb-4 p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        <span className="font-semibold">Daily Total</span>
                      </div>
                      <div className={cn(
                        'text-2xl font-bold',
                        getDailyTotal(selectedDate) > 0 ? 'text-green-600' :
                          getDailyTotal(selectedDate) < 0 ? 'text-red-600' :
                            'text-muted-foreground'
                      )}>
                        {formatCurrency(Math.abs(getDailyTotal(selectedDate)))}
                      </div>
                    </div>
                  </div>

                  {/* Bills List */}
                  {showBillsList && (
                    <div>
                      <h4 className="font-semibold mb-2">Bills on this day</h4>
                      <ScrollArea className="h-48">
                        {getBillsForDate(selectedDate).length > 0 ? (
                          <div className="space-y-2">
                            {getBillsForDate(selectedDate).map((bill) => (
                              <div
                                key={bill._id}
                                className="flex items-center justify-between p-2 rounded hover:bg-accent"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-lg">
                                    {bill.tag || '📝'}
                                  </div>
                                  <div>
                                    <div className="font-medium">{bill.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {format(new Date(bill.date), 'h:mm a')}
                                    </div>
                                  </div>
                                </div>
                                <div className={cn(
                                  'font-semibold',
                                  bill.amount < 0 ? 'text-red-600' : 'text-green-600'
                                )}>
                                  {formatCurrency(Math.abs(bill.amount))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <CalendarIcon className="h-8 w-8 mx-auto mb-2" />
                            <p>No bills on this day</p>
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">Select a date</p>
                  <p className="text-sm text-center mt-1">
                    Click on any date to view bills and details
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Month Stats */}
            {showStats && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Month Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span>Income</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(monthStats.income)}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span>Expenses</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(monthStats.expenses)}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Net Flow</span>
                      </div>
                      <div className={cn(
                        'text-2xl font-bold',
                        monthStats.net > 0 ? 'text-green-600' :
                          monthStats.net < 0 ? 'text-red-600' :
                            'text-muted-foreground'
                      )}>
                        {formatCurrency(Math.abs(monthStats.net))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Filter className="h-4 w-4" />
                        <span>Total Bills</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {monthStats.billCount}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarPicker;