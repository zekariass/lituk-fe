import { Home, BookOpen, ClipboardList, Trophy, User, MoreHorizontal, Settings, CreditCard } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

export const mainNavItems: NavItem[] = [
  {
    label: 'Home',
    href: '/practice/revision',
    icon: Home,
    requiresAuth: true,
  },
  {
    label: 'Tests',
    href: '/practice/mock-test',
    icon: ClipboardList,
    requiresAuth: true,
  },
  {
    label: 'Board',
    href: '/leaderboard',
    icon: Trophy,
    requiresAuth: false,
  },
  {
    label: 'More',
    href: '/profile',
    icon: MoreHorizontal,
    requiresAuth: true,
  },
];

export const moreMenuItems: NavItem[] = [
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
    requiresAuth: true,
  },
  {
    label: 'Categories',
    href: '/practice',
    icon: BookOpen,
    requiresAuth: true,
  },
  {
    label: 'Pricing',
    href: '/practice/pricing',
    icon: CreditCard,
    requiresAuth: true,
  },
  {
    label: 'Back Office',
    href: '/backoffice',
    icon: Settings,
    requiresAuth: true,
    requiresAdmin: true,
  },
];
