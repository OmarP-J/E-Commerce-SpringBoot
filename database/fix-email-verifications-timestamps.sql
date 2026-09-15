-- ---------------------------------------------------------------------------
-- CORRECCIÓN URGENTE — ejecutar si ya creaste la tabla email_verifications.
--
-- Se creó con las columnas de fecha como DATETIME2, pero Hibernate mapea
-- Instant a DATETIMEOFFSET en SQL Server (todas las demás columnas de fecha de
-- esta base ya son DATETIMEOFFSET(7)). Con spring.jpa.hibernate.ddl-auto=validate
-- ese desajuste impide que la aplicación ARRANQUE — no falla solo el registro,
-- se cae entera.
--
-- La tabla está vacía, así que el cambio es inmediato y sin riesgo.
-- ---------------------------------------------------------------------------

ALTER TABLE email_verifications ALTER COLUMN expires_at DATETIMEOFFSET(7) NOT NULL;
GO

ALTER TABLE email_verifications ALTER COLUMN sent_at DATETIMEOFFSET(7) NOT NULL;
GO

-- Comprobación: las dos filas deben decir datetimeoffset.
SELECT c.name AS columna, t.name AS tipo
FROM sys.columns c
JOIN sys.types t ON t.user_type_id = c.user_type_id
WHERE c.object_id = OBJECT_ID('email_verifications')
  AND c.name IN ('expires_at', 'sent_at');
GO
