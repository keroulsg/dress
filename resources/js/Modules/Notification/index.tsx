/**
 * Notification module — public surface.
 */

import { Bell } from 'lucide-react';
import * as React from 'react';

import { Dropdown, DropdownContent, DropdownLabel, DropdownTrigger } from '../../Components/UI/Dropdown';
import { EmptyState } from '../../Components/Feedback/EmptyState';
import { cn } from '../../Lib/utils';

export interface NotificationItem {
    id: string;
    title: string;
    body?: string;
    read: boolean;
    createdAt: string;
}

export interface NotificationCenterProps {
    items: NotificationItem[];
    unreadCount?: number;
    onMarkAllRead?: () => void;
}

/** Bell dropdown listing recent notifications. */
export function NotificationCenter({ items, unreadCount = 0, onMarkAllRead }: NotificationCenterProps) {
    return (
        <Dropdown>
            <DropdownTrigger asChild>
                <button
                    type="button"
                    aria-label={`Notifications, ${unreadCount} unread`}
                    className="relative rounded-none p-1.5 text-stone-muted transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                >
                    <Bell className="h-5 w-5" aria-hidden="true" />
                    {unreadCount > 0 ? (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-semibold text-white">
                            {unreadCount}
                        </span>
                    ) : null}
                </button>
            </DropdownTrigger>
            <DropdownContent align="end" className="w-80">
                <div className="flex items-center justify-between px-3 py-2">
                    <DropdownLabel className="px-0 py-0">Notifications</DropdownLabel>
                    {items.length > 0 && onMarkAllRead ? (
                        <button type="button" onClick={onMarkAllRead} className="text-xs text-rose-deep transition-colors hover:text-rose">
                            Mark all read
                        </button>
                    ) : null}
                </div>
                {items.length === 0 ? (
                    <div className="p-3">
                        <EmptyState title="You're all caught up" description="Notifications will appear here." />
                    </div>
                ) : (
                    <ul className="max-h-80 overflow-y-auto">
                        {items.slice(0, 12).map((item) => (
                            <li
                                key={item.id}
                                className={cn(
                                    'border-b border-stone-line px-3 py-2.5 last:border-b-0',
                                    !item.read && 'bg-champagne/10',
                                )}
                            >
                                <p className={cn('text-sm', item.read ? 'text-stone-muted' : 'font-medium text-charcoal')}>
                                    {item.title}
                                </p>
                                {item.body ? <p className="mt-0.5 line-clamp-2 text-xs text-stone-muted">{item.body}</p> : null}
                                <p className="mt-1 text-[11px] text-stone-muted">{item.createdAt}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </DropdownContent>
        </Dropdown>
    );
}