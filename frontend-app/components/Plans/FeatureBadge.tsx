import React from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';

interface FeatureBadgeProps {
    label: string;
    enabled: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const FeatureBadge: React.FC<FeatureBadgeProps> = ({
    label,
    enabled,
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'text-xs py-1 px-2',
        md: 'text-sm py-1.5 px-3',
        lg: 'text-base py-2 px-4'
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-3.5 h-3.5',
        lg: 'w-4 h-4'
    };

    return (
        <div
            className={`
        inline-flex items-center gap-1.5 rounded-md font-medium transition-colors
        ${sizeClasses[size]}
        ${enabled
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-300'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-500'
                }
      `}
        >
            {enabled ? (
                <CheckIcon className={`flex-shrink-0 ${iconSizes[size]}`} />
            ) : (
                <XMarkIcon className={`flex-shrink-0 ${iconSizes[size]}`} />
            )}
            <span className="whitespace-nowrap">{label}</span>
        </div>
    );
};
