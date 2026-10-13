/* RECUPERAR CONTRASEÑA - flujo de 2 pasos */

let correoActual = '';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('form-solicitar').addEventListener('submit', solicitarCodigo);
    document.getElementById('form-restablecer').addEventListener('submit', restablecerContrasena);
    document.getElementById('btn-reenviar').addEventListener('click', reenviarCodigo);
});

async function solicitarCodigo(e) {
    e.preventDefault();
    correoActual = document.getElementById('correo-recuperar').value.trim();
    const btn = document.getElementById('btn-solicitar');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
        const resp = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correoElectronico: correoActual })
        });
        if (!resp.ok) throw new Error(await resp.text());

        showToast('✓ Si el correo existe, te enviamos un código.', 'success');
        document.getElementById('paso-1').classList.add('oculto');
        document.getElementById('paso-2').classList.remove('oculto');

    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Enviar código';
    }
}

async function reenviarCodigo() {
    try {
        await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correoElectronico: correoActual })
        });
        showToast('✓ Código reenviado.', 'success');
    } catch (err) {
        showToast('Error al reenviar: ' + err.message, 'error');
    }
}

async function restablecerContrasena(e) {
    e.preventDefault();

    const codigo = document.getElementById('codigo-recuperar').value.trim();
    const nueva = document.getElementById('nueva-contrasena').value;
    const confirmar = document.getElementById('confirmar-contrasena').value;

    if (nueva.length < 8 || !/[A-Z]/.test(nueva) || !/[0-9]/.test(nueva)) {
        showToast('La contraseña debe tener 8+ caracteres, una mayúscula y un número.', 'error');
        return;
    }
    if (nueva !== confirmar) {
        showToast('Las contraseñas no coinciden.', 'error');
        return;
    }

    const btn = document.getElementById('btn-restablecer');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
        const resp = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                correoElectronico: correoActual,
                codigo: codigo,
                nuevaContrasena: nueva
            })
        });
        if (!resp.ok) throw new Error(await resp.text());

        document.getElementById('paso-2').classList.add('oculto');
        document.getElementById('paso-3').classList.remove('oculto');

    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Restablecer contraseña';
    }
}

function showToast(message, type = 'default') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3800);
}