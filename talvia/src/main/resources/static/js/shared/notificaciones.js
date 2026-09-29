/* ============================================
   CAMPANA DE NOTIFICACIONES — compartida entre
   trabajador y empresa
============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const bellBtn = document.getElementById('notif-bell-btn');
    const panel = document.getElementById('notif-panel');
    if (!bellBtn || !panel) return; // esta página no tiene campana

    cargarContador();
    setInterval(cargarContador, 60000); // refresca el contador cada minuto

    bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const abrir = !panel.classList.contains('abierto');
        panel.classList.toggle('abierto', abrir);
        if (abrir) cargarNotificaciones();
    });

    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && e.target !== bellBtn) {
            panel.classList.remove('abierto');
        }
    });

    document.getElementById('notif-marcar-todas')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
            await fetch('/api/notificaciones/leer-todas', { method: 'PUT' });
            cargarContador();
            cargarNotificaciones();
        } catch (err) { /* silencioso */ }
    });
});

async function cargarContador() {
    try {
        const resp = await fetch('/api/notificaciones/no-leidas');
        if (!resp.ok) return;
        const data = await resp.json();
        const badge = document.getElementById('notif-badge');
        if (!badge) return;
        if (data.total > 0) {
            badge.textContent = data.total > 9 ? '9+' : data.total;
            badge.classList.remove('oculto');
        } else {
            badge.classList.add('oculto');
        }
    } catch (err) { /* silencioso */ }
}

async function cargarNotificaciones() {
    const lista = document.getElementById('notif-list');
    if (!lista) return;
    lista.innerHTML = '<div class="notif-empty">Cargando...</div>';

    try {
        const resp = await fetch('/api/notificaciones');
        if (!resp.ok) throw new Error();
        const notifs = await resp.json();

        if (notifs.length === 0) {
            lista.innerHTML = '<div class="notif-empty">No tienes notificaciones todavía.</div>';
            return;
        }

        lista.innerHTML = '';
        notifs.forEach(n => {
            const item = document.createElement('a');
            item.className = 'notif-item' + (n.leida ? '' : ' no-leida');
            item.innerHTML = `
                <div class="notif-item-mensaje">${n.mensaje}</div>
                <div class="notif-item-fecha">${n.fecha}</div>
            `;
            item.addEventListener('click', async () => {
                if (!n.leida) {
                    await fetch(`/api/notificaciones/${n.id}/leida`, { method: 'PUT' });
                    cargarContador();
                }
                if (n.urlDestino) window.location.href = n.urlDestino;
            });
            lista.appendChild(item);
        });

    } catch (err) {
        lista.innerHTML = '<div class="notif-empty">Error al cargar notificaciones.</div>';
    }
}