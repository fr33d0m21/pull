# Amazon Pullback Management System Logic Documentation

## Data Structure & Relationships

### Core Entities
1. Tracking Numbers
   - Primary grouping mechanism
   - One tracking number can have multiple SKUs
   

2. SKUs
   - Linked to tracking numbers
   - Contains expected quantity (shipped_quantity)
   - Each SKU can have multiple items

3. Items (shipped_quantity)
   - Individual units are the only thing processed
   - Belong to a specific SKU
   - Have condition status (Sellable/Unsellable/Missing)

## Data Flow & Processing Logic

### 1. Data Import Process
```
CSV Import → Parse Headers → Validate Data → Group by Tracking Number → Store Data
```

Key Validations:
- Required headers present
- Date formats valid
- Numeric fields contain valid numbers
- Required fields not empty

### 2. Working Queue Logic

#### Grouping Algorithm
```typescript
orders.reduce((groups, order) => {
  const key = order.trackingNumber;
  if (!groups[key]) {
    groups[key] = {
      orders: [],
      totalItems: 0
    };
  }
  groups[key].orders.push(order);
  groups[key].totalItems += order.shippedQuantity;
  return groups;
}, {});
```

#### Status Determination
- New: No items processed
- Processing: Some items processed
- Completed: All items processed
- Missing: Items marked as missing

### 3. Analytics Calculations

#### Working Queue Count
- Count of unique tracking numbers with unprocessed items
- Formula: `trackingGroups.filter(group => !allItemsProcessed(group)).length`

#### Expected Items Count
- Sum of all shipped quantities across all SKUs
- Formula: `sum(all_skus.shipped_quantity)`

#### Completed Orders
- Count of tracking numbers where all SKUs are processed
- Formula: `trackingGroups.filter(group => allItemsProcessed(group)).length`

#### Missing Items
- Count of items marked as "Missing"
- Formula: `sum(items.filter(item => item.condition === 'Missing').length)`

## Processing Workflows

### 1. Item Processing Flow
```
Select Tracking Number → View SKUs → Process Expected Items → Mark Conditions → Complete Processing
```

Validation Rules:
1. All items must have a condition set
2. Total processed items must match expected quantity
3. Notes are optional but stored if provided

### 2. Completion Logic
```typescript
canComplete = (
  receivedItems.length === expectedQuantity &&
  allItemsHaveCondition &&
  !hasProcessingErrors
);
```

### 3. Status Updates
- Updates happen in real-time
- Status cascades from items → SKUs → tracking numbers
- All items must be processed to complete a tracking number

## Data Grouping & Display Logic

### 1. Spreadsheet View
- Grouped by tracking number
- Sortable by all columns
- Filterable by status and date ranges
- Shows individual SKU details

### 2. Working Queue View
- Primary grouping by tracking number
- Secondary grouping by SKU
- Shows processing status and progress
- Highlights discrepancies and urgent items

### 3. Analytics View
- Aggregates data across all groups
- Time-based filtering (day/week/month/custom)
- Real-time updates as processing occurs

## State Management

### 1. Store Context
- Manages store selection and configuration
- Handles store-specific settings
- Controls data visibility per store

### 2. Data Context
- Manages all order and tracking data
- Handles data updates and processing
- Maintains processing state and history

## Optimization Strategies

### 1. Memoization
- Heavy calculations are memoized
- Group calculations cached until data changes
- Analytics recalculated only when needed

### 2. Batch Processing
- Updates batched for performance
- State updates optimized to minimize rerenders
- Heavy operations deferred when possible

## Error Handling

### 1. Data Validation
- Input validation on all fields
- Quantity matching validation
- Status transition validation

### 2. Process Validation
- Ensures complete data before processing
- Validates all required fields
- Prevents invalid state transitions

## Performance Considerations

### 1. Large Dataset Handling
- Pagination for large lists
- Virtual scrolling for long tables
- Optimized grouping algorithms

### 2. Real-time Updates
- Efficient state updates
- Minimized rerender cycles
- Optimized component structure

## Future Optimizations

1. Data Structure
   - Implement normalized data structure
   - Add indexing for faster lookups
   - Optimize group calculations

2. Processing Flow
   - Add batch processing capabilities
   - Implement undo/redo functionality
   - Add automated validation rules

3. Analytics
   - Add caching for analytics calculations
   - Implement progressive loading
   - Add advanced filtering capabilities