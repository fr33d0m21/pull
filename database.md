# Database Structure and Security

## Overview

This application uses Supabase as the database backend (PostgreSQL). The database supports a multi-tenant architecture where users belong to one or more stores, with varying roles and access levels.

## Core Tables

### user_profiles
- Primary key: id (uuid, references auth.users)
- Fields:
    - email (text, unique): The user’s email address for login.
    - role (text): The user’s role in the application ('admin', 'manager', or 'employee').
    - permissions (jsonb): JSON object to store any user-specific permissions.
    - store_ids (uuid[]): List of UUIDs referencing store memberships.
    - managed_stores (uuid[]): List of UUIDs referencing stores that the user manages.
    - created_by (uuid, references auth.users): The user who created this profile.
    - created_at (timestamp): Time when this profile was created.
    - updated_at (timestamp): Last time when this profile was updated.

### stores
- Primary key: id (uuid)
- Fields:
    - name (text): The store name.
    - code (text, unique): A unique code to identify the store.
    - created_by (uuid, references auth.users): The user who created the store.
    - created_at (timestamp): Timestamp of store creation.
    - updated_at (timestamp): Timestamp when the store was last updated.

### spreadsheets
- Primary key: id (uuid)
- Fields:
    - name (text): Spreadsheet file name.
    - store_id (uuid, references stores): The store this spreadsheet is associated with.
    - uploaded_by (uuid, references auth.users): The user who uploaded this spreadsheet.
    - type (text): Either 'removal' or 'tracking'.
    - created_at (timestamp): Timestamp when the spreadsheet was uploaded.
    - updated_at (timestamp): Timestamp when the spreadsheet was last updated.

### pullback_items
- Primary key: id (uuid)
- Fields:
    - spreadsheet_id (uuid, references spreadsheets): Links this item to a particular spreadsheet.
    - store_id (uuid, references stores): The store belonging to this item.
    - request_date (timestamp with time zone): The date of a removal request or an order creation date.
    - order_id (text): The order id for this item.
    - shipment_date (timestamp with time zone): The date the shipment was sent.
    - sku (text): Stock Keeping Unit of the item.
    - fnsku (text): The Fulfillment Network SKU.
    - disposition (text): Item’s disposition status.
    - shipped_quantity (integer): Quantity of items shipped.
    - requested_quantity (integer): Quantity of items requested for shipment.
    - actual_return_qty (integer): Actual number of items returned.
    - carrier (text): The shipping carrier used.
    - tracking_number (text): Tracking number for the shipment.
    - removal_order_type (text): Type of removal order.
    - processing_status (text): Can be 'new', 'processing', 'completed', or 'cancelled'.
    - notes (text): Any notes related to the item.
    - tracking_numbers (text[]): List of tracking numbers for multiple shipments.
    - carriers (text[]): List of carriers for multiple shipments.
    - created_by (uuid, references auth.users): The user who added this data.
    - created_at (timestamp with time zone): When the item was created.
    - updated_at (timestamp with time zone): When the item was updated.

### orders
- Primary key: id (uuid)
- Fields:
    - store_id (uuid, references stores): The store this order belongs to.
    - tracking_number (text): The primary tracking number for the order.
    - order_id (text, not null): The order’s ID.
    - sku (text): SKU for items within this order.
    - shipped_quantity (integer): Quantity shipped in this order.
    - status (text): Legacy status field (optional use).
    - created_at (timestamp with time zone): Timestamp when the record was created.
    - processing_status (text): 'new', 'processing', 'completed', or 'cancelled'.
    - processing_date (timestamp with time zone): Timestamp when processing occurred.
    - actual_quantity (integer): Actual processed (or received) quantity.
    - requested_quantity (integer): The quantity requested for shipment or removal.
    - tracking_numbers (text[]): Additional tracking numbers if split shipments occur.
    - removal_type (text): Type of removal (if relevant).
    - spreadsheet_id (uuid, references spreadsheets): Spreadsheet association.
    - request_date (timestamp with time zone): Date the order was requested.
    - shipment_date (timestamp with time zone): Date the order was shipped.
    - source (text): Source of this order (e.g. “Amazon”).
    - fnsku (text): Fulfillment Network SKU if applicable.
    - disposition (text): The item’s condition or disposition.
    - carrier (text): Carrier used for this order.
    - items (jsonb): JSON object for nested items if needed.
    - notes (text): Notes about the order.
    - updated_at (timestamp with time zone): Timestamp when the record was last updated.

## Security Implementation

### Row Level Security (RLS)
RLS is enabled on all tables with role-based access control. Some specifics:

- Admin users have full access to insert, select, update, and delete.  
- Manager users have store-level, role-based restricted access.  
- Employees can access only the data relevant to stores they are associated with.  

For full details, see the policy definitions in policies.sql.

### Authentication
- Uses Supabase Auth for email/password and Google login.  
- JWT tokens include user role (admin, manager, or employee) and store access details.

### Important Notes
- All timestamps are stored in UTC.  
- Tables reference each other via foreign keys to maintain data integrity.  
- RLS ensures that each user only sees or modifies the data relevant to their permissions.