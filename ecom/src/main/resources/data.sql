-- ============================================================
--  DATOS DE PRUEBA - ecommerceDB (SQL Server)
--  Ejecutar en SQL Server Management Studio (SSMS) o
--  con sqlcmd contra la base de datos ecommerceDB
-- ============================================================

USE ecommerceDB;
GO

-- ============================================================
-- 1. CATEGORÍAS
-- ============================================================
-- Limpiar primero para evitar duplicados
DELETE FROM product;
DELETE FROM category;
DELETE FROM coupons;
-- Nota: los usuarios de tipo CUSTOMER y su order se pueden borrar
-- manualmente; el admin lo recrea el @PostConstruct automáticamente.
DELETE FROM orders WHERE user_id IN (SELECT id FROM users WHERE role = 'CUSTOMER');
DELETE FROM users  WHERE role = 'CUSTOMER';
GO

SET IDENTITY_INSERT category ON;
INSERT INTO category (id, name, description) VALUES
(1, 'Electrónica',    'Smartphones, laptops, tablets, accesorios y gadgets tecnológicos.'),
(2, 'Ropa',           'Moda para hombres, mujeres y niños de todas las tallas.'),
(3, 'Hogar y Jardín', 'Decoración, muebles, herramientas y artículos de jardín.'),
(4, 'Deportes',       'Equipamiento deportivo, ropa técnica y accesorios fitness.'),
(5, 'Libros',         'Novelas, libros de texto, cómics y publicaciones digitales.');
SET IDENTITY_INSERT category OFF;
GO

-- ============================================================
-- 2. PRODUCTOS  (img = NULL; se carga por la API)
-- ============================================================
SET IDENTITY_INSERT product ON;
INSERT INTO product (id, name, price, description, img, category_id) VALUES
-- Electrónica
(1,  'iPhone 15 Pro',             1299, 'Smartphone Apple con chip A17 Pro, pantalla Super Retina XDR de 6.1" y sistema de cámara Pro de 48 MP.', NULL, 1),
(2,  'Samsung Galaxy S24',        999,  'Android flagship con IA integrada, pantalla AMOLED de 6.2" y batería de 4000 mAh.', NULL, 1),
(3,  'MacBook Air M3',            1399, 'Laptop ultradelgada con chip M3, 16 GB RAM y hasta 18 horas de batería.', NULL, 1),
(4,  'Sony WH-1000XM5',          349,  'Auriculares inalámbricos con cancelación de ruido líder del sector y hasta 30 horas de autonomía.', NULL, 1),
(5,  'iPad Pro 11" M4',           999,  'Tablet profesional con pantalla Liquid Retina, Apple Pencil Pro compatible y chip M4.', NULL, 1),
-- Ropa
(6,  'Camiseta Básica Blanca',    25,   'Camiseta 100 % algodón peinado, corte slim fit, disponible en tallas S–XXL.', NULL, 2),
(7,  'Jeans Slim Azul Clásico',   59,   'Pantalón vaquero slim fit de denim elástico, corte moderno y comodidad todo el día.', NULL, 2),
(8,  'Sudadera Hoodie Gris',      79,   'Sudadera con capucha en algodón afelpado, bolsillo tipo canguro y cordones ajustables.', NULL, 2),
(9,  'Vestido Floral Verano',     49,   'Vestido midi de gasa con estampado floral, escote V y tiras ajustables.', NULL, 2),
(10, 'Chaqueta Cuero Marrón',     199,  'Chaqueta de cuero genuino con forro interior, bolsillos con cremallera y acabado envejecido.', NULL, 2),
-- Hogar y Jardín
(11, 'Sofá Esquinero Gris',       799,  'Sofá en L tapizado en tela antimanchas, chaiselongue desmontable y patas de madera.', NULL, 3),
(12, 'Robot Aspirador Inteligente',349, 'Aspirador robótico con mapeo láser, control por app y vaciado automático del depósito.', NULL, 3),
(13, 'Cafetera Espresso Automática',229,'Cafetera superautomática con molinillo integrado, vaporizador y pantalla táctil.', NULL, 3),
(14, 'Lámpara de Pie LED',        89,   'Lámpara de pie con regulación de intensidad, 3 temperaturas de color y brazo articulado.', NULL, 3),
(15, 'Jardín: Kit Herramientas',  45,   'Set de 5 herramientas de jardín en acero inoxidable con mangos ergonómicos antideslizantes.', NULL, 3),
-- Deportes
(16, 'Zapatillas Running Pro',    129,  'Zapatillas de running con suela de foam reactivo, upper de malla transpirable y drop 8 mm.', NULL, 4),
(17, 'Bicicleta Estática Smart',  499,  'Bici de spinning conectada, pantalla 10", resistencia magnética y clases en vivo.', NULL, 4),
(18, 'Mancuernas Ajustables 20kg',149,  'Set de mancuernas con ajuste rápido de 2 a 20 kg, discos de nylon y soporte incluido.', NULL, 4),
(19, 'Colchoneta Yoga Antidesliz', 35,  'Mat de yoga de 6 mm de grosor con textura antideslizante por ambas caras y bolsa de transporte.', NULL, 4),
(20, 'Cuerda de Saltar Digital',  29,   'Comba con contador de saltos, temporizador LCD y mangos ergonómicos de silicona.', NULL, 4),
-- Libros
(21, 'Cien Años de Soledad',      18,   'Obra maestra de Gabriel García Márquez. Edición conmemorativa de tapa dura con prólogo ilustrado.', NULL, 5),
(22, 'El Hobbit',                 15,   'Novela fantástica de J.R.R. Tolkien. Edición de bolsillo con mapa de la Tierra Media.', NULL, 5),
(23, 'Atomic Habits',             19,   'James Clear explica cómo pequeños cambios de hábito generan resultados extraordinarios.', NULL, 5),
(24, 'Clean Code',                45,   'Robert C. Martin: guía definitiva para escribir código legible, mantenible y eficiente.', NULL, 5),
(25, 'El Poder del Ahora',        14,   'Eckhart Tolle guía al lector hacia la consciencia plena y la paz interior.', NULL, 5);
SET IDENTITY_INSERT product OFF;
GO

