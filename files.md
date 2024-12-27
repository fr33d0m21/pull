# Codebase Documentation

This document provides a comprehensive analysis of the codebase, including file purposes and function descriptions.

## Table of Contents

1. Components
   - Dashboard Components
   - Processing Components
   - Common Components
2. Context
3. Library
4. Utils
5. Types
6. Database

## Analysis

### Components

#### Common Components

##### `Navigation.tsx`

**Purpose**: Provides the main navigation header for the application, including route links, store selection, and file upload capabilities.

**Key Features**:
- Responsive layout
- Permission-based navigation links
- Active route highlighting
- Store selector integration
- Quick search functionality
- Contextual file upload buttons

**Functions**:

1. `Navigation` (Main Component)
   - Props: None
   - Purpose: Renders the main navigation header
   - Uses multiple context hooks:
     - `useStore` for store management
     - `useAuth` for permissions
     - `useLocation` for route awareness

**Navigation Links**:
- Dashboard (Home)
- Spreadsheet (Permission-gated)
- Working (Tracking)
- Admin (Role-gated)

**Components Used**:
- `StoreSelector`: Store selection dropdown
- `FileUpload`: Contextual file upload component
- `QuickSearch`: Search functionality
- Lucide icons for visual elements

**Conditional Rendering**:
- Spreadsheet link based on `viewSpreadsheet` permission
- Admin link based on admin role
- File upload type based on current route

##### `FileUpload.tsx`

**Purpose**: Handles file uploads for removal orders and tracking data, with drag-and-drop support and database integration.

**Key Features**:
- Drag and drop file upload
- CSV file validation
- Database integration
- Progress tracking
- Error handling
- Data transformation
- Store context awareness

**Functions**:

1. `FileUpload` (Main Component)
   - Props: `type: 'removal' | 'tracking'`
   - Purpose: Main file upload interface component

2. `handleDragOver`, `handleDragLeave`, `handleDrop`
   - Purpose: Handle drag and drop file interactions
   - Manage drag state and file processing

3. `handleFileInput`
   - Purpose: Handle manual file selection
   - Validates store selection and processes files

4. `transformToFrontendFormat`
   - Purpose: Converts database entries to frontend data format
   - Parameters: `entries: any[], spreadsheetId: string`
   - Returns: `RemovalOrder[] | TrackingEntry[]`

5. `saveToDatabase`
   - Purpose: Saves parsed data to the database
   - Creates spreadsheet entry
   - Processes individual items
   - Updates frontend state
   - Handles error cases

6. `handleFiles`
   - Purpose: Process uploaded files
   - Validates file types
   - Parses file content
   - Manages upload state and errors

**States**:
- `isDragging`: Tracks drag state
- `error`: Stores error messages
- `showClearConfirm`: Controls clear confirmation dialog
- `uploading`: Tracks upload progress

**Database Integration**:
- Creates spreadsheet entries
- Stores individual items
- Manages processing status
- Handles rollback on errors

##### `QuickSearch.tsx`

**Purpose**: Provides a global search functionality for quickly finding and navigating to orders across the application.

**Key Features**:
- Keyboard shortcut support (Cmd/Ctrl + K)
- Real-time search filtering
- Modal interface
- Click-outside handling
- Result highlighting
- Smooth scroll to selected item

**Functions**:

1. `QuickSearch` (Main Component)
   - Props: None
   - Purpose: Renders the quick search interface and handles search logic

2. `handleClickOutside`
   - Purpose: Closes search modal when clicking outside
   - Uses ref to detect clicks outside the component

3. `handleKeyPress`
   - Purpose: Manages keyboard shortcuts
   - Cmd/Ctrl + K to open
   - Escape to close

4. `handleSelect`
   - Purpose: Handles search result selection
   - Navigates to spreadsheet view
   - Scrolls to selected order
   - Adds temporary highlight effect

**Search Features**:
- Searches by:
  - Removal ID
  - Order ID
  - SKU
- Limited to 5 results
- Real-time filtering
- Case-insensitive matching

**States**:
- `isOpen`: Controls modal visibility
- `searchTerm`: Current search input
- `filteredOrders`: Computed search results

**UI Elements**:
- Search button with keyboard shortcut display
- Modal with search input
- Results list with order details
- Loading and empty states
- Close button

