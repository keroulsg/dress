import { memo } from 'react';

import { cn } from '../../Lib/utils';
import { DressCard, type DressCardProps } from './DressCard';

export interface DressGridProps {
    dresses: DressCardProps['dress'][];
    view: 'compact' | 'editorial';
    onToggleFavorite?: (dressId: number) => void;
    favoritedIds?: number[];
}

export const DressGrid = memo(function DressGrid({
    dresses,
    view,
    onToggleFavorite,
    favoritedIds = [],
}: DressGridProps) {
    return (
        <div
            className={cn(
                'grid gap-x-6',
                view === 'compact'
                    ? 'grid-cols-2 gap-y-8 md:grid-cols-3 lg:grid-cols-4'
                    : 'grid-cols-1 gap-y-10 md:grid-cols-2',
            )}
        >
            {dresses.map((dress) => (
                <DressCard
                    key={dress.id}
                    dress={dress}
                    imageOnly={view === 'compact'}
                    onToggleFavorite={onToggleFavorite}
                    favorited={favoritedIds.includes(dress.id)}
                />
            ))}
        </div>
    );
});

DressGrid.displayName = 'DressGrid';
