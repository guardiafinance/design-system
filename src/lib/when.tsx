import { ReactNode } from "react";

interface WhenProps {
    children: ReactNode;
    condition?: boolean;
}

export const When = (props: WhenProps) => {
    return (
        <>
            {props.condition && <>{props.children}</>}
        </>
    )
}