##### `StoreSelector.tsx`

**Purpose**: Provides a dropdown interface for selecting and managing stores based on user permissions.

**Key Features**:
- Role-based store access
- Store management integration
- Permission-based UI
- Visual store selection
- Responsive design

**Functions**:

1. `StoreSelector` (Main Component)
   - Props: None
   - Purpose: Renders store selection interface
   - Uses:
     - `useStore` for store management
     - `useAuth` for permissions

2. `accessibleStores` (Computed)
   - Purpose: Filters stores based on user role
   - Logic:
     - Admin: All stores
     - Manager: Managed stores
     - Employee: Assigned stores

**Components Used**:
- `StoreManager`: Store management interface
- `Building2`: Lucide icon
- Native select element

**Permission Logic**:
- Admin: Full access to all stores
- Manager: Access to managed stores
- Employee: Access to assigned stores
- Store management based on permissions

**UI Elements**:
- Store dropdown selector
- Store management button (conditional)
- Visual store icon
- Styled container

**Context Integration**:
- Store context for selection
- Auth context for permissions
- Profile data for access control

#### Dashboard Components

##### `OrdersTable.tsx`

**Purpose**: Displays a tabular view of items from the dashboard, showing order details and processing status.

**Key Features**:
- Responsive table layout
- Loading state handling
- Error state handling
- Alternating row colors
- Total items counter

**Functions**:

1. `OrdersTable` (Main Component)
   - Props: None
   - Purpose: Renders a table of order items from the dashboard
   - Uses `useDashboardItems` hook for data fetching

**Data Display**:
- Order ID
- Condition
- Notes
- Processing status
- Total items count

**States**:
- Loading: Shows loading message
- Error: Displays error message with details
- Success: Renders table with data

##### `SpreadsheetView.tsx`

**Purpose**: Provides an editable tabular view of all orders in the current store, with inline editing capabilities.

**Key Features**:
- Inline cell editing
- Real-time updates
- Loading states
- Store-specific data
- Status indicators
- Responsive table layout

**Functions**:

1. `SpreadsheetView` (Main Component)
   - Props: None
   - Purpose: Renders an editable spreadsheet view of orders
   - Uses:
     - `useData` for order management
     - `useStore` for store context

2. `handleCellEdit`
   - Purpose: Handles inline cell value updates
   - Parameters:
     - `id: string`: Order ID
     - `field: keyof RemovalOrder`: Field to update
     - `value: string`: New value
   - Features:
     - Type conversion for quantities
     - Optimistic updates
     - Error handling

**States**:
- `editingCell`: Tracks currently edited cell
- `isUpdating`: Loading state for updates
- `currentOrders`: Order data from context
- `isLoading`: Initial data loading state

**Editable Fields**:
- Order ID
- Tracking Number
- Carrier
- Request Date
- Shipment Date
- Shipped Quantity

**Conditional Rendering**:
- Store selection prompt
- Loading spinner
- Empty state message
- Error state handling

**UI Components**:
- Editable cells with inline forms
- Status badges with color coding
- Loading indicators
- Responsive table layout

##### `TrackingView.tsx`

**Purpose**: Main order processing interface that combines multiple components for tracking and processing removal orders.

**Key Features**:
- Order processing workflow
- Daily summary statistics
- Order scanning interface
- Work queue management
- Completed orders display
- Responsive layout

**Functions**:

1. `TrackingView` (Main Component)
   - Props: None
   - Purpose: Orchestrates order processing workflow
   - Uses:
     - `useData` for order management
     - `useStore` for store context

2. `handleOrderSelect`
   - Purpose: Updates selected order for processing
   - Parameters: `orderId: string`
   - Updates selected order state

3. `handleOrderComplete`
   - Purpose: Clears selection after order completion
   - Resets selected order state

**Component Composition**:
1. `DailySummary`
   - Shows daily processing statistics
   - Props: `orders`

2. `OrderScanner`
   - Order lookup interface
   - Props: `onOrderSelect`

3. `OrderDetails`
   - Selected order information
   - Props: `order`

4. `ProcessingForm`
   - Order processing interface
   - Props: `order`, `onComplete`

5. `WorkQueue`
   - Pending orders display
   - Props: `orders`, `onOrderSelect`, `selectedOrderId`

