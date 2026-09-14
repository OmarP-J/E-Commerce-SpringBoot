-- ---------------------------------------------------------------------------
-- Verificación de correo al registrarse.
--
-- EJECUTAR ANTES DE DESPLEGAR el backend con estos cambios: la aplicación
-- arranca con spring.jpa.hibernate.ddl-auto=validate, así que si estas dos
-- cosas no existen en la base, el servicio no levanta.
--
-- Se ejecuta una sola vez, sobre la base `ecommerce` en Azure SQL.
-- ---------------------------------------------------------------------------

-- 1. Marca de verificación en las cuentas.
--    El DEFAULT 1 es importante: deja verificadas todas las cuentas que ya
--    existen, incluida la del administrador. Solo los registros nuevos nacen
--    sin verificar.
ALTER TABLE shop_users
    ADD email_verified BIT NOT NULL
        CONSTRAINT df_shop_users_email_verified DEFAULT 1;
GO

-- 2. Códigos pendientes. Una fila por usuario como mucho.
--    VARCHAR y no NVARCHAR a propósito: el resto de las columnas de texto de
--    esta base son VARCHAR y la aplicación corre con
--    hibernate.use_nationalized_character_data=false.
CREATE TABLE email_verifications (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES shop_users(id) ON DELETE CASCADE,
    code_hash VARCHAR(100) NOT NULL,
    expires_at DATETIME2 NOT NULL,
    sent_at DATETIME2 NOT NULL,
    attempts INT NOT NULL DEFAULT 0
);
GO
