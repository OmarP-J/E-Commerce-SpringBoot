/* Run once in an empty SQL Server database before starting with SPRING_PROFILES_ACTIVE=prod. */
CREATE TABLE categories (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(80) NOT NULL UNIQUE,
    description NVARCHAR(500) NOT NULL
);

CREATE TABLE coupons (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(30) NOT NULL UNIQUE,
    discount_percent INT NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
    expires_on DATE NOT NULL,
    active BIT NOT NULL DEFAULT 1
);

CREATE TABLE shop_users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(254) NOT NULL UNIQUE,
    name NVARCHAR(80) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(32) NOT NULL CHECK (role IN ('CUSTOMER', 'ADMIN', 'INVENTORY_MANAGER', 'CUSTOMER_SUPPORT')),
    cart_coupon_id BIGINT NULL REFERENCES coupons(id)
);

CREATE TABLE products (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(120) NOT NULL,
    description NVARCHAR(2000) NOT NULL,
    price DECIMAL(12,2) NOT NULL CHECK (price > 0),
    cost DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
    stock INT NOT NULL CHECK (stock >= 0),
    active BIT NOT NULL DEFAULT 1,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    image VARBINARY(MAX) NULL,
    image_type NVARCHAR(40) NULL,
    version BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX ix_products_category ON products(category_id);
CREATE INDEX ix_products_name ON products(name);

CREATE TABLE wishlist (
    user_id BIGINT NOT NULL REFERENCES shop_users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    PRIMARY KEY (user_id, product_id)
);

CREATE TABLE cart_items (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES shop_users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity BETWEEN 1 AND 99),
    CONSTRAINT uq_cart_user_product UNIQUE (user_id, product_id)
);

CREATE TABLE shop_orders (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES shop_users(id),
    request_key NVARCHAR(36) NOT NULL,
    created_at DATETIME2 NOT NULL,
    customer_name NVARCHAR(80) NOT NULL,
    address NVARCHAR(300) NOT NULL,
    phone NVARCHAR(30) NOT NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED')),
    payment_status NVARCHAR(32) NOT NULL,
    subtotal DECIMAL(16,2) NOT NULL,
    discount DECIMAL(16,2) NOT NULL,
    total DECIMAL(16,2) NOT NULL,
    coupon_code NVARCHAR(30) NULL,
    CONSTRAINT uq_order_request UNIQUE (user_id, request_key)
);
CREATE INDEX ix_orders_user_created ON shop_orders(user_id, created_at DESC);

CREATE TABLE order_lines (
    order_id BIGINT NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
    line_number INT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name NVARCHAR(120) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    quantity INT NOT NULL,
    PRIMARY KEY (order_id, line_number)
);

CREATE TABLE delivery_addresses (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES shop_users(id) ON DELETE CASCADE,
    label NVARCHAR(60) NOT NULL,
    recipient_name NVARCHAR(80) NOT NULL,
    address_line NVARCHAR(300) NOT NULL,
    city NVARCHAR(100) NOT NULL,
    phone NVARCHAR(30) NOT NULL,
    default_address BIT NOT NULL DEFAULT 0
);
CREATE INDEX ix_addresses_user ON delivery_addresses(user_id);

CREATE TABLE inventory_movements (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    performed_by_id BIGINT NOT NULL REFERENCES shop_users(id),
    type NVARCHAR(20) NOT NULL CHECK (type IN ('ENTRY', 'EXIT', 'ADJUSTMENT')),
    quantity_delta INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL CHECK (new_stock >= 0),
    note NVARCHAR(300) NOT NULL,
    created_at DATETIME2 NOT NULL
);
CREATE INDEX ix_inventory_created ON inventory_movements(created_at DESC);

CREATE TABLE support_cases (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES shop_orders(id),
    customer_id BIGINT NOT NULL REFERENCES shop_users(id),
    handled_by_id BIGINT NULL REFERENCES shop_users(id),
    type NVARCHAR(20) NOT NULL CHECK (type IN ('RETURN', 'EXCHANGE', 'REFUND', 'COMPLAINT')),
    status NVARCHAR(20) NOT NULL CHECK (status IN ('OPEN', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED')),
    reason NVARCHAR(1000) NOT NULL,
    resolution NVARCHAR(1000) NULL,
    refund_amount DECIMAL(16,2) NOT NULL DEFAULT 0 CHECK (refund_amount >= 0),
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
);
CREATE INDEX ix_support_status_updated ON support_cases(status, updated_at DESC);

CREATE TABLE store_settings (
    id BIGINT PRIMARY KEY CHECK (id = 1),
    store_name NVARCHAR(80) NOT NULL,
    low_stock_threshold INT NOT NULL CHECK (low_stock_threshold BETWEEN 0 AND 1000),
    support_email NVARCHAR(254) NOT NULL
);
INSERT INTO store_settings (id, store_name, low_stock_threshold, support_email)
VALUES (1, N'Esencial', 5, N'soporte@demo.local');