6. `CompletedOrders`
   - Processed orders display
   - Props: `orders`

**States**:
- `selectedOrderId`: Currently selected order
- `currentOrders`: Orders from context
- `isLoading`: Data loading state

**Conditional Rendering**:
- Store selection prompt
- Loading indicator
- Empty state message
- Selected order details
- Processing form

**Layout**:
- Responsive grid system
- Two-column layout on large screens
- Single column on mobile
- Component spacing management

#### Processing Components

##### `WorkQueue.tsx`

**Purpose**: Displays and manages a queue of removal orders that need to be processed, grouping them by tracking number and showing their processing status.

**Key Features**:
- Groups orders by tracking number
- Shows urgent orders with visual indicators
- Displays processing status and quantity mismatches
- Allows expanding/collapsing order details
- Shows progress of received vs expected units

**Functions**:

1. `WorkQueue` (Main Component)
   - Props: `orders`, `onOrderSelect`, `selectedOrderId`
   - Purpose: Main component that renders the work queue interface

2. `useMemo(groupedOrders)`
   - Purpose: Processes and groups orders by tracking number
   - Logic: 
     - Groups orders by tracking number
     - Calculates completion status
     - Sorts by urgency, processing status, and date
     - Handles quantity mismatch detection

3. `toggleExpand`
   - Purpose: Handles expanding/collapsing individual order groups
   - Parameters: `orderId: string`
   - Returns: void

**Interfaces**:

1. `GroupedOrder`
   - Represents a group of orders with the same tracking number
   - Contains tracking info, status, and array of items

2. `WorkQueueProps`
   - Component props interface
   - Defines the expected input properties for the WorkQueue component

##### `OrderScanner.tsx`

**Purpose**: Provides an interface for scanning or manually entering order numbers to process them.

**Key Features**:
- Input field for order number entry
- Integrated search icon
- Form submission handling
- Error handling for non-existent orders
- Auto-focus on input field

**Functions**:

1. `OrderScanner` (Main Component)
   - Props: `onOrderFound`
   - Purpose: Renders the order scanning interface

2. `handleSubmit`
   - Purpose: Processes form submission
   - Logic:
     - Prevents default form submission
     - Looks up order by ID
     - Calls onOrderFound callback if found
     - Shows error alert if not found
     - Clears input after successful submission

**Interfaces**:

1. `OrderScannerProps`
   - Contains callback function for when an order is found
   - Type: `{ onOrderFound: (orderId: string) => void }`

##### `CompletedOrders.tsx`

**Purpose**: Displays a list of completed removal orders with filtering, search, and detailed view capabilities.

**Key Features**:
- Search functionality for orders by ID or SKU
- Date filtering (Today/All Time)
- Expandable order details
- Quantity mismatch highlighting
- Shipment tracking information display
- Notes and item condition display

**Functions**:

1. `CompletedOrders` (Main Component)
   - Props: `orders`
   - Purpose: Renders the completed orders list with filtering and search

2. `useMemo(completedOrders)`
   - Purpose: Filters and sorts completed orders
   - Logic:
     - Filters by completion status
     - Applies search term filter
     - Applies date filter
     - Sorts by processing date

3. `toggleExpand`
   - Purpose: Handles expanding/collapsing order details
   - Parameters: `orderId: string`
   - Returns: void

4. `formatDate`
   - Purpose: Formats date strings for display
   - Parameters: `dateString: string | undefined`
   - Returns: Formatted date string or fallback

**Interfaces**:

1. `CompletedOrdersProps`
   - Contains array of RemovalOrder objects
   - Type: `{ orders: RemovalOrder[] }`

##### `ProcessingForm.tsx`

**Purpose**: Provides a form interface for processing removal orders, handling item conditions, quantities, and completion status.

**Key Features**:
- Dynamic item addition/removal
- Condition tracking per item
- Quantity validation
- Auto-save progress
- Completion validation
- Legacy data format support

**Functions**:

1. `ProcessingForm` (Main Component)
   - Props: `order`, `onComplete`
   - Purpose: Main form component for processing removal orders

2. `createInitialItem`
   - Purpose: Creates a new item with default values
   - Returns: OrderItem object with generated ID and default values

3. `handleItemChange`
   - Purpose: Updates item details and saves progress
   - Parameters: `index: number`, `updatedItem: OrderItem`
   - Logic:
     - Updates item in state
     - Adjusts received quantity based on condition
     - Saves partial progress

