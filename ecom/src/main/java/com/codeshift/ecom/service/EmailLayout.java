package com.codeshift.ecom.service;

/**
 * Marco común de los correos: mismos colores que la tienda y estilos en línea,
 * porque la mayoría de clientes de correo ignoran las hojas de estilo.
 */
final class EmailLayout {
    private EmailLayout() {
    }

    /** {@code bodyHtml} debe venir ya escapado. */
    static String page(String brand, String heading, String bodyHtml, String footnote) {
        return """
                <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#fffef9;padding:32px 16px">
                  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #d9e0da;border-radius:20px;padding:32px">
                    <p style="margin:0 0 4px;color:#175c3b;font-size:12px;font-weight:700;letter-spacing:.14em">%s</p>
                    <h1 style="margin:0 0 16px;font-size:24px;color:#14221b">%s</h1>
                    %s
                    <p style="margin:24px 0 0;color:#5a665f;font-size:13px;line-height:1.6">%s</p>
                  </div>
                </div>
                """.formatted(escape(brand.toUpperCase()), escape(heading), bodyHtml, escape(footnote));
    }

    static String paragraph(String text) {
        return "<p style=\"margin:0 0 16px;color:#14221b;line-height:1.6\">" + escape(text) + "</p>";
    }

    static String code(String code) {
        return "<p style=\"margin:0 0 24px;text-align:center;font-size:34px;font-weight:700;letter-spacing:.3em;"
                + "color:#0d3d29;background:#e2ebdf;border-radius:14px;padding:18px\">" + escape(code) + "</p>";
    }

    static String button(String label, String url) {
        return "<p style=\"margin:8px 0 0\"><a href=\"" + escape(url) + "\" style=\"display:inline-block;"
                + "background:#175c3b;color:#fff;font-weight:700;text-decoration:none;border-radius:999px;"
                + "padding:12px 22px\">" + escape(label) + "</a></p>";
    }

    static String escape(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
