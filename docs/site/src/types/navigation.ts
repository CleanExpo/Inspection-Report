export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface MobileNavProps {
  sections: NavSection[];
  className?: string;
  onNavigate?: () => void;
}

export interface NavAnimationState {
  isEntering: boolean;
  isLeaving: boolean;
}
