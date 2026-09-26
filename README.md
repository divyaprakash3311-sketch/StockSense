# 📦 StockSense — Next-Gen Inventory Management System

**StockSense** is a modular, real-time Inventory Management System (IMS) built to digitize and centralize stock operations for modern businesses. By replacing legacy paper registers and manual spreadsheet tracking, StockSense delivers complete visibility across multi-warehouse logistics, incoming receipts, internal stock transfers, and outgoing deliveries.

---

## 🚀 Key Features

### 📊 1. Real-Time Dashboard & Operations KPIs
* **At-a-Glance Metrics:** Track *Total Stock*, *Low Stock / Out of Stock Items*, *Pending Receipts*, *Pending Deliveries*, and *Internal Transfers*.
* **Dynamic Filtering:** Query operational activity by Document Type (*Receipts, Delivery, Internal, Adjustments*), Status (*Draft, Waiting, Ready, Done, Canceled*), Warehouse, or Product Category.

### 📦 2. Comprehensive Product Management
* Catalog items with **SKU/Code**, **Category**, **Unit of Measure (UoM)**, and **Reordering Rules**.
* View location-specific stock availability across all active warehouses.
* Automatic reorder alerts when inventory dips below minimum defined safety thresholds.

### 🔄 3. Ledger-Driven Inventory Operations
* **Receipts (Incoming Stock):** Process vendor deliveries. Upon validation, global and location stock automatically increments.
* **Delivery Orders (Outgoing Stock):** Streamline picking and packing for customer shipments. Validation automatically updates stock levels.
* **Internal Transfers:** Log movement across distinct physical zones (e.g., *Main Store → Production Floor* or *Rack A → Rack B*) while maintaining accurate total inventory count.
* **Stock Adjustments:** Easily reconcile physical stock counts against system records with audit logging.
* **Stock Move History:** Complete audit trail tracking every unit movement, timestamp, user action, and document context.

---

## 🧱 Inventory Flow Architecture

StockSense processes inventory using an immutable transaction-ledger approach:
