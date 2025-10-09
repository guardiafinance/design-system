import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "../sidebar";
import {
    NavbarConfiguration as NavbarSettings,
    NavigationItem,
    getActiveStatesFromPath,
    getDefaultActiveArea,
    getNavigationItems
} from "./utils";
import { DynamicMenuSections } from "./dynamic-section";
import { When } from "../../lib/when";
import { useNavbarContext, InternalNavbarProvider, NavbarState } from "./navbar-context";

export interface NavbarProps {
    settings: NavbarSettings;
    className?: string;
    onItemClick?: (item: NavigationItem) => void;
    onAreaChange?: (area: string) => void;
}

function NavbarInternal({
    settings,
    className = "",
    onItemClick,
    onAreaChange
}: NavbarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = useSidebar();
    const navbarContext = useNavbarContext();

    const defaultActiveArea = getDefaultActiveArea(settings);
    const navigationItems = getNavigationItems(settings);

    const isCollapsed = state === "collapsed";

    const activeNavigationArea = navbarContext.state.activeArea || defaultActiveArea;
    const activeItem = navbarContext.state.activeItem;

    useEffect(() => {
        if (settings.allowDefaultPathBehavior === true) {
            const { activeArea, activeItem: currentActiveItem } = getActiveStatesFromPath(settings, location.pathname);
            navbarContext.setActiveArea(activeArea);
            navbarContext.setActiveItem(currentActiveItem);
        }
    }, [location.pathname, settings]);

    const handleItemClick = (item: NavigationItem) => {
        navbarContext.setActiveItem(item.title);

        if (item.onClick) {
            item.onClick();
        } else if (item.path) {
            navigate(item.path);
        }

        onItemClick?.(item);
    };

    const handleAreaChange = (area: string) => {
        navbarContext.setActiveArea(area);
        onAreaChange?.(area);
    };

    const sidebarStyle = settings.styling?.background
        ? { background: settings.styling.background }
        : { background: "#4F186D" };

    return (
        <Sidebar
            variant="sidebar"
            collapsible="icon"
            fixed={settings.styling?.fixed ?? true}
            className={`border-r-0 [&>[data-sidebar=sidebar]]:bg-transparent z-[60] ${className} ${settings.styling?.className || ""}`}
            style={sidebarStyle}
        >
            <When condition={Boolean(settings.organization)}>
                <SidebarHeader>
                    <div className="min-w-0 flex-1 mt-2 pr-2 pl-2 text-left">
                        <When condition={Boolean(settings.organization?.subtitle)}>
                            <p className="text-xs font-semibold text-brand-fgLight/80 uppercase tracking-wide truncate">
                                {settings.organization?.subtitle}
                            </p>
                        </When>
                        <h3 className="text-brand-fgLight font-semibold text-lg truncate">
                            {settings.organization?.name}
                        </h3>
                    </div>
                </SidebarHeader>
            </When>
            <SidebarContent className="p-3 flex-1">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        isActive={activeNavigationArea === item.title}
                                        onClick={() => handleAreaChange(item.title)}
                                        tooltip={isCollapsed ? item.title : undefined}
                                        size="default"
                                        className={`
                                            text-brand-fgLight/90 hover:text-brand-fgLight hover:bg-brand-fgLight/15
                                            rounded-lg transition-all duration-200 mb-1.5
                                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                                            ${activeNavigationArea === item.title ? 'bg-brand-fgLight/20 text-brand-fgLight font-medium' : ''}
                                            group-data-[collapsible=icon]:justify-center
                                        `}
                                    >
                                        <item.icon className="h-5 w-5 flex-shrink-0" />
                                        {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <DynamicMenuSections
                    config={settings}
                    activeArea={activeNavigationArea}
                    activeItem={activeItem}
                    isCollapsed={isCollapsed}
                    onItemClick={handleItemClick}
                />

                <When condition={Boolean(settings.generalArea)}>
                    <SidebarGroup className="mt-2">
                        <SidebarGroupLabel className="text-[10px] tracking-wider text-brand-fgLight/80 truncate">
                            {settings.generalArea?.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {settings.generalArea?.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            isActive={false}
                                            onClick={() => handleItemClick(item)}
                                            tooltip={isCollapsed ? item.title : undefined}
                                            size="default"
                                            className={`
                                                 text-brand-fgLight/90 hover:text-brand-fgLight hover:bg-brand-fgLight/15
                                                 rounded-lg transition-all duration-200 mb-1.5
                                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                                                 group-data-[collapsible=icon]:justify-center
                                                 ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                                             `}
                                            disabled={item.disabled}
                                        >
                                            <item.icon className="h-5 w-5 flex-shrink-0" />
                                            {!isCollapsed && (
                                                <span className="text-sm font-medium">
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
                </When>
            </SidebarContent>

            <SidebarFooter>
                <When condition={Boolean(settings.user)}>
                    <div className="flex items-center gap-3 rounded-lg p-2 text-brand-fgLight/90 hover:bg-brand-fgLight/10">
                        <When condition={Boolean(settings.user?.avatar)}>
                            <img
                                src={settings.user?.avatar}
                                alt={settings.user?.name}
                                className="min-h-8 min-w-8 h-8 w-8 rounded-full object-cover"
                            />
                        </When>
                        <When condition={!Boolean(settings.user?.avatar)}>
                            <div className="min-h-8 min-w-8 h-8 w-8 flex items-center justify-center rounded-full bg-brand-fgLight/20 text-brand-fgLight text-sm font-semibold">
                                {settings.user?.initials || settings.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                        </When>
                        <When condition={!isCollapsed}>
                            <div className="min-w-0 text-left truncate">
                                <p className="text-sm font-semibold text-brand-fgLight">{settings.user?.name}</p>
                                <p className="text-[11px] text-brand-fgLight/80">{settings.user?.email}</p>
                            </div>
                        </When>
                    </div>
                </When>
                <When condition={Boolean(settings.footer)}>
                    <div className="mt-2 flex items-center justify-between px-2 text-[10px] text-brand-fgLight/70 truncate">
                        {settings.footer?.version && <span className="truncate">{settings.footer.version}</span>}
                        {settings.footer?.copyright && <span className="truncate">{settings.footer.copyright}</span>}
                    </div>
                </When>
            </SidebarFooter>
        </Sidebar >
    );
}

export function Navbar(props: NavbarProps) {
    const defaultActiveArea = getDefaultActiveArea(props.settings);

    let hasContext = false;
    try {
        useNavbarContext();
        hasContext = true;
    } catch {
        hasContext = false;
    }

    if (hasContext) {
        return <NavbarInternal {...props} />;
    }

    const initialState: NavbarState = {
        activeArea: defaultActiveArea,
        activeItem: null
    };

    return (
        <InternalNavbarProvider initialState={initialState}>
            <NavbarInternal {...props} />
        </InternalNavbarProvider>
    );
}

export default Navbar;
