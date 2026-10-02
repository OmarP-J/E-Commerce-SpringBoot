-- ---------------------------------------------------------------------------
-- Reseñas verificadas, seguimiento de pedidos y recuperación de contraseña.
--
-- EJECUTAR ANTES DE DESPLEGAR el backend con estos cambios: la aplicación
-- arranca con spring.jpa.hibernate.ddl-auto=validate, así que si falta alguna
-- de estas columnas o tablas, el servicio no levanta.
--
-- Se ejecuta una sola vez, sobre la base `ecommerce` en Azure SQL. Solo añade:
-- no modifica ni borra datos existentes.
-- ---------------------------------------------------------------------------

-- 1. Fecha en que cada pedido llegó a cada estado (línea de tiempo del
--    cliente). Nulas en los pedidos que ya existían.
ALTER TABLE shop_orders ADD
    processing_at DATETIMEOFFSET(7) NULL,
    shipped_at DATETIMEOFFSET(7) NULL,
    delivered_at DATETIMEOFFSET(7) NULL,
    cancelled_at DATETIMEOFFSET(7) NULL;
GO

-- 2. Reseñas. Una por cliente y producto; solo quien recibió el producto puede
--    escribirla (lo comprueba la aplicación). NVARCHAR para conservar
--    cualquier carácter que escriba el cliente.
CREATE TABLE product_reviews (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    author_id BIGINT NOT NULL REFERENCES shop_users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(1000) NULL,
    hidden BIT NOT NULL DEFAULT 0,
    hidden_reason NVARCHAR(300) NULL,
    created_at DATETIMEOFFSET(7) NOT NULL,
    updated_at DATETIMEOFFSET(7) NOT NULL,
    CONSTRAINT uq_review_product_author UNIQUE (product_id, author_id)
);
CREATE INDEX ix_reviews_product ON product_reviews(product_id, hidden, created_at DESC);
GO

-- 3. Códigos para recuperar la contraseña. Una fila por usuario como mucho.
CREATE TABLE password_resets (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES shop_users(id) ON DELETE CASCADE,
    code_hash VARCHAR(100) NOT NULL,
    expires_at DATETIMEOFFSET(7) NOT NULL,
    sent_at DATETIMEOFFSET(7) NOT NULL,
    attempts INT NOT NULL DEFAULT 0
);
GO