-- ============================================================
-- 3. USUARIOS CLIENTES
--    Contraseñas hasheadas con BCrypt (strength=10):
--    cliente1 → "password123"
--    cliente2 → "mipassword"
--    cliente3 → "secret456"
-- ============================================================
SET IDENTITY_INSERT users ON;
INSERT INTO users (id, email, password, name, role, image) VALUES
(2, 'cliente1@test.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOKMJ1Y7Xm9Q2K6P9VNsRf8G8z3lQ5kCe', 'Carlos López',   'CUSTOMER', NULL),
(3, 'cliente2@test.com', '$2a$10$N6bI2OPxqzM0.jQMpEiWKOqeaVxkq.rCqLjBH4KTaG9wRuQl8ZBqS', 'María González', 'CUSTOMER', NULL),
(4, 'cliente3@test.com', '$2a$10$Ub3rQp1Sz7fG4X0xKy2mve8v2jLcWEBvxYhQ1gqOm3sJ7tNcJt5Dm', 'Pedro Martínez', 'CUSTOMER', NULL);
SET IDENTITY_INSERT users OFF;
GO

-- Crear carrito/orden pendiente para cada cliente (igual que hace AuthServiceImpl)
INSERT INTO orders (amount, total_amount, discount, order_status, user_id) VALUES
(0, 0, 0, 'Pending', 2),
(0, 0, 0, 'Pending', 3),
(0, 0, 0, 'Pending', 4);
GO

-- ============================================================
-- 4. CUPONES DE DESCUENTO
-- ============================================================
SET IDENTITY_INSERT coupons ON;
INSERT INTO coupons (id, name, code, discount, expiration_date) VALUES
(1, 'Bienvenida 10%',   'WELCOME10',  10,  '2026-12-31'),
(2, 'Verano 20%',       'SUMMER20',   20,  '2026-08-31'),
(3, 'Black Friday 30%', 'BLACK30',    30,  '2026-11-30'),
(4, 'Flash 15%',        'FLASH15',    15,  '2026-07-15'),
(5, 'VIP 25%',          'VIP25',      25,  '2026-12-31');
SET IDENTITY_INSERT coupons OFF;
GO

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT 'Categorias' AS tabla, COUNT(*) AS total FROM category  UNION ALL
SELECT 'Productos',           COUNT(*)            FROM product  UNION ALL
SELECT 'Usuarios',            COUNT(*)            FROM users    UNION ALL
SELECT 'Cupones',             COUNT(*)            FROM coupons;
GO
