import { LucideIcon } from "lucide-react";

export interface NavigationArea {
    title: string;
    icon: LucideIcon;
    sections: MenuSection[];
    defaultActive?: boolean;
}

export type NavigationItem = {
    title: string;
    icon: LucideIcon;
    path?: string;
    pathPattern?: string;
    onClick?: () => void;
    disabled?: boolean;
    badge?: string | number;
};

export interface GeneralArea {
    title: string;
    items: NavigationItem[];
}

export interface MenuSection {
    label: string;
    items: NavigationItem[];
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
        return stripped === '' ? '/' : stripped;
    }

    return pathname;
};

export const addRoutePrefix = (path: string, prefix?: string): string => {
    if (!prefix || !path) {
        return path;
    }

    const normalizedPrefix = prefix.startsWith('/') ? prefix : `/${prefix}`;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    if (normalizedPath === '/') {
        return normalizedPrefix;
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
                if (matchesNavigationItem(strippedPath, item)) {
                    return item;
                }
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
                if (item.path) {
                    paths.push(item.path);
                }
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
        const strippedPath = stripRoutePrefix(pathname, config.routePrefix);
        for (const area of config.areas) {
            for (const section of area.sections) {
                if (section.items.some(item => matchesNavigationItem(strippedPath, item))) {
                    activeArea = area.title;
                    activeItem = foundItem.title;
                    return { activeArea, activeItem };
                }
            }
        }
    }

    return { activeArea, activeItem };
};