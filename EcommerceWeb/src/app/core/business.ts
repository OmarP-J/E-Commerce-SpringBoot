/**
 * Datos del responsable del sitio que aparecen en el pie de página y en las
 * páginas legales. Es el único lugar donde hay que escribirlos.
 *
 * COMPLÉTALOS ANTES DE PUBLICAR. Mientras un campo siga vacío, las páginas
 * muestran "Pendiente de completar" en su lugar: es feo a propósito, para que
 * nadie publique políticas sin un responsable identificable ni un correo al
 * que dirigir las solicitudes de privacidad. No se inventan datos aquí.
 */
export const BUSINESS = {
  /** Nombre comercial que ven los clientes. */
  tradeName: "Esencial",
  /** Razón social de la empresa o nombre completo de la persona responsable. */
  legalName: "",
  /** RNC de la empresa o cédula de la persona física responsable. */
  taxId: "",
  /** Dirección física de contacto. */
  address: "",
  /** Correo para consultas, reclamos y solicitudes de privacidad. */
  email: "",
  /** Teléfono de contacto. Opcional: si queda vacío no se muestra. */
  phone: "",
  country: "República Dominicana",
};

/**
 * Proveedores que tratan datos por cuenta de la tienda. Ajusta la lista si
 * cambias de hosting, de base de datos o de proveedor de correo: la política
 * de privacidad la muestra tal cual.
 */
export const DATA_PROCESSORS: { name: string; purpose: string }[] = [
  { name: "Vercel Inc.", purpose: "Aloja la página web y reenvía las solicitudes al servidor." },
  { name: "Render Services, Inc.", purpose: "Aloja el servidor de la aplicación." },
  { name: "Microsoft (Azure SQL Database)", purpose: "Almacena la base de datos." },
  {
    name: "Brevo (Sendinblue SAS)",
    purpose: "Envía los correos del servicio: códigos de verificación y de recuperación, y avisos de tus pedidos.",
  },
  { name: "PayPal", purpose: "Procesa el pago solo si eliges PayPal (hoy en modo de prueba)." },
  { name: "Stripe", purpose: "Procesa el pago solo si eliges tarjeta (hoy en modo de prueba)." },
];

/** Fecha de la última revisión de los textos legales. Cámbiala al editarlos. */
export const LEGAL_LAST_UPDATED = "2 de octubre de 2026";

export const PENDING_LABEL = "Pendiente de completar";
