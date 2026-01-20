import React, { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import {
  Calculator,
  Delete,
  Equal,
  Percent,
  X,
  Divide,
  Plus,
  Minus,
  Dot,
} from 'lucide-react';

interface CalculatorPopoverProps {
  value: string;
  onChange: (value: string) => void;
  onCalculate: (result: number) => void;
  className?: string;
}

const CalculatorPopover: React.FC<CalculatorPopoverProps> = ({
  value,
  onChange,
  onCalculate,
  className,
}) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [lastResult, setLastResult] = useState<number | null>(null);

  // Initialize with prop value
  useEffect(() => {
    if (value && value !== display) {
      const cleanValue = value.replace(/[₦$,]/g, '');
      setDisplay(cleanValue || '0');
      setExpression(cleanValue || '');
    }
  }, [value]);

  const handleButtonClick = (input: string) => {
    let newDisplay = display;
    let newExpression = expression;

    // Handle special buttons
    switch (input) {
      case 'C':
        newDisplay = '0';
        newExpression = '';
        break;

      case 'DEL':
        if (display.length > 1) {
          newDisplay = display.slice(0, -1);
          newExpression = expression.slice(0, -1);
        } else {
          newDisplay = '0';
          newExpression = '';
        }
        break;

      case '=':
        try {
          // Safe evaluation
          const result = evaluateExpression(expression);
          setLastResult(result);
          onCalculate(result);
          newDisplay = result.toString();
          newExpression = result.toString();
        } catch {
          newDisplay = 'Error';
          newExpression = '';
        }
        break;

      case '%':
        try {
          const current = parseFloat(display);
          if (!isNaN(current)) {
            const result = current / 100;
            newDisplay = result.toString();
            newExpression = result.toString();
          }
        } catch {
          newDisplay = 'Error';
        }
        break;

      default:
        // Handle operators
        if (['+', '-', '*', '/', '.'].includes(input)) {
          if (display === '0' && input !== '.') {
            newDisplay = input;
            newExpression = input;
          } else {
            newDisplay = input;
            newExpression = expression + input;
          }
        } else {
          // Handle numbers
          if (display === '0' || ['+', '-', '*', '/'].includes(display)) {
            newDisplay = input;
            newExpression = expression + input;
          } else {
            newDisplay = display + input;
            newExpression = expression + input;
          }
        }
    }

    setDisplay(newDisplay);
    setExpression(newExpression);
    onChange(newDisplay);
  };

  const evaluateExpression = (expr: string): number => {
    // Remove any invalid characters
    const cleanExpr = expr.replace(/[^0-9+\-*/().]/g, '');

    // Use Function constructor for safe evaluation
    try {
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${cleanExpr})`)();
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Invalid result');
      }
      return parseFloat(result.toFixed(10));
    } catch {
      // Fallback to simple evaluation for basic expressions
      const simpleExpr = cleanExpr.match(/^[0-9+\-*/. ]+$/);
      if (simpleExpr) {
        // eslint-disable-next-line no-eval
        const result = eval(simpleExpr[0]);
        if (typeof result === 'number' && isFinite(result)) {
          return parseFloat(result.toFixed(10));
        }
      }
      throw new Error('Invalid expression');
    }
  };

  const buttonClasses = (isOperator = false, isAction = false) =>
    cn(
      'h-12 w-12 flex items-center justify-center text-lg font-medium transition-all',
      'hover:scale-105 active:scale-95',
      isOperator
        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
        : isAction
          ? 'bg-muted hover:bg-muted/80'
          : 'bg-background border hover:bg-accent'
    );

  const buttons = [
    [
      { label: 'C', value: 'C', icon: null, isAction: true, isOperator: undefined },
      { label: 'DEL', value: 'DEL', icon: <Delete className="h-4 w-4" />, isAction: true, isOperator: undefined },
      { label: '%', value: '%', icon: <Percent className="h-4 w-4" />, isAction: undefined, isOperator: true },
      { label: '÷', value: '/', icon: <Divide className="h-4 w-4" />, isAction: undefined, isOperator: true },
    ],
    [
      { label: '7', value: '7', icon: undefined, isAction: undefined, isOperator: undefined },
      { label: '8', value: '8', icon: undefined, isAction: undefined, isOperator: undefined },
      { label: '9', value: '9', icon: undefined, isAction: undefined, isOperator: undefined },
      { label: '×', value: '*', icon: <X className="h-4 w-4" />, isAction: undefined, isOperator: true },
    ],
    [
      { label: '4', value: '4', icon: undefined, isAction: undefined, isOperator: undefined },
      { label: '5', value: '5', icon: undefined, isAction: undefined, isOperator: undefined },
      { label: '6', value: '6', icon: undefined, isAction: undefined, isOperator: undefined },
      { label: '−', value: '-', icon: <Minus className="h-4 w-4" />, isAction: undefined, isOperator: true },
    ],
    [
      { label: '1', value: '1', icon: undefined, isAction: undefined, isOperator: undefined },
      { label: '2', value: '2', icon: undefined, isAction: undefined, isOperator: undefined },
      { label: '3', value: '3', icon: undefined, isAction: undefined, isOperator: undefined },
      { label: '+', value: '+', icon: <Plus className="h-4 w-4" />, isAction: undefined, isOperator: true },
    ],
    [
      { label: '0', value: '0', icon: undefined, isAction: undefined, isOperator: undefined },
      { label: '.', value: '.', icon: <Dot className="h-4 w-4" />, isAction: undefined, isOperator: undefined },
      { label: '=', value: '=', icon: <Equal className="h-4 w-4" />, isAction: undefined, isOperator: true },
    ],
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('gap-2', className)}
        >
          <Calculator className="h-4 w-4" />
          Calculator
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        {/* Display */}
        <div className="mb-4">
          <div className="text-right">
            <div className="text-xs text-muted-foreground h-4 mb-1 truncate">
              {expression}
            </div>
            <Input
              type="text"
              value={display}
              readOnly
              className="text-2xl font-mono text-right h-12"
            />
          </div>

          {/* Last result hint */}
          {lastResult !== null && (
            <div className="text-xs text-muted-foreground mt-1 text-right">
              Last: {lastResult.toFixed(2)}
            </div>
          )}
        </div>

        <Separator className="mb-4" />

        {/* Calculator Grid */}
        <div className="space-y-2">
          {buttons.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {row.map((button) => (
                <Button
                  key={button.value}
                  type="button"
                  variant="ghost"
                  className={buttonClasses(button.isOperator, button.isAction)}
                  onClick={() => handleButtonClick(button.value)}
                >
                  {button.icon || button.label}
                </Button>
              ))}
            </div>
          ))}
        </div>

        {/* Quick tips */}
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Tip: Use for quick calculations like "50+30" or "100*0.15"</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CalculatorPopover;