import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "../sidebar";
import { NavbarConfiguration, NavigationItem } from "./utils";

interface DynamicMenuSectionsProps {
    config: NavbarConfiguration;
    activeArea: string;
    activeItem: string | null;
    isCollapsed: boolean;
    onItemClick: (item: NavigationItem) => void;
}

export const DynamicMenuSections: React.FC<DynamicMenuSectionsProps> = ({
    config,
    activeArea,
    activeItem,
    isCollapsed,
    onItemClick
}) => {
    const currentAreaConfig = config.areas.find(area => area.title === activeArea);

    if (!currentAreaConfig || currentAreaConfig.sections.length === 0) {
        return null;
    }

    return (
        <>
            {currentAreaConfig.sections.map((section) => (
                <SidebarGroup key={section.label}>
                    <SidebarGroupLabel className="text-[10px] tracking-wider text-brand-fgLight/80 truncate">
                        {section.label}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {section.items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        isActive={activeItem === item.title}
                                        onClick={() => onItemClick(item)}
                                        tooltip={isCollapsed ? item.title : undefined}
                                        size="default"
                                        disabled={item.disabled}
                                        className={`
                                            text-brand-fgLight/90 hover:text-brand-fgLight hover:bg-brand-fgLight/15
                                            rounded-lg transition-all duration-200 mb-1.5
                                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                                            ${activeItem === item.title ? 'bg-brand-fgLight/20 text-brand-fgLight font-medium' : ''}
                                            ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                                            group-data-[collapsible=icon]:justify-center
                                        `}
                                    >
                                        <item.icon className="h-5 w-5 flex-shrink-0" />
                                        {!isCollapsed && (
                                            <span className="text-sm font-medium truncate">
                                                {item.title}
                                                {item.badge && (
                                                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-brand-orange text-white rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            ))}
        </>
    );
};