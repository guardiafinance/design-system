[![Build and Test](https://github.com/guardiafinance/design-system/actions/workflows/pull-request.yml/badge.svg)](https://github.com/guardiafinance/design-system/actions/workflows/pull-request.yml)
[![Publish Package](https://github.com/guardiafinance/design-system/actions/workflows/publish.yml/badge.svg)](https://github.com/guardiafinance/design-system/actions/workflows/publish.yml)


# Guardia Design System

A comprehensive React component library built with TypeScript, Tailwind CSS, and Radix UI primitives. This design system provides a complete set of accessible, customizable components for building modern web applications.

## 🚀 Features

- **40+ Components** - Complete set of UI components for any application
- **TypeScript Support** - Full type safety and IntelliSense
- **Accessible** - Built on Radix UI primitives for accessibility
- **Customizable** - Easy theming with Tailwind CSS
- **Modern** - Built with React 18+ and latest web standards
- **Tree-shakable** - Import only what you need

## 📦 Installation

```bash
npm install guardia-design-system
```

### Peer Dependencies

Make sure you have these peer dependencies installed:

```bash
npm install react react-dom react-router zod
```

## 🚀 Development Setup

After installing dependencies, initialize your development environment:

```bash
npm run init:env
```

This command configures Git hooks to use the `.githooks/` directory for the project.

## 🎨 Quick Start

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from 'guardia-design-system'

function App() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to Guardia Design System</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Get Started</Button>
      </CardContent>
    </Card>
  )
}
```

## 🧩 Components

### Layout & Structure

#### **Card**
Flexible container component for grouping related content.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from 'guardia-design-system'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <p>Card footer</p>
  </CardFooter>
</Card>
```

#### **Separator**
Visual separator for dividing content sections.

```tsx
import { Separator } from 'guardia-design-system'

<div>
  <p>Content above</p>
  <Separator />
  <p>Content below</p>
</div>
```

#### **Sidebar**
Collapsible sidebar navigation component.

```tsx
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem } from 'guardia-design-system'

<Sidebar>
  <SidebarHeader>Navigation</SidebarHeader>
  <SidebarContent>
    <SidebarMenu>
      <SidebarMenuItem>Dashboard</SidebarMenuItem>
      <SidebarMenuItem>Settings</SidebarMenuItem>
    </SidebarMenu>
  </SidebarContent>
</Sidebar>
```

#### **Navbar**
Advanced sidebar navigation with dynamic menu sections and user management.

```tsx
import { Navbar, NavbarProvider } from 'guardia-design-system'
import { Home, Settings, User, BarChart3 } from 'lucide-react'

const navbarSettings = {
  organization: {
    name: "Guardia Finance",
    subtitle: "Financial Platform"
  },
  areas: [
    {
      title: "Dashboard",
      icon: Home,
      defaultActive: true,
      sections: [
        {
          label: "Overview",
          items: [
            { title: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
            { title: "Reports", icon: BarChart3, path: "/dashboard/reports" }
          ]
        }
      ]
    },
    {
      title: "Settings",
      icon: Settings,
      sections: [
        {
          label: "Account",
          items: [
            { title: "Profile", icon: User, path: "/settings/profile" },
            { title: "Preferences", icon: Settings, path: "/settings/preferences" }
          ]
        }
      ]
    }
  ],
  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "/avatar.jpg"
  },
  footer: {
    version: "v1.0.0",
    copyright: "© 2024 Guardia"
  }
}

<NavbarProvider>
  <Navbar settings={navbarSettings} />
</NavbarProvider>
```

### Form Controls

#### **Button**
Versatile button component with multiple variants and sizes.

```tsx
import { Button } from 'guardia-design-system'

<Button variant="default" size="default">Primary</Button>
<Button variant="outline" size="sm">Secondary</Button>
<Button variant="ghost" size="lg">Ghost</Button>
<Button variant="destructive">Delete</Button>
```

**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`  
**Sizes:** `xs`, `sm`, `default`, `lg`, `icon`

#### **Input**
Styled input field with focus states and validation support.

```tsx
import { Input } from 'guardia-design-system'

<Input type="text" placeholder="Enter your name" />
<Input type="email" placeholder="Enter your email" />
<Input type="password" placeholder="Enter your password" />
```

#### **Textarea**
Multi-line text input component.

```tsx
import { Textarea } from 'guardia-design-system'

<Textarea placeholder="Enter your message" rows={4} />
```

#### **Select**
Dropdown selection component with search and multi-select support.

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'guardia-design-system'

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### **Multi-Select**
Component for selecting multiple options from a list.

```tsx
import { MultiSelect } from 'guardia-design-system'

<MultiSelect 
  options={[
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' }
  ]}
  placeholder="Select frameworks"
/>
```

#### **Checkbox**
Styled checkbox input with indeterminate state support.

```tsx
import { Checkbox } from 'guardia-design-system'

<Checkbox id="terms" />
<label htmlFor="terms">Accept terms and conditions</label>
```

#### **Radio Group**
Group of radio buttons for single selection.

```tsx
import { RadioGroup, RadioGroupItem } from 'guardia-design-system'

<RadioGroup defaultValue="option1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="r1" />
    <label htmlFor="r1">Option 1</label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option2" id="r2" />
    <label htmlFor="r2">Option 2</label>
  </div>
</RadioGroup>
```

#### **Switch**
Toggle switch component for boolean values.

```tsx
import { Switch } from 'guardia-design-system'

<Switch id="notifications" />
<label htmlFor="notifications">Enable notifications</label>
```

#### **Input OTP**
One-time password input with individual digit fields.

```tsx
import { InputOTP, InputOTPGroup, InputOTPSlot } from 'guardia-design-system'

<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>
```

### Data Display

#### **Table**
Feature-rich table component with sorting, filtering, and pagination.

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'guardia-design-system'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
      <TableCell>Admin</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### **Badge**
Small status and label component.

```tsx
import { Badge } from 'guardia-design-system'

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

#### **Avatar**
User profile image component with fallback support.

```tsx
import { Avatar, AvatarImage, AvatarFallback } from 'guardia-design-system'

<Avatar>
  <AvatarImage src="/avatar.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

#### **Chart**
Data visualization component built on Recharts.

```tsx
import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent } from 'guardia-design-system'

<ChartContainer>
  <Chart data={chartData}>
    <ChartTooltip>
      <ChartTooltipContent />
    </ChartTooltip>
  </Chart>
</ChartContainer>
```

#### **Skeleton**
Loading placeholder component.

```tsx
import { Skeleton } from 'guardia-design-system'

<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-4 w-[200px]" />
```

### Feedback & Overlays

#### **Alert**
Important message display component.

```tsx
import { Alert, AlertDescription, AlertTitle } from 'guardia-design-system'

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the cli.
  </AlertDescription>
</Alert>
```

#### **Dialog**
Modal dialog component for important interactions.

```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from 'guardia-design-system'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

#### **Alert Dialog**
Modal dialog specifically for destructive actions.

```tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from 'guardia-design-system'

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### **Sheet**
Slide-out panel component.

```tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from 'guardia-design-system'

<Sheet>
  <SheetTrigger asChild>
    <Button>Open Sheet</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Edit Profile</SheetTitle>
      <SheetDescription>
        Make changes to your profile here.
      </SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>
```

#### **Drawer**
Mobile-friendly drawer component.

```tsx
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from 'guardia-design-system'

<Drawer>
  <DrawerTrigger asChild>
    <Button>Open Drawer</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Are you absolutely sure?</DrawerTitle>
      <DrawerDescription>This action cannot be undone.</DrawerDescription>
    </DrawerHeader>
  </DrawerContent>
</Drawer>
```

#### **Popover**
Floating content container.

```tsx
import { Popover, PopoverContent, PopoverTrigger } from 'guardia-design-system'

<Popover>
  <PopoverTrigger asChild>
    <Button>Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <p>Popover content goes here</p>
  </PopoverContent>
</Popover>
```

#### **Tooltip**
Contextual information on hover.

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'guardia-design-system'

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button>Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Tooltip content</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

#### **Sonner (Toast)**
Elegant toast notifications.

```tsx
import { toast } from 'guardia-design-system'

// In your component
const showToast = () => {
  toast("Event has been created", {
    description: "Monday, January 3rd at 6:00pm",
    action: {
      label: "Undo",
      onClick: () => console.log("Undo"),
    },
  })
}
```

### Navigation

#### **Tabs**
Tabbed interface component.

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'guardia-design-system'

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    <p>Account content</p>
  </TabsContent>
  <TabsContent value="password">
    <p>Password content</p>
  </TabsContent>
</Tabs>
```

#### **Accordion**
Collapsible content sections.

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from 'guardia-design-system'

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

#### **Breadcrumb**
Navigation breadcrumb component.

```tsx
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from 'guardia-design-system'

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Components</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

#### **Pagination**
Page navigation component.

```tsx
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from 'guardia-design-system'

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

### Interactive Elements

#### **Toggle**
Toggle button component.

```tsx
import { Toggle } from 'guardia-design-system'

<Toggle aria-label="Toggle italic">
  <Italic className="h-4 w-4" />
</Toggle>
```

#### **Toggle Group**
Group of toggle buttons.

```tsx
import { ToggleGroup, ToggleGroupItem } from 'guardia-design-system'

<ToggleGroup type="multiple">
  <ToggleGroupItem value="bold" aria-label="Toggle bold">
    <Bold className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="italic" aria-label="Toggle italic">
    <Italic className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>
```

#### **Collapsible**
Collapsible content component.

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from 'guardia-design-system'

<Collapsible>
  <CollapsibleTrigger asChild>
    <Button>Toggle</Button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <p>Collapsible content</p>
  </CollapsibleContent>
</Collapsible>
```

### Menus & Context

#### **Dropdown Menu**
Dropdown menu component.

```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from 'guardia-design-system'

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### **Context Menu**
Right-click context menu.

```tsx
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from 'guardia-design-system'

<ContextMenu>
  <ContextMenuTrigger>
    <div>Right click me</div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Copy</ContextMenuItem>
    <ContextMenuItem>Paste</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

#### **Menubar**
Horizontal menu bar component.

```tsx
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from 'guardia-design-system'

<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New</MenubarItem>
      <MenubarItem>Open</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

#### **Navigation Menu**
Complex navigation menu with mega menu support.

```tsx
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from 'guardia-design-system'

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink>Introduction</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

### Form Integration

#### **Form**
Complete form component with validation support.

```tsx
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from 'guardia-design-system'

<Form>
  <FormField
    control={form.control}
    name="username"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Username</FormLabel>
        <FormControl>
          <Input placeholder="shadcn" {...field} />
        </FormControl>
        <FormDescription>
          This is your public display name.
        </FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

#### **Label**
Accessible form label component.

```tsx
import { Label } from 'guardia-design-system'

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

### Typography

#### **Typography**
Pre-styled text components with semantic variants and direct component access.

```tsx
import { Typography, H1, H2, H3, H4, H5, H6, P, Lead, Large, Small, Muted, Code, Blockquote, List, Link, PageTitle } from 'guardia-design-system'

// Using Typography component with variants
<Typography variant="h1">Heading 1</Typography>
<Typography variant="h2">Heading 2</Typography>
<Typography variant="p">Body text</Typography>
<Typography variant="muted">Muted text</Typography>

// Using direct components (recommended)
<H1>Main Heading</H1>
<H2>Section Heading</H2>
<H3>Subsection Heading</H3>
<H4>Page Title</H4>
<H5>Card Title</H5>
<H6>Small Heading</H6>

<P>Regular paragraph text with proper spacing.</P>
<Lead>Lead text for introductions and summaries.</Lead>
<Large>Large text for emphasis.</Large>
<Small>Small text for captions and labels.</Small>
<Muted>Muted text for secondary information.</Muted>

<Code>inline code</Code>
<Blockquote>This is a blockquote with proper styling.</Blockquote>

<List>
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</List>

<Link href="/docs">Documentation link</Link>
<PageTitle>Page Title Component</PageTitle>
```

### Utilities

#### **Scroll Area**
Custom scrollable area component.

```tsx
import { ScrollArea } from 'guardia-design-system'

<ScrollArea className="h-72 w-48 rounded-md border">
  <div className="p-4">
    <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
    {tags.map((tag) => (
      <div key={tag} className="text-sm">
        {tag}
      </div>
    ))}
  </div>
</ScrollArea>
```

#### **Custom Icons**
Collection of custom icon components.

```tsx
import { SparklesFilled, Sparkles, SparkleSquared, SparkleAi } from 'guardia-design-system'

<SparklesFilled className="h-8 w-8" />
<Sparkles className="h-6 w-6" />
<SparkleSquared className="h-5 w-5" />
<SparkleAi className="h-4 w-4" />
```

## 🎨 Theming

The design system supports theming through CSS custom properties and Tailwind CSS. You can customize colors, spacing, and other design tokens.

### Theme Provider

```tsx
import { ThemeProvider } from 'guardia-design-system'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="guardia-ui-theme">
      {/* Your app content */}
    </ThemeProvider>
  )
}
```

### Theme Toggle

```tsx
import { ThemeToggle } from 'guardia-design-system'

<ThemeToggle />
```

## 🛠️ Utilities

### Class Name Utility

The `cn` utility function combines `clsx` and `tailwind-merge` for optimal class name handling:

```tsx
import { cn } from 'guardia-design-system'

// Combines and deduplicates Tailwind classes
const className = cn("px-4 py-2", "px-2", "bg-red-500") // "py-2 px-2 bg-red-500"
```

### Conditional Rendering

The `When` component provides conditional rendering:

```tsx
import { When } from 'guardia-design-system'

<When condition={isLoading}>
  <Skeleton className="h-4 w-full" />
</When>
```

## 📚 TypeScript Support

All components are fully typed with TypeScript. You'll get full IntelliSense support and type checking.

```tsx
import { Button, ButtonProps } from 'guardia-design-system'

const CustomButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />
}
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more information.

---

Built with ❤️ by the Guardia team
