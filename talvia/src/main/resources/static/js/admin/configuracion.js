/* ============================================
   ADMIN — Configuración del sistema
   Endpoints esperados (pendientes de implementar):
   GET /api/admin/configuracion
       → { diasVacanteSinCandidatos, verificacionCorreoObligatoria }
   PUT /api/admin/configuracion
       body: { diasVacanteSinCandidatos, verificacionCorreoObligatoria }
============================================ */

document.addEventListener('DOMContentLoaded', () => {
    cargarConfiguracion();
    document.getElementById('btn-guardar-config').addEventListener('click', guardarConfiguracion);
});

async function cargarConfiguracion() {
    try {
        const resp = await fetch('/api/admin/configuracion');
        if (!resp.ok) throw new Error();
        const data = await resp.json();
        document.getElementById('config-dias-sin-candidatos').value = data.diasVacanteSinCandidatos ?? 15;
        document.getElementById('config-verificacion-obligatoria').checked = data.verificacionCorreoObligatoria ?? true;
    } catch (err) {
        // Si el endpoint aún no existe, se deja el valor por defecto del HTML
    }
}

async function guardarConfiguracion() {
    const body = {
        diasVacanteSinCandidatos: Number(document.getElementById('config-dias-sin-candidatos').value),
        verificacionCorreoObligatoria: document.getElementById('config-verificacion-obligatoria').checked
    };

    try {
        const resp = await fetch('/api/admin/configuracion', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!resp.ok) throw new Error(await resp.text());

        const toast = document.getElementById('toast');
        toast.textContent = '✓ Configuración guardada.';
        toast.className = 'toast success';
        void toast.offsetWidth;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3800);
    } catch (err) {
        alert('Error al guardar: ' + err.message);
    }
}