/* ============================================
   ADMIN — Exportar datos para minería de datos
   Endpoint esperado (pendiente de implementar):
   GET /api/admin/exportar/postulaciones?desde=&hasta=
       → devuelve un archivo CSV para descarga directa
============================================ */

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-exportar').addEventListener('click', exportarCsv);
});

function exportarCsv() {
    const desde = document.getElementById('export-desde').value;
    const hasta = document.getElementById('export-hasta').value;

    const query = construirQueryParams({ desde, hasta });
    // Navegación directa: el backend responde con Content-Disposition: attachment,
    // por lo que el navegador dispara la descarga sin necesidad de fetch/blob.
    window.location.href = `/api/admin/exportar/postulaciones?${query}`;
}