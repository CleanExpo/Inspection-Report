export interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
}

export interface SidebarItem {
  id: string;
  title: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  items?: SidebarItem[];
}

export interface SidebarProps {
  sections: SidebarSection[];
  className?: string;
  onNavigate?: () => void;
  activeItemId?: string;
}

export interface SidebarItemProps {
  item: SidebarItem;
  isNested?: boolean;
  isActive?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}

export interface SidebarSectionProps {
  section: SidebarSection;
  isExpanded: boolean;
  onToggle: () => void;
  activeItemId?: string;
  onNavigate?: () => void;
}

export interface SidebarHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}