4. `handleAddItem`
   - Purpose: Adds new item to the order
   - Logic:
     - Validates against remaining quantity
     - Creates and adds new item
     - Updates order status

5. `handleRemoveItem`
   - Purpose: Removes item from the order
   - Parameters: `index: number`
   - Logic:
     - Removes item from state
     - Updates order status
     - Recalculates quantities

6. `handleComplete`
   - Purpose: Completes order processing
   - Logic:
     - Validates all items have conditions
     - Validates quantity matches expected
     - Calculates final quantities
     - Updates order status to completed

**Interfaces**:

1. `ProcessingFormProps`
   - Type: `{ order: RemovalOrder; onComplete: () => void }`
   - Contains order data and completion callback

2. `OrderItem`
   - Represents a single item in the order
   - Contains condition, quantity, and notes information

##### `OrderDetails.tsx`

**Purpose**: Displays detailed information about a specific removal order, including its status, quantities, and processing dates.

**Key Features**:
- Status badge display
- Order information grid
- SKU details display
- Quantity tracking
- Date formatting
- Processing status indicators

**Functions**:

1. `OrderDetails` (Main Component)
   - Props: `order`
   - Purpose: Renders detailed view of a removal order

2. `formatDate`
   - Purpose: Formats date strings for display
   - Parameters: `dateString: string`
   - Returns: Formatted date string or original string on error

3. `useMemo(stats)`
   - Purpose: Calculates order statistics
   - Logic:
     - Computes total expected and received quantities
     - Determines completion status
     - Checks for quantity discrepancies

4. `handleQuantityChange`
   - Purpose: Updates order quantity and status
   - Parameters: `newQuantity: number`
   - Logic:
     - Updates quantity with minimum of 0
     - Sets processing status

**Interfaces**:

1. `OrderDetailsProps`
   - Type: `{ order: RemovalOrder }`
   - Contains order data for display 

### Context

#### `DataContext.tsx`

**Purpose**: Provides global state management for orders, tracking entries, and statistics, with database integration.

**Key Features**:
- Store-specific data management
- Real-time statistics calculation
- Database synchronization
- Order processing workflow
- Error handling and recovery
- Loading state management

**Functions**:

1. `calculateStats`
   - Purpose: Calculates dashboard statistics from orders
   - Parameters: `orders: RemovalOrder[]`
   - Returns: `DashboardStats`
   - Computes:
     - Total orders
     - Pending orders
     - Completed orders
     - Total items
     - Received items

2. `DataProvider` (Main Component)
   - Purpose: Provides data context to the application
   - Manages:
     - Orders by store
     - Tracking entries by store
     - Statistics by store
     - Current spreadsheet
     - Loading state

3. `loadStoreData`
   - Purpose: Loads store data from database
   - Logic:
     - Fetches pullback items
     - Transforms to frontend format
     - Updates store statistics
     - Loads tracking entries
     - Handles errors with fallbacks

4. `processOrder`
   - Purpose: Updates order processing status
   - Parameters: `orderId: string, data: Partial<RemovalOrder>`
   - Logic:
     - Updates pullback items
     - Creates order records
     - Updates tracking information
     - Handles database transactions

**State Management**:
- `ordersByStore`: Store-specific order data
- `trackingEntriesByStore`: Store-specific tracking data
- `statsByStore`: Store-specific statistics
- `currentSpreadsheet`: Active spreadsheet reference
- `isLoading`: Loading state indicator

**Database Integration**:
- Supabase table interactions:
  - pullback_items
  - spreadsheets
  - orders
- Real-time updates
- Error handling
- Data transformation

**Context Hook**:
- `useData`: Custom hook for accessing data context
- Provides access to:
  - Current orders
  - Current statistics
  - Data manipulation functions
  - Loading state 

### Utils

#### `csvParser.ts`

**Purpose**: Provides utilities for parsing CSV files containing removal order data, with robust error handling and data validation.

**Key Features**:
- CSV line parsing with quote handling
- Header normalization
- Required field validation
- Date parsing
- Detailed error reporting
- Type conversion

**Functions**:

1. `parseDate`
   - Purpose: Converts date strings to ISO format
   - Parameters: `date_string: string`
   - Returns: ISO date string or original string on error
   - Handles timezone-aware dates

