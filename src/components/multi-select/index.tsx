"use client"

import * as React from "react"
import Select, { components, type MultiValue } from "react-select"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"
import { Badge } from "../badge"

const MultiValue = (props: any) => {
    return (
        <components.MultiValue {...props}>
            <Badge
                variant="secondary"
                className="mr-1 flex items-center gap-1"
            >
                {props.data.icon && (
                    <span className="flex h-3 w-3 items-center justify-center">
                        {props.data.icon}
                    </span>
                )}
                <span>{props.data.label}</span>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        e.nativeEvent.stopImmediatePropagation()
                        props.removeProps.onClick()
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                    className="ml-1 flex h-3 w-3 items-center justify-center rounded-full hover:bg-muted-foreground/20"
                >
                    <X className="h-2.5 w-2.5" />
                </button>
            </Badge>
        </components.MultiValue>
    )
}

const selectStyles = {
    control: (base: any, state: any) => ({
        ...base,
        minHeight: "40px",
        border: "1px solid hsl(var(--border))",
        borderRadius: "6px",
        backgroundColor: "hsl(var(--background))",
        fontSize: "0.85rem",
        boxShadow: state.isFocused
            ? "0 0 0 2px hsl(var(--ring))"
            : "none",
        "&:hover": {
            border: "1px solid hsl(var(--border))",
        },
    }),
    valueContainer: (base: any) => ({
        ...base,
        padding: "4px 8px",
        minHeight: "32px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "4px",
    }),
    input: (base: any) => ({
        ...base,
        margin: "0",
        padding: "0",
        color: "hsl(var(--foreground))",
        fontSize: "0.85rem",
    }),
    placeholder: (base: any) => ({
        ...base,
        color: "hsl(var(--muted-foreground))",
        margin: "0",
        fontSize: "0.85rem",
    }),
    menu: (base: any) => ({
        ...base,
        backgroundColor: "hsl(var(--popover))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "6px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        zIndex: 50,
    }),
    menuList: (base: any) => ({
        ...base,
        padding: "4px",
        maxHeight: "200px",
    }),
    option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isFocused
            ? "hsl(var(--accent))"
            : state.isSelected
                ? "hsl(var(--accent))"
                : "transparent",
        color: state.isFocused || state.isSelected
            ? "hsl(var(--accent-foreground))"
            : "hsl(var(--foreground))",
        borderRadius: "4px",
        padding: "6px 8px",
        margin: "2px 0",
        cursor: "pointer",
        fontSize: "0.85rem",
        "&:hover": {
            backgroundColor: "hsl(var(--accent))",
            color: "hsl(var(--accent-foreground))",
        },
    }),
    multiValue: (base: any) => ({
        ...base,
        backgroundColor: "transparent",
        border: "none",
        padding: 0,
        margin: 0,
        display: "inline-flex",
        alignItems: "center",
        maxWidth: "none",
    }),
    multiValueLabel: (base: any) => ({
        ...base,
    }),
    multiValueRemove: (base: any) => ({
        ...base,
        display: "none",
    }),
    indicatorsContainer: (base: any) => ({
        ...base,
        padding: "0 8px",
    }),
    indicatorSeparator: (base: any) => ({
        ...base,
        backgroundColor: "hsl(var(--border))",
    }),
    clearIndicator: (base: any) => ({
        ...base,
        color: "hsl(var(--muted-foreground))",
        "&:hover": {
            color: "hsl(var(--foreground))",
        },
    }),
    dropdownIndicator: (base: any) => ({
        ...base,
        color: "hsl(var(--muted-foreground))",
        "&:hover": {
            color: "hsl(var(--foreground))",
        },
    }),
}

const multiSelectVariants = cva(
    "w-full",
    {
        variants: {
            size: {
                default: "min-h-[40px]",
                sm: "min-h-[36px]",
                lg: "min-h-[44px]",
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
)

interface MultiSelectOption {
    value: string
    label: string
    icon?: React.ReactNode
}

interface MultiSelectProps
    extends Omit<React.ComponentProps<typeof Select>, "options" | "value" | "onChange" | "noOptionsMessage">,
    VariantProps<typeof multiSelectVariants> {
    options: MultiSelectOption[]
    value?: MultiSelectOption[]
    onChange?: (value: MultiSelectOption[]) => void
    placeholder?: string
    isClearable?: boolean
    isSearchable?: boolean
    isDisabled?: boolean
    isLoading?: boolean
    noOptionsMessage?: string
    className?: string
}

const MultiSelect = React.forwardRef<any, MultiSelectProps>(
    (
        {
            options,
            value = [],
            onChange,
            placeholder = "Selecione as opções...",
            isClearable = true,
            isSearchable = true,
            isDisabled = false,
            isLoading = false,
            noOptionsMessage = "Nenhuma opção encontrada",
            size,
            className,
            ...props
        },
        ref
    ) => {
        const handleChange = (selectedOptions: unknown) => {
            onChange?.(selectedOptions as MultiSelectOption[])
        }

        return (
            <div className={cn(multiSelectVariants({ size, className }))}>
                <Select
                    ref={ref}
                    isMulti
                    options={options}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    isClearable={isClearable}
                    isSearchable={isSearchable}
                    isDisabled={isDisabled}
                    isLoading={isLoading}
                    noOptionsMessage={() => noOptionsMessage}
                    components={{
                        MultiValue,
                    }}
                    styles={selectStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    {...props}
                />
            </div>
        )
    }
)

MultiSelect.displayName = "MultiSelect"

export { MultiSelect, type MultiSelectOption, type MultiSelectProps }
