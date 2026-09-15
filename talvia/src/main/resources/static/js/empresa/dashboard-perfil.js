/* ============================================
   DASHBOARD EMPRESA — Perfil de la empresa
============================================ */

const CAMPOS_PERFIL_EMPRESA = [
    'emp-nombre', 'emp-figura-legal', 'emp-ciudad', 'emp-sector',
    'emp-descripcion', 'emp-sitio-web', 'emp-empleados'
];

document.addEventListener('DOMContentLoaded', () => {
    cargarPerfilEmpresa();
    document.getElementById('btn-editar-perfil').addEventListener('click', activarEdicionPerfil);
    document.getElementById('btn-guardar-perfil').addEventListener('click', guardarPerfilEmpresa);
    document.getElementById('input-logo-emp').addEventListener('change', subirLogoEmpresa);

    // Ciudad "otra"
    const ciudadSelect = document.getElementById('emp-ciudad');
    const ciudadOtraInput = document.getElementById('emp-ciudad-otra');
    ciudadSelect.addEventListener('change', function () {
        ciudadOtraInput.classList.toggle('oculto', this.value !== 'otra');
        if (this.value !== 'otra') ciudadOtraInput.value = '';
    });
});

async function cargarPerfilEmpresa() {
    try {
        const resp = await fetch('/api/empresa/perfil');
        if (!resp.ok) throw new Error('No se pudo cargar el perfil.');
        const p = await resp.json();

        document.getElementById('emp-correo').value = p.correoElectronico || '';
        document.getElementById('emp-nombre').value = p.razonSocial || '';
        if (p.figuraLegal) document.getElementById('emp-figura-legal').value = p.figuraLegal;

        const ciudadSelect = document.getElementById('emp-ciudad');
        const ciudadOtraInput = document.getElementById('emp-ciudad-otra');
        const opcionesCiudad = Array.from(ciudadSelect.options).map(o => o.value);
        if (p.ciudad && opcionesCiudad.includes(p.ciudad)) {
            ciudadSelect.value = p.ciudad;
        } else if (p.ciudad) {
            ciudadSelect.value = 'otra';
            ciudadOtraInput.value = p.ciudad;
            ciudadOtraInput.classList.remove('oculto');
        }

        if (p.sector) document.getElementById('emp-sector').value = p.sector;
        document.getElementById('emp-descripcion').value = p.descripcion || '';
        document.getElementById('emp-sitio-web').value = p.sitioWeb || '';
        if (p.numeroEmpleados) document.getElementById('emp-empleados').value = p.numeroEmpleados;

        if (p.logoUrl) {
            document.getElementById('logo-preview').innerHTML =
                `<img src="${p.logoUrl}" style="width:100%; height:100%; object-fit:cover;">`;
        }
    } catch (err) {
        showToast('Error cargando el perfil: ' + err.message, 'error');
    }
}

function activarEdicionPerfil() {
    CAMPOS_PERFIL_EMPRESA.forEach(id => { document.getElementById(id).disabled = false; });
    document.getElementById('emp-ciudad-otra').disabled = false;

    const inputLogo = document.getElementById('input-logo-emp');
    const labelLogo = document.getElementById('label-logo-emp');
    inputLogo.disabled = false;
    labelLogo.style.cursor = 'pointer';
    labelLogo.style.color = 'var(--ink)';

    document.getElementById('btn-editar-perfil').classList.add('oculto');
    document.getElementById('btn-guardar-perfil').classList.remove('oculto');
}

function desactivarEdicionPerfil() {
    CAMPOS_PERFIL_EMPRESA.forEach(id => { document.getElementById(id).disabled = true; });
    document.getElementById('emp-ciudad-otra').disabled = true;

    const inputLogo = document.getElementById('input-logo-emp');
    const labelLogo = document.getElementById('label-logo-emp');
    inputLogo.disabled = true;
    labelLogo.style.cursor = 'not-allowed';
    labelLogo.style.color = 'var(--slate)';

    document.getElementById('btn-editar-perfil').classList.remove('oculto');
    document.getElementById('btn-guardar-perfil').classList.add('oculto');
}

