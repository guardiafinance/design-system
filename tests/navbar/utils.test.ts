/**
 * Unit tests for src/components/navbar/utils.tsx (route prefix + active state).
 */
import { Circle, type LucideIcon } from "lucide-react";
import { describe, expect, it } from "vitest";
import type { NavbarConfiguration } from "../../src/components/navbar/utils";
import {
    addRoutePrefix,
    findExpandableParentByChildPath,
    findNavigationItemByPath,
    getActiveStatesFromPath,
    getDefaultActiveArea,
    matchPathPattern,
    matchesNavigationItem,
    stripRoutePrefix,
} from "../../src/components/navbar/utils";

const mockIcon = Circle as LucideIcon;

const GROUP_RULES_PATH = "/controllership/conciliation/group-rules";
/** Must not be a prefix of nested routes; `matchesNavigationItem` treats `path + '/'` as a prefix match. */
const DEFAULT_HOME_PATH = "/controllership/inicio";

function createTestNavbarConfig(
    overrides?: Partial<NavbarConfiguration>
): NavbarConfiguration {
    const base: NavbarConfiguration = {
        areas: [
            {
                title: "Controladoria",
                icon: mockIcon,
                defaultActive: true,
                sections: [
                    {
                        label: "CONTROLADORIA",
                        items: [
                            {
                                title: "Início",
                                icon: mockIcon,
                                path: DEFAULT_HOME_PATH,
                            },
                            {
                                title: "Conciliação",
                                icon: mockIcon,
                                children: [
                                    {
                                        title: "Grupos de regras",
                                        path: GROUP_RULES_PATH,
                                    },
                                    { title: "Regras", path: "/controllership/conciliation/rules" },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
        allowDefaultPathBehavior: true,
    };
    return { ...base, ...overrides };
}

describe("stripRoutePrefix", () => {
    it("strips leading /theros from pathname when prefix is theros", () => {
        expect(stripRoutePrefix("/theros/controllership/conciliation/group-rules", "theros")).toBe(
            GROUP_RULES_PATH
        );
    });

    it("strips when prefix includes leading slash", () => {
        expect(stripRoutePrefix("/theros/controllership/conciliation/group-rules", "/theros")).toBe(
            GROUP_RULES_PATH
        );
    });

    it("returns pathname unchanged when prefix is absent", () => {
        expect(stripRoutePrefix(GROUP_RULES_PATH, undefined)).toBe(GROUP_RULES_PATH);
        expect(stripRoutePrefix(GROUP_RULES_PATH, "")).toBe(GROUP_RULES_PATH);
    });

    it("returns pathname unchanged when pathname does not start with prefix", () => {
        expect(stripRoutePrefix(GROUP_RULES_PATH, "/theros")).toBe(GROUP_RULES_PATH);
    });

    it("normalizes pathname without leading slash", () => {
        expect(stripRoutePrefix("theros/controllership", "theros")).toBe("/controllership");
    });

    it("returns single slash when stripping leaves empty segment", () => {
        expect(stripRoutePrefix("/theros", "/theros")).toBe("/");
    });
});

describe("addRoutePrefix", () => {
    it("prepends prefix to app path", () => {
        expect(addRoutePrefix(GROUP_RULES_PATH, "theros")).toBe(
            "/theros/controllership/conciliation/group-rules"
        );
    });

    it("handles prefix with leading slash", () => {
        expect(addRoutePrefix(GROUP_RULES_PATH, "/theros")).toBe(
            "/theros/controllership/conciliation/group-rules"
        );
    });

    it("returns app root as prefix when path is /", () => {
        expect(addRoutePrefix("/", "theros")).toBe("/theros");
    });

    it("returns path unchanged when prefix missing", () => {
        expect(addRoutePrefix(GROUP_RULES_PATH, undefined)).toBe(GROUP_RULES_PATH);
    });

    it("trims trailing slash on prefix before joining", () => {
        expect(addRoutePrefix("/foo", "/theros/")).toBe("/theros/foo");
    });
});

describe("findNavigationItemByPath", () => {
    it("prefers the most specific match when home uses a broad path prefix", () => {
        const config = createTestNavbarConfig();
        const section = config.areas[0].sections[0];
        const conciliacao = section.items[1];
        section.items = [
            { title: "Início", icon: mockIcon, path: "/controllership" },
            conciliacao,
        ];

        const item = findNavigationItemByPath(config, GROUP_RULES_PATH);
        expect(item?.title).toBe("Grupos de regras");
    });

    it("resolves child item when pathname includes microfrontend prefix", () => {
        const config = createTestNavbarConfig({ routePrefix: "/theros" });
        const item = findNavigationItemByPath(
            config,
            "/theros/controllership/conciliation/group-rules"
        );
        expect(item?.title).toBe("Grupos de regras");
    });

    it("resolves when prefix is provided without leading slash", () => {
        const config = createTestNavbarConfig({ routePrefix: "theros" });
        const item = findNavigationItemByPath(
            config,
            "/theros/controllership/conciliation/group-rules"
        );
        expect(item?.title).toBe("Grupos de regras");
    });

    it("returns null when URL still has host prefix but config.routePrefix is empty", () => {
        const config = createTestNavbarConfig({ routePrefix: undefined });
        const item = findNavigationItemByPath(
            config,
            "/theros/controllership/conciliation/group-rules"
        );
        expect(item).toBeNull();
    });

    it("resolves standalone pathname without prefix config", () => {
        const config = createTestNavbarConfig({ routePrefix: undefined });
        const item = findNavigationItemByPath(config, GROUP_RULES_PATH);
        expect(item?.title).toBe("Grupos de regras");
    });
});

describe("getActiveStatesFromPath", () => {
    it("returns area title and child title for prefixed conciliation URL", () => {
        const config = createTestNavbarConfig({ routePrefix: "/theros" });
        const states = getActiveStatesFromPath(
            config,
            "/theros/controllership/conciliation/group-rules"
        );
        expect(states).toEqual({
            activeArea: "Controladoria",
            activeItem: "Grupos de regras",
        });
    });

    it("returns area title and item for standalone path", () => {
        const config = createTestNavbarConfig();
        const states = getActiveStatesFromPath(config, GROUP_RULES_PATH);
        expect(states).toEqual({
            activeArea: "Controladoria",
            activeItem: "Grupos de regras",
        });
    });
});

describe("findExpandableParentByChildPath", () => {
    it("returns expandable parent title for child under route prefix", () => {
        const config = createTestNavbarConfig({ routePrefix: "/theros" });
        const parent = findExpandableParentByChildPath(
            config,
            "/theros/controllership/conciliation/group-rules"
        );
        expect(parent).toBe("Conciliação");
    });
});

describe("defaultActiveArea misuse (path instead of area title)", () => {
    it("getDefaultActiveArea returns configured string even when it is a path", () => {
        const config = createTestNavbarConfig({
            defaultActiveArea: "/controllership",
        });
        expect(getDefaultActiveArea(config)).toBe("/controllership");
    });

    it("when no item matches path, activeArea stays that path and activeItem is null", () => {
        const config = createTestNavbarConfig({
            defaultActiveArea: "/controllership",
            routePrefix: "/theros",
        });
        const states = getActiveStatesFromPath(config, "/theros/unknown/deep/path");
        expect(states.activeArea).toBe("/controllership");
        expect(states.activeItem).toBeNull();
    });

    it("matching route still resolves area by title, ignoring path-shaped defaultActiveArea", () => {
        const config = createTestNavbarConfig({
            defaultActiveArea: "/controllership",
            routePrefix: "/theros",
        });
        const states = getActiveStatesFromPath(
            config,
            "/theros/controllership/conciliation/group-rules"
        );
        expect(states.activeArea).toBe("Controladoria");
        expect(states.activeItem).toBe("Grupos de regras");
    });
});

describe("matchPathPattern and matchesNavigationItem", () => {
    it("matchPathPattern treats :param as single path segment", () => {
        expect(matchPathPattern("/controllership/rules/42", "/controllership/rules/:id")).toBe(true);
        expect(matchPathPattern("/controllership/rules/42/extra", "/controllership/rules/:id")).toBe(
            false
        );
    });

    it("matchesNavigationItem uses pathPattern after stripRoutePrefix-equivalent path", () => {
        const item = {
            title: "Rule detail",
            pathPattern: "/controllership/rules/:id",
        };
        expect(matchesNavigationItem("/controllership/rules/99", item)).toBe(true);
    });
});
