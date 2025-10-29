import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "../sidebar";
import { ChevronRight } from "lucide-react";
import { match, P } from "ts-pattern";
import { NavbarConfiguration, MenuItemType } from "./utils";
import { When } from "../../lib/when";

interface DynamicMenuSectionsProps {
    config: NavbarConfiguration;
    activeArea: string;
    activeItem: string | null;
    isCollapsed: boolean;
    onItemClick: (item: MenuItemType) => void;
    expandedItems: string[];
}

export const DynamicMenuSections: React.FC<DynamicMenuSectionsProps> = ({
    config,
    activeArea,
    activeItem,
    isCollapsed,
    onItemClick,
    expandedItems
}) => {
    const currentAreaConfig = config.areas.find(area => area.title === activeArea);

    if (!currentAreaConfig || currentAreaConfig.sections.length === 0) {
        return null;
    }

    const renderMenuItem = (item: MenuItemType) => {
        return match(item)
            .with({ children: P.array(P.any) }, (expandableItem) => {
                if (isCollapsed) {
                    return null;
                }

                const isExpanded = expandedItems.includes(expandableItem.title);

                return (
                    <SidebarMenuItem key={expandableItem.title}>
                        <SidebarMenuButton
                            isActive={false}
                            onClick={() => onItemClick(expandableItem)}
                            tooltip={undefined}
                            size="default"
                            disabled={expandableItem.disabled}
                            className={`
                                text-brand-fgLight/90 hover:text-brand-fgLight hover:bg-brand-fgLight/15
                                rounded-lg transition-all duration-200 mb-1.5
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                                ${expandableItem.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                                ${expandableItem.icon ? 'justify-between' : 'justify-between'}
                            `}
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <When condition={Boolean(expandableItem.icon)}>
                                    {expandableItem.icon && <expandableItem.icon className="h-4 w-4 flex-shrink-0" />}
                                </When>
                                <span className="text-sm font-medium truncate">
                                    {expandableItem.title}
                                </span>
                            </div>
                            <ChevronRight
                                className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ease-in-out ${isExpanded ? 'transform rotate-90' : 'transform rotate-0'
                                    }`}
                            />
                        </SidebarMenuButton>

                        <When condition={isExpanded}>
                            <SidebarMenu className="ml-2 mt-1 pr-2 border-l !border-[#7c598f]">
                                {expandableItem.children.map((child) => (
                                    <SidebarMenuItem key={child.title} className="pl-1">
                                        <SidebarMenuButton
                                            isActive={activeItem === child.title}
                                            onClick={() => onItemClick(child)}
                                            tooltip={undefined}
                                            size="default"
                                            disabled={child.disabled}
                                            className={`
                                                text-brand-fgLight/90 hover:text-brand-fgLight hover:bg-brand-fgLight/15
                                                rounded-lg transition-all duration-200 mb-1.5
                                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                                                ${activeItem === child.title ? 'bg-brand-fgLight/20 text-brand-fgLight font-medium' : ''}
                                                ${child.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                        >
                                            <When condition={Boolean(child.icon)}>
                                                {child.icon && <child.icon className="h-4 w-4 flex-shrink-0" />}
                                            </When>
                                            <span className="text-sm font-medium truncate">
                                                {child.title}
                                                <When condition={Boolean(child.badge)}>
                                                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-brand-orange text-white rounded-full">
                                                        {child.badge}
                                                    </span>
                                                </When>
                                            </span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </When>
                    </SidebarMenuItem>
                );
            })
            .otherwise((regularItem) => (
                <SidebarMenuItem key={regularItem.title}>
                    <SidebarMenuButton
                        isActive={activeItem === regularItem.title}
                        onClick={() => onItemClick(regularItem)}
                        tooltip={isCollapsed ? regularItem.title : undefined}
                        size="default"
                        disabled={regularItem.disabled}
                        className={`
                            text-brand-fgLight/90 hover:text-brand-fgLight hover:bg-brand-fgLight/15
                            rounded-lg transition-all duration-200 mb-1.5
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                            ${activeItem === regularItem.title ? 'bg-brand-fgLight/20 text-brand-fgLight font-medium' : ''}
                            ${regularItem.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                            group-data-[collapsible=icon]:justify-center
                        `}
                    >
                        <When condition={Boolean(regularItem.icon)}>
                            {regularItem.icon && <regularItem.icon className="h-5 w-5 flex-shrink-0" />}
                        </When>
                        <When condition={!isCollapsed}>
                            <span className="text-sm font-medium truncate">
                                {regularItem.title}
                                <When condition={Boolean(regularItem.badge)}>
                                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-brand-orange text-white rounded-full">
                                        {regularItem.badge}
                                    </span>
                                </When>
                            </span>
                        </When>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ));
    };

    return (
        <>
            {currentAreaConfig.sections.map((section) => (
                <SidebarGroup key={section.label}>
                    <SidebarGroupLabel className="text-[10px] tracking-wider text-brand-fgLight/80 truncate">
                        {section.label}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {section.items.map(renderMenuItem)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            ))}
        </>
    );
};