function rangoPaginas(actual, total, vecinas = 1) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const paginas = new Set([1, total]);
    for (let i = actual - vecinas; i <= actual + vecinas; i++) {
        if (i >= 1 && i <= total) paginas.add(i);
    }
    // Cerca de los extremos se muestran más números para que el ancho no cambie tanto
    if (actual <= 3) { paginas.add(2); paginas.add(3); paginas.add(4); }
    if (actual >= total - 2) { paginas.add(total - 1); paginas.add(total - 2); paginas.add(total - 3); }

    const ordenadas = Array.from(paginas).sort((a, b) => a - b);
    const resultado = [];
    let anterior = 0;
    for (const p of ordenadas) {
        if (p - anterior === 2) resultado.push(anterior + 1);  // falta un solo número: mejor mostrarlo
        else if (p - anterior > 2) resultado.push('…');
        resultado.push(p);
        anterior = p;
    }
    return resultado;
}