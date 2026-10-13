(function () {
    const $ = (id) => document.getElementById(id);
    const TELEFONO_VALIDO = /^(3[0-9]{9}|60[1-9][0-9]{7}|[1-8][0-9]{7})$/;

    let raiz = null;
    let perfil = null;

    document.addEventListener('DOMContentLoaded', () => {
        raiz = $('perfil-empresa');
        if (!raiz) return;
        iniciarEncabezadoCompleto();  
        $('btn-editar-perfil').addEventListener('click', entrarEdicion);
        $('btn-cancelar-perfil').addEventListener('click', cancelarEdicion);
        $('btn-guardar-perfil').addEventListener('click', guardar);
        $('input-logo-emp').addEventListener('change', subirLogo);
        $('emp-ciudad').addEventListener('change', alternarCiudadOtra);
        $('emp-telefono').addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
        });

        iniciarEliminarCuenta();
        cargarPerfil();
    });

    function avisar(mensaje, tipo) {
        if (typeof showToast === 'function') showToast(mensaje, tipo);
        else alert(mensaje);
    }

    function iniciarEncabezadoCompleto() {
    const main = document.querySelector('main.dash-main');
    if (!main) return;

    document.querySelectorAll('.emp-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const esPerfil = btn.dataset.target === 'sec-perfil';
            main.classList.toggle('perfil-activo', esPerfil);
            document.body.classList.toggle('perfil-activo', esPerfil);
        });
    });
}

    /* ── Carga ── */
    async function cargarPerfil() {
        try {
            const resp = await fetch('/api/empresa/perfil');
            if (!resp.ok) throw new Error('No se pudo cargar el perfil de la empresa.');
            pintar(await resp.json());
        } catch (err) {
            raiz.classList.remove('cargando');
            $('v-razon-social').textContent = 'No se pudo cargar';
            avisar(err.message, 'error');
        }
    }

    function etiquetaDe(select, valor) {
        if (!valor) return null;
        const opcion = Array.from(select.options).find(o => o.value === valor);
        return opcion ? opcion.textContent.trim() : valor;
    }

    function iniciales(razonSocial) {
        if (!razonSocial) return 'EM';
        return razonSocial.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
    }

    function pintarLogo(url, razonSocial) {
        const cont = $('logo-preview');
        cont.innerHTML = '';
        if (url) {
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Logo de la empresa';
            cont.appendChild(img);
        } else {
            cont.textContent = iniciales(razonSocial);
        }
    }

    function pintar(p) {
        perfil = p;
        raiz.classList.remove('cargando');

        $('v-razon-social').textContent = p.razonSocial || 'Sin nombre';
        $('v-sector').textContent = etiquetaDe($('emp-sector'), p.sector) || 'Sector no definido';
        $('v-ciudad').textContent = p.ciudad || 'Sin ciudad';
        $('v-correo').textContent = p.correoElectronico || '';
        $('v-telefono').textContent = p.telefono || 'Sin teléfono';
        $('v-descripcion').textContent = p.descripcion || 'Aún no has agregado una descripción de tu empresa.';
        $('v-figura').textContent = etiquetaDe($('emp-figura-legal'), p.figuraLegal) || 'No definida';

        const empleados = etiquetaDe($('emp-empleados'), p.numeroEmpleados);
        $('v-empleados').textContent = !empleados ? 'No definido'
            : (p.numeroEmpleados === '+1000' ? empleados : `${empleados} empleados`);

        const enlace = $('v-sitio-web');
        if (p.sitioWeb) {
            enlace.href = /^https?:\/\//i.test(p.sitioWeb) ? p.sitioWeb : `https://${p.sitioWeb}`;
            enlace.textContent = p.sitioWeb.replace(/^https?:\/\//i, '');
        } else {
            enlace.removeAttribute('href');
            enlace.textContent = 'No definido';
        }

        pintarLogo(p.logoUrl, p.razonSocial);
        llenarFormulario(p);
    }

    /* ── Formulario de edición ── */
    function fijarSelect(select, valor) {
        if (!valor) { select.value = ''; return; }
        // Si el valor guardado no está en la lista, se agrega para no perderlo al guardar
        if (!Array.from(select.options).some(o => o.value === valor)) {
            select.appendChild(new Option(valor, valor));
        }
        select.value = valor;
    }

    function alternarCiudadOtra() {
        $('emp-ciudad-otra').classList.toggle('oculto', $('emp-ciudad').value !== 'otra');
    }

    function llenarFormulario(p) {
        $('emp-nombre').value = p.razonSocial || '';
        fijarSelect($('emp-sector'), p.sector);

        const selectCiudad = $('emp-ciudad');
        const enLista = Array.from(selectCiudad.options).some(o => o.value === p.ciudad);
        if (!p.ciudad) {
            selectCiudad.value = '';
            $('emp-ciudad-otra').value = '';
        } else if (enLista) {
            selectCiudad.value = p.ciudad;
            $('emp-ciudad-otra').value = '';
        } else {
            selectCiudad.value = 'otra';
            $('emp-ciudad-otra').value = p.ciudad;
        }
        alternarCiudadOtra();

        $('emp-telefono').value = p.telefono || '';
        $('emp-descripcion').value = p.descripcion || '';
        $('emp-sitio-web').value = p.sitioWeb || '';
        fijarSelect($('emp-figura-legal'), p.figuraLegal);
        fijarSelect($('emp-empleados'), p.numeroEmpleados);
    }

    function entrarEdicion() {
        if (perfil) llenarFormulario(perfil);
        raiz.classList.add('modo-edicion');
    }

    function salirEdicion() {
        raiz.classList.remove('modo-edicion');
    }

    function cancelarEdicion() {
        salirEdicion();
        if (perfil) llenarFormulario(perfil);
    }

    /* ── Guardar ── */
    async function guardar() {
        const razonSocial = $('emp-nombre').value.trim();
        if (!razonSocial) {
            avisar('La razón social no puede estar vacía.', 'error');
            $('emp-nombre').focus();
            return;
        }

        const telefono = $('emp-telefono').value.trim();
        if (telefono && !TELEFONO_VALIDO.test(telefono)) {
            avisar('Ingresa un teléfono colombiano válido. Ej: 3001234567 (móvil) o 6011234567 (fijo).', 'error');
            $('emp-telefono').focus();
            return;
        }

        let ciudad = $('emp-ciudad').value;
        if (ciudad === 'otra') ciudad = $('emp-ciudad-otra').value.trim();

        // Los campos opcionales vacíos se mandan como null: el backend los deja como están
        const nuloSiVacio = (v) => (v && v.trim()) ? v.trim() : null;

        const body = {
            razonSocial,
            sector: nuloSiVacio($('emp-sector').value),
            ciudad: nuloSiVacio(ciudad),
            telefono: nuloSiVacio(telefono),
            descripcion: $('emp-descripcion').value.trim(),
            sitioWeb: $('emp-sitio-web').value.trim(),
            figuraLegal: nuloSiVacio($('emp-figura-legal').value),
            numeroEmpleados: nuloSiVacio($('emp-empleados').value)
        };

        const btn = $('btn-guardar-perfil');
        const textoOriginal = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Guardando…';

        try {
            const resp = await fetch('/api/empresa/perfil', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!resp.ok) throw new Error((await resp.text()) || 'No se pudo guardar.');

            salirEdicion();
            await cargarPerfil();
            avisar('✓ Información actualizada.', 'success');
        } catch (err) {
            avisar('Error al guardar: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = textoOriginal;
        }
    }

    /* ── Logo ── */
    async function subirLogo(e) {
        const archivo = e.target.files[0];
        if (!archivo) return;

        if (!archivo.type.startsWith('image/')) {
            avisar('Selecciona una imagen (PNG, JPG o WebP).', 'error');
            e.target.value = '';
            return;
        }

        const formData = new FormData();
        formData.append('archivo', archivo);

        try {
            const resp = await fetch('/api/empresa/perfil/logo', { method: 'POST', body: formData });
            if (!resp.ok) throw new Error((await resp.text()) || 'No se pudo subir el logo.');

            const data = await resp.json();
            const url = data.logoUrl || data.url || data.fotoUrl;
            if (perfil) perfil.logoUrl = url;
            pintarLogo(url, perfil ? perfil.razonSocial : '');
            avisar('✓ Logo actualizado.', 'success');
        } catch (err) {
            avisar('Error al subir el logo: ' + err.message, 'error');
        } finally {
            e.target.value = '';
        }
    }

    /* ── Eliminar cuenta ── */
    function iniciarEliminarCuenta() {
        const modal = $('modalEliminarCuentaEmp');

        const cerrar = () => {
            modal.classList.remove('abierto');
            $('paso-solicitar-eliminacion-emp').classList.remove('oculto');
            $('form-confirmar-eliminacion-emp').classList.add('oculto');
            $('codigo-eliminar-cuenta-emp').value = '';
            $('texto-eliminar-cuenta-emp').textContent = 'Te enviaremos un código de confirmación a tu correo.';
        };

        $('btn-abrir-eliminar-cuenta-emp').addEventListener('click', () => modal.classList.add('abierto'));
        $('btnCerrarEliminarEmp').addEventListener('click', cerrar);
        $('btnCancelarEliminarEmp2').addEventListener('click', cerrar);
        modal.addEventListener('click', (e) => { if (e.target === modal) cerrar(); });

        $('btn-enviar-codigo-eliminar-emp').addEventListener('click', async () => {
            try {
                const resp = await fetch('/api/cuenta/eliminar/solicitar', { method: 'POST' });
                if (!resp.ok) throw new Error(await resp.text());

                $('paso-solicitar-eliminacion-emp').classList.add('oculto');
                $('form-confirmar-eliminacion-emp').classList.remove('oculto');
                $('texto-eliminar-cuenta-emp').textContent = 'Ingresa el código que enviamos a tu correo para confirmar.';
            } catch (err) {
                avisar('Error al enviar el código: ' + err.message, 'error');
            }
        });

        $('form-confirmar-eliminacion-emp').addEventListener('submit', async (e) => {
            e.preventDefault();
            const codigo = $('codigo-eliminar-cuenta-emp').value.trim();

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
                avisar('Error al eliminar la cuenta: ' + err.message, 'error');
            }
        });
    }
})();