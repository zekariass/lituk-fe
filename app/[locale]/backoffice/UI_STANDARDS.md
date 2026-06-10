# Backoffice UI Standards

## Color Scheme

### Backgrounds
- **Page Background**: `bg-background` (main page wrapper)
- **Card/Container Background**: `bg-card` (cards, dialogs, tables)
- **Input Fields**: `bg-card` (all inputs, selects, textareas)
- **Hover States**: `hover:bg-accent`
- **Active/Selected**: `bg-accent`

### Text Colors
- **Primary Text**: `text-foreground` (default)
- **Secondary Text**: `text-muted-foreground`
- **Links**: `text-primary`
- **Headings**: `text-foreground font-bold`

### Status Colors
- **Success/Active**: `bg-emerald-100 dark:bg-emerald-950 text-emerald-500`
- **Error/Inactive**: `bg-red-100 dark:bg-red-950 text-red-500`
- **Warning**: `bg-amber-100 dark:bg-amber-950 text-amber-500`
- **Info**: `bg-blue-100 dark:bg-blue-950 text-blue-500`
- **Admin/Special**: `bg-purple-100 dark:bg-purple-950 text-purple-500`

## Typography

### Headings
- **H1 (Page Title)**: `text-3xl font-bold`
- **H2 (Section)**: `text-2xl font-bold`
- **H3 (Dialog Title)**: `text-xl font-bold`
- **H4 (Subsection)**: `text-lg font-semibold`

### Body Text
- **Regular**: `text-base` (default)
- **Small**: `text-sm`
- **Extra Small**: `text-xs`
- **Labels**: `text-sm font-medium`

## Spacing

### Page Layout
- **Page Container**: `space-y-6`
- **Section Spacing**: `mb-4` or `mb-6`
- **Card Padding**: `p-6`
- **Dialog Padding**: `p-6`

### Form Elements
- **Input Padding**: `px-4 py-2`
- **Button Padding**: `px-4 py-2`
- **Form Group Spacing**: `space-y-4`

## Components

### Buttons

#### Primary Button
```tsx
className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
```

#### Secondary Button
```tsx
className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
```

#### Destructive Button
```tsx
className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
```

### Input Fields

#### Text Input
```tsx
className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
```

#### Select Dropdown
```tsx
className="px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
```

#### Textarea
```tsx
className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
```

### Dialogs

#### Dialog Overlay
```tsx
className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
```

#### Dialog Container
```tsx
className="bg-card rounded-lg border max-w-md w-full p-6 space-y-4"
```

### Cards

#### Standard Card
```tsx
className="p-6 rounded-lg border bg-card hover:bg-accent transition-colors"
```

### Badges

#### Status Badge
```tsx
className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-{color}-100 dark:bg-{color}-950 text-{color}-500"
```

### Tables

#### Table Container
```tsx
className="rounded-lg border bg-card"
```

#### Table Header
```tsx
className="border-b border-border"
```

#### Table Row
```tsx
className="border-b border-border hover:bg-accent"
```

## Icons
- Use Lucide React icons consistently
- Icon size: `h-4 w-4` for inline, `h-5 w-5` for buttons, `h-6 w-6` for larger elements

## Borders
- **Standard Border**: `border border-border`
- **Rounded Corners**: `rounded-lg` (standard), `rounded-full` (badges, avatars)

## Transitions
- **Opacity**: `transition-opacity`
- **Colors**: `transition-colors`
- **All**: `transition-all` (use sparingly)