2. `parse_csv_line`
   - Purpose: Parses a single CSV line respecting quotes
   - Parameters: `line: string`
   - Returns: `string[]` of fields
   - Features:
     - Handles quoted fields
     - Preserves commas in quotes
     - Removes surrounding quotes
     - Unescapes double quotes

3. `normalize_header`
   - Purpose: Standardizes header field names
   - Parameters: `header: string`
   - Returns: Normalized header string
   - Transformations:
     - Lowercase conversion
     - Quote removal
     - Whitespace removal
     - Special character handling

4. `parse_removal_file`
   - Purpose: Main function for parsing removal order CSV files
   - Parameters: `file_content: string`
   - Returns: `RemovalOrder[]`
   - Features:
     - Header validation
     - Row validation
     - Data type conversion
     - Error handling per row
     - Default value handling

**Validation**:
- Required headers:
  - requestdate
  - orderid
  - shipmentdate
  - sku
  - fnsku
  - disposition
  - shippedquantity
  - carrier
  - trackingnumber
  - removalordertype

**Error Handling**:
- Empty file detection
- Missing header validation
- Row length validation
- SKU presence validation
- Date parsing errors
- Detailed error messages with row numbers 

#### `uniqueKey.ts`

**Purpose**: Provides utilities for generating unique identifiers and keys for orders and table rows.

**Key Features**:
- Cryptographically secure UUID generation
- Consistent key generation for orders
- Table row key generation

**Functions**:

1. `generateUniqueId`
   - Purpose: Generates a cryptographically secure UUID
   - Returns: UUID string
   - Uses: `crypto.randomUUID()`

2. `generateOrderKey`
   - Purpose: Creates a unique key for order identification
   - Parameters: `order: RemovalOrder`
   - Returns: Composite key string
   - Format: `${orderId}-${sku}-${fnsku}-${id}`
   - Fallback to new UUID if id is missing

3. `generateTableKey`
   - Purpose: Creates a unique key for table rows
   - Parameters: `order: RemovalOrder`
   - Returns: Composite key string
   - Format: Same as `generateOrderKey`
   - Used for React key props in tables

**Usage Contexts**:
- Order identification
- React component keys
- Database record identification
- Cache key generation 

### Database

#### `tables.sql`

**Purpose**: Defines the database schema for the application, including tables for stores, users, orders, and related data.

**Tables**:

1. `stores`
   - Purpose: Store business entity information
   - Key Fields:
     - `id`: UUID primary key
     - `name`: Store name
     - `code`: Unique store code
     - Timestamps and audit fields

2. `user_profiles`
   - Purpose: Extended user information and permissions
   - Key Fields:
     - `id`: UUID (references auth.users)
     - `email`: Unique email
     - `role`: admin/manager/employee
     - `permissions`: JSONB permissions object
     - `store_ids`: Array of accessible stores
     - `managed_stores`: Array of managed stores

3. `spreadsheets`
   - Purpose: Tracks uploaded file information
   - Key Fields:
     - `id`: UUID primary key
     - `name`, `file_name`: File identifiers
     - `row_count`: Number of records
     - `status`: processing/completed/failed
     - `type`: removal/tracking
     - Store and user references

4. `pullback_items`
   - Purpose: Individual removal order items
   - Key Fields:
     - `id`: UUID primary key
     - References to spreadsheet and store
     - Order details (dates, quantities, tracking)
     - Processing status and notes
     - Tracking information arrays

5. `orders`
   - Purpose: Processed order records
   - Key Fields:
     - `id`: UUID primary key
     - Order details and status
     - Quantities and tracking
     - Processing information
     - JSONB items field
     - Notes and timestamps

**Security Features**:
- Row Level Security (RLS) enabled on all tables
- Foreign key constraints
- Status field constraints
- Role-based access control

**Relationships**:
- Users -> Stores (many-to-many via arrays)
- Spreadsheets -> Store (many-to-one)
- PullbackItems -> Spreadsheet (many-to-one)
- PullbackItems -> Store (many-to-one)
- Orders -> Store (many-to-one)
- Orders -> Spreadsheet (many-to-one)

**Data Types**:
- UUIDs for primary keys
- Timestamps with timezone
- Text for strings
- Integer for quantities
- JSONB for flexible data
- Arrays for multiple values 

