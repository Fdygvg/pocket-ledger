import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface IconRendererProps extends LucideProps {
    iconName: string;
}

/**
 * A component that renders a Lucide icon based on a string name.
 * Used to replace emojis in themes with professional icons.
 */
export const IconRenderer: React.FC<IconRendererProps> = ({ iconName, ...props }) => {
    // Map common names to Lucide icons
    const iconMap: Record<string, keyof typeof LucideIcons> = {
        // Original theme mapped icons
        'folder': 'Folder',
        'wallet': 'Wallet',
        'flame': 'Flame',
        'crown': 'Crown',
        'star': 'Star',
        'flower': 'Flower2',
        'sparkles': 'Sparkles',
        'settings': 'Settings',

        // Additional financial and category icons
        'shopping-cart': 'ShoppingCart',
        'credit-card': 'CreditCard',
        'trending-up': 'TrendingUp',
        'dollar-sign': 'DollarSign',
        'coins': 'Coins',
        'banknote': 'Banknote',
        'landmark': 'Landmark',
        'receipt': 'Receipt',
        'pie-chart': 'PieChart',
        'activity': 'Activity',
        'shield': 'Shield',
        'lock': 'Lock',
        'briefcase': 'Briefcase',
        'car': 'Car',
        'home': 'Home',
        'plane': 'Plane',
        'utensils': 'Utensils',
        'shopping-bag': 'ShoppingBag',
        'gift': 'Gift',
        'heart': 'Heart',
        'music': 'Music',
        'gamepad': 'Gamepad2',
        'monitor': 'Monitor',
        'smartphone': 'Smartphone',
        'coffee': 'Coffee',
        'fuel': 'Fuel',
        'lightbulb': 'Lightbulb',
        'clapperboard': 'Clapperboard',
    };

    const IconName = iconMap[iconName.toLowerCase()] || 'HelpCircle';
    const IconComponent = (LucideIcons as any)[IconName] as React.ElementType;

    if (!IconComponent) {
        return <LucideIcons.HelpCircle {...props} />;
    }

    return <IconComponent {...props} />;
};

export default IconRenderer;
