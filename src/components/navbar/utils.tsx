import type { LucideIcon } from "lucide-react";
import { match, P } from "ts-pattern";

export interface NavigationArea {
    title: string;
    icon: LucideIcon;
    sections: MenuSection[];
    defaultActive?: boolean;
}

export type NavigationItem = {
    title: string;
    icon?: LucideIcon;
    path?: string;
    pathPattern?: string;
    onClick?: () => void;
    disabled?: boolean;
    badge?: string | number;
};

export type ExpandableNavigationItem = {
    title: string;
    icon?: LucideIcon;
    children: NavigationItem[];
    disabled?: boolean;
};

export type MenuItemType = NavigationItem | ExpandableNavigationItem;

export const isExpandableItem = (item: MenuItemType): item is ExpandableNavigationItem => {
    return match(item)
        .with({ children: P.array(P.any) }, () => true)
        .otherwise(() => false);
};

export const isRegularItem = (item: MenuItemType): item is NavigationItem => {
    return !isExpandableItem(item);
};

export interface GeneralArea {
    title: string;
    items: NavigationItem[];
}

export interface MenuSection {
    label: string;
    items: MenuItemType[];
}

export type ActiveStates = {
    activeArea: string;
    activeItem: string | null;
}

export type NavbarOrganization = {
    name: string;
    subtitle?: string;
}

export type NavbarUser = {
    name: string;
    email: string;
    avatar?: string;
    initials?: string;
}

export type NavbarFooter = {
    version?: string;
    copyright?: string;
}

export interface NavbarConfiguration {
    areas: NavigationArea[];
    defaultActiveArea?: string;
    allowDefaultPathBehavior?: boolean;
    routePrefix?: string;
    organization?: NavbarOrganization;
    generalArea?: GeneralArea;
    user?: NavbarUser;
    footer?: NavbarFooter;
    styling?: {
        background?: string;
        className?: string;
        fixed: boolean;
    };
}

export const stripRoutePrefix = (pathname: string, prefix?: string): string => {
    if (!prefix) {
        return pathname;
    }

    const normalizedPrefix = prefix.startsWith('/') ? prefix : `/${prefix}`;
    const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;

    if (normalizedPathname.startsWith(normalizedPrefix)) {
        const stripped = normalizedPathname.slice(normalizedPrefix.length);
        if (stripped === '') {
            return '/';
        }
        return stripped.startsWith('/') ? stripped : `/${stripped}`;
    }

    return pathname;
};

export const addRoutePrefix = (path: string, prefix?: string): string => {
    if (!prefix || !path) {
        return path;
    }

    let normalizedPrefix = prefix.startsWith('/') ? prefix : `/${prefix}`;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    if (normalizedPath === '/') {
        return normalizedPrefix;
    }

    if (normalizedPrefix === '/') {
        return normalizedPath;
    }

    if (normalizedPrefix.endsWith('/')) {
        normalizedPrefix = normalizedPrefix.slice(0, -1);
    }

    return `${normalizedPrefix}${normalizedPath}`;
};

export const getDefaultActiveArea = (config: NavbarConfiguration): string => {
    if (config.defaultActiveArea) {
        return config.defaultActiveArea;
    }

    const defaultArea = config.areas.find(area => area.defaultActive);
    if (defaultArea) {
        return defaultArea.title;
    }

    return config.areas[0]?.title || "";
};

export const getNavigationItems = (config: NavbarConfiguration): NavigationItem[] => {
    return config.areas.map(area => ({
        title: area.title,
        icon: area.icon
    }));
};

export const matchPathPattern = (pathname: string, pattern: string): boolean => {
    const cleanPathname = pathname.split('?')[0];

    const regexPattern = pattern
        .replace(/:\w+/g, '[^/]+')
        .replace(/\*/g, '.*')
        .replace(/\//g, '\\/');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(cleanPathname);
};

export const matchesNavigationItem = (pathname: string, item: NavigationItem): boolean => {
    if (item.path && pathname === item.path) {
        return true;
    }

    if (item.pathPattern && matchPathPattern(pathname, item.pathPattern)) {
        return true;
    }

    if (item.path && pathname.startsWith(item.path + '/')) {
        return true;
    }

    return false;
};

export const findNavigationItemByPath = (config: NavbarConfiguration, path: string): NavigationItem | null => {
    const strippedPath = stripRoutePrefix(path, config.routePrefix);

    for (const area of config.areas) {
        for (const section of area.sections) {
            for (const item of section.items) {
                const result = match(item)
                    .with({ icon: P.any }, (regularItem) =>
                        matchesNavigationItem(strippedPath, regularItem) ? regularItem : null
                    )
                    .with({ children: P.array(P.any) }, (expandableItem) => {
                        for (const child of expandableItem.children) {
                            if (matchesNavigationItem(strippedPath, child)) {
                                return child;
                            }
                        }
                        return null;
                    })
                    .otherwise(() => null);

                if (result) return result;
            }
        }
    }
    return null;
};

export const getAllNavigationPaths = (config: NavbarConfiguration): string[] => {
    const paths: string[] = [];

    for (const area of config.areas) {
        for (const section of area.sections) {
            for (const item of section.items) {
                match(item)
                    .with({ icon: P.any, path: P.string }, (regularItem) => {
                        if (regularItem.path) {
                            paths.push(regularItem.path);
                        }
                    })
                    .with({ children: P.array(P.any) }, (expandableItem) => {
                        for (const child of expandableItem.children) {
                            if (child.path) {
                                paths.push(child.path);
                            }
                        }
                    })
                    .otherwise(() => { });
            }
        }
    }
    return paths;
};

export const getActiveStatesFromPath = (config: NavbarConfiguration, pathname: string): ActiveStates => {
    const defaultActiveArea = getDefaultActiveArea(config);
    let activeArea = defaultActiveArea;
    let activeItem: string | null = null;

    const foundItem = findNavigationItemByPath(config, pathname);
    if (foundItem) {
        for (const area of config.areas) {
            for (const section of area.sections) {
                const itemContainingFoundItem = section.items.find(item => {
                    if (isRegularItem(item)) {
                        return item === foundItem;
                    }
                    if (isExpandableItem(item)) {
                        return item.children.some(child => child === foundItem);
                    }
                    return false;
                });

                if (itemContainingFoundItem) {
                    activeArea = area.title;
                    activeItem = foundItem.title;
                    return { activeArea, activeItem };
                }
            }
        }
    }

    return { activeArea, activeItem };
};

export const findExpandableParentByChildPath = (config: NavbarConfiguration, childPath: string): string | null => {
    const strippedPath = stripRoutePrefix(childPath, config.routePrefix);

    for (const area of config.areas) {
        for (const section of area.sections) {
            for (const item of section.items) {
                const result = match(item)
                    .with({ children: P.array(P.any) }, (expandableItem) => {
                        for (const child of expandableItem.children) {
                            if (matchesNavigationItem(strippedPath, child)) {
                                return expandableItem.title;
                            }
                        }
                        return null;
                    })
                    .otherwise(() => null);

                if (result) return result;
            }
        }
    }
    return null;
};