### Types

#### `supabase.ts`

**Purpose**: Defines TypeScript types for the Supabase database schema, ensuring type safety in database operations.

**Key Types**:

1. `Json`
   - Purpose: Represents valid JSON values
   - Types:
     - Primitive types (string, number, boolean, null)
     - Objects with Json values
     - Arrays of Json values

2. `Database.public.Tables`
   - Purpose: Type definitions for database tables
   - Tables:
     - stores
     - orders
     - items
     - user_profiles

**Table Types**:

1. `stores`
   - Row: Base table structure
     - `id`: UUID string
     - `name`: Store name
     - `code`: Unique store code
     - `created_at`: Timestamp
   - Insert: Required fields for creation
   - Update: Optional fields for modification

2. `orders`
   - Row: Order record structure
     - `id`: UUID string
     - `store_id`: Store reference
     - `tracking_number`: Optional tracking
     - `order_id`: Order identifier
     - `sku`, `shipped_quantity`, `status`
   - Insert/Update variants

3. `items`
   - Row: Individual item structure
     - `id`: UUID string
     - `order_id`: Order reference
     - `condition`: Item condition
     - `notes`: Optional notes
     - `processed_at`: Processing timestamp
   - Insert/Update variants

4. `user_profiles`
   - Row: User profile structure
     - `id`: UUID string
     - `email`: User email
     - `role`: Enum ('admin' | 'manager' | 'employee')
     - `permissions`: JSON permissions object
     - `store_ids`: Accessible stores array
     - `managed_stores`: Managed stores array
   - Insert/Update variants

**Type Features**:
- Strict null checking
- Optional fields in updates
- Enum-like role restrictions
- Timestamp string formatting
- Array type support
- JSON type support

**Usage**:
- Database query type safety
- Insert/Update operation validation
- Response type inference
- Foreign key relationship typing 

### Library

#### `setupAdmin.ts`

**Purpose**: Handles initial setup of admin user and store, including role-based permissions management.

**Key Features**:
- Role-based permission assignment
- Admin store creation
- Admin user setup
- Default permission templates
- Database integration

**Functions**:

1. `getDefaultPermissions`
   - Purpose: Generates default permissions based on user role
   - Parameters: `role: UserRole`
   - Returns: `UserPermissions`
   - Permission sets:
     - Admin: Full access
     - Manager: Limited management
     - Employee: Basic access

2. `createAdminStore`
   - Purpose: Creates or retrieves admin store
   - Returns: Store object
   - Features:
     - Checks for existing store
     - Creates with 'ADMIN' code
     - Error handling
     - Database integration

3. `setupAdminUser`
   - Purpose: Creates or retrieves admin user
   - Features:
     - Admin store creation
     - User authentication
     - Profile creation
     - Permission assignment
     - Error handling

**Permission Structure**:
- `viewDashboard`: Dashboard access
- `viewSpreadsheet`: Spreadsheet access
- `manageStores`: Store management
- `manageUsers`: User management
- `processOrders`: Order processing
- `editAllStores`: Global store edit
- `viewAllStores`: Global store view

**Role Hierarchy**:
1. Admin
   - All permissions enabled
   - Global store access
   - User management

2. Manager
   - Limited store management
   - Order processing
   - Dashboard and spreadsheet access

3. Employee
   - Basic dashboard access
   - Order processing
   - Limited view permissions

**Security Features**:
- Secure password handling
- Role validation
- Permission enforcement
- Store access control
- Error handling and logging 

#### `supabase.ts`

**Purpose**: Configures and initializes the Supabase client for database and authentication operations.

**Key Features**:
- Environment-based configuration
- Authentication setup
- Session persistence
- Token management
- Error handling

**Configuration**:
1. Environment Variables
   - `VITE_SUPABASE_URL`: Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Anonymous API key

2. Client Options
   - `persistSession`: Enables session persistence
   - `autoRefreshToken`: Automatic token refresh

**Security Features**:
- Environment variable validation
- Secure key handling
- Session management
- Token refresh automation

**Usage Contexts**:
- Database operations
- Authentication flows
- Real-time subscriptions
- File storage
- User management

**Error Handling**:
- Environment variable validation
- Initialization error catching
- Runtime error management 