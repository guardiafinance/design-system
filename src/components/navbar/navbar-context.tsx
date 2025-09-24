import React, { createContext, useContext, ReactNode, useState } from 'react';
import { SidebarProvider } from '../sidebar';

export interface NavbarState {
    activeArea: string;
    activeItem: string | null;
}

export interface NavbarContextValue {
    state: NavbarState;
    setActiveArea: (area: string) => void;
    setActiveItem: (item: string | null) => void;
    setState: (state: NavbarState) => void;
}

const NavbarContext = createContext<NavbarContextValue | null>(null);

export interface NavbarProviderProps {
    children: ReactNode;
    initialState?: NavbarState;
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function NavbarProvider({
    children,
    initialState,
    defaultOpen = true,
    open,
    onOpenChange
}: NavbarProviderProps) {
    const [state, setState] = useState<NavbarState>(
        initialState || { activeArea: '', activeItem: null }
    );

    const setActiveArea = (area: string) => {
        setState(prev => ({ ...prev, activeArea: area }));
    };

    const setActiveItem = (item: string | null) => {
        setState(prev => ({ ...prev, activeItem: item }));
    };

    const contextValue: NavbarContextValue = {
        state,
        setActiveArea,
        setActiveItem,
        setState,
    };

    return (
        <NavbarContext.Provider value={contextValue}>
            <SidebarProvider defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange} >
                {children}
            </SidebarProvider>
        </NavbarContext.Provider>
    );
}

export function InternalNavbarProvider({ children, initialState }: NavbarProviderProps) {
    return <NavbarProvider initialState={initialState}>{children}</NavbarProvider>;
}

export function useNavbarContext(): NavbarContextValue {
    const context = useContext(NavbarContext);
    if (!context) {
        throw new Error('useNavbarContext must be used within a NavbarProvider');
    }
    return context;
}

export function useNavbarControl() {
    const context = useContext(NavbarContext);
    return context;
}