async function guardarPerfilEmpresa() {
    let ciudadFinal = document.getElementById('emp-ciudad').value;
    if (ciudadFinal === 'otra') {
        ciudadFinal = document.getElementById('emp-ciudad-otra').value.trim();
    }

    const body = {
        razonSocial: document.getElementById('emp-nombre').value.trim(),
        figuraLegal: document.getElementById('emp-figura-legal').value,
        ciudad: ciudadFinal,
        sector: document.getElementById('emp-sector').value,
        descripcion: document.getElementById('emp-descripcion').value.trim(),
        sitioWeb: document.getElementById('emp-sitio-web').value.trim(),
        numeroEmpleados: document.getElementById('emp-empleados').value
    };

    try {
        const resp = await fetch('/api/empresa/perfil', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!resp.ok) throw new Error(await resp.text());
        showToast('✓ Perfil de empresa guardado.', 'success');
        desactivarEdicionPerfil();
    } catch (err) {
        showToast('Error al guardar: ' + err.message, 'error');
    }
}

async function subirLogoEmpresa(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;
    const formData = new FormData();
    formData.append('archivo', archivo);
    try {
        const resp = await fetch('/api/empresa/perfil/logo', { method: 'POST', body: formData });
        if (!resp.ok) throw new Error(await resp.text());
        const data = await resp.json();
        document.getElementById('logo-preview').innerHTML =
            `<img src="${data.logoUrl}" style="width:100%; height:100%; object-fit:cover;">`;
        showToast('✓ Logo actualizado.', 'success');
    } catch (err) {
        showToast('Error al subir el logo: ' + err.message, 'error');
    }
}

/* ── ELIMINAR CUENTA (Empresa) ── */
document.getElementById('btn-abrir-eliminar-cuenta-emp').addEventListener('click', () => {
    document.getElementById('modalEliminarCuentaEmp').style.display = 'flex';
});

document.getElementById('btnCerrarEliminarEmp').addEventListener('click', cerrarModalEliminarEmp);

function cerrarModalEliminarEmp() {
    document.getElementById('modalEliminarCuentaEmp').style.display = 'none';
    document.getElementById('paso-solicitar-eliminacion-emp').classList.remove('oculto');
    document.getElementById('form-confirmar-eliminacion-emp').classList.add('oculto');
    document.getElementById('codigo-eliminar-cuenta-emp').value = '';
}

document.getElementById('btn-enviar-codigo-eliminar-emp').addEventListener('click', async () => {
    try {
        const resp = await fetch('/api/cuenta/eliminar/solicitar', { method: 'POST' });
        if (!resp.ok) throw new Error(await resp.text());

        document.getElementById('paso-solicitar-eliminacion-emp').classList.add('oculto');
        document.getElementById('form-confirmar-eliminacion-emp').classList.remove('oculto');
        document.getElementById('texto-eliminar-cuenta-emp').textContent = 'Ingresa el código que enviamos a tu correo para confirmar.';
    } catch (err) {
        showToast('Error al enviar el código: ' + err.message, 'error');
    }
});

document.getElementById('form-confirmar-eliminacion-emp').addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigo = document.getElementById('codigo-eliminar-cuenta-emp').value.trim();

    if (!confirm('¿Estás completamente seguro? Esta acción es irreversible.')) return;

    try {
        const resp = await fetch('/api/cuenta/eliminar/confirmar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo })
        });
        if (!resp.ok) throw new Error(await resp.text());

        alert('Tu cuenta empresarial ha sido eliminada.');
        window.location.href = '/public/login';
    } catch (err) {
        alert('Error al eliminar la cuenta: ' + err.message);
    }
});