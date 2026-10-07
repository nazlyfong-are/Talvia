/* =========================================
   FILTROS + PAGINACIÓN DEL TABLERO DE VACANTES
   Requiere shared/paginacion.js (función rangoPaginas),
   que se carga desde fragments/shared-css.
   ========================================= */

/* =========================================
   CONFIGURACIÓN INICIAL
   ========================================= */
const state = {
    filters: {
        area: "todas",
        experiencia: 0,
        modalidad: "todas",
        nivel: "todos",
        keyword: "",
        location: ""
    },
    sort: "recientes",
    pagination: {
        currentPage: 1,
        itemsPerPage: 10, // Cambia este número para mostrar más/menos por página
        totalPages: 1
    },
    filteredJobs: [] // Aquí guardamos las tarjetas que pasaron el filtro para paginarlas
};

/* =========================================
   REFERENCIAS AL DOM
   ========================================= */
// Filtros Select
const areaSelect = document.getElementById("areaSelect");
const expSelect = document.getElementById("expSelect");
const modalitySelect = document.getElementById("modalitySelect");
const levelSelect = document.getElementById("levelSelect");
const sortSelect = document.querySelector(".sort-select");

// Búsqueda
const searchInput = document.getElementById("searchInput");
const locationInput = document.getElementById("locationInput");
const searchBtn = document.getElementById("searchBtn");
const clearFiltersBtn = document.getElementById("clearFilters");

// Contenedores y Tarjetas
const jobList = document.getElementById("jobList");
let allJobCards = Array.from(document.querySelectorAll(".job-card"));
const resultsCount = document.getElementById("resultsCount");

// Paginación
const paginationContainer = document.getElementById("paginationContainer");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageNumbers = document.getElementById("pageNumbers");


/* =========================================
   EVENT LISTENERS
   ========================================= */

// Al cambiar cualquier filtro se vuelve a la página 1 de los nuevos resultados
areaSelect.addEventListener("change", (e) => {
    state.filters.area = e.target.value;
    state.pagination.currentPage = 1;
    aplicarFiltros();
});

expSelect.addEventListener("change", (e) => {
    state.filters.experiencia = Number(e.target.value);
    state.pagination.currentPage = 1;
    aplicarFiltros();
});

modalitySelect.addEventListener("change", (e) => {
    state.filters.modalidad = e.target.value;
    state.pagination.currentPage = 1;
    aplicarFiltros();
});

levelSelect.addEventListener("change", (e) => {
    state.filters.nivel = e.target.value;
    state.pagination.currentPage = 1;
    aplicarFiltros();
});

sortSelect.addEventListener("change", (e) => {
    state.sort = e.target.value;
    state.pagination.currentPage = 1;
    aplicarFiltros();
});

searchBtn.addEventListener("click", () => {
    state.filters.keyword = searchInput.value.toLowerCase().trim();
    state.filters.location = locationInput.value.toLowerCase().trim();
    state.pagination.currentPage = 1;
    aplicarFiltros();
});

[searchInput, locationInput].forEach(input => {
    input.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            state.filters.keyword = searchInput.value.toLowerCase().trim();
            state.filters.location = locationInput.value.toLowerCase().trim();
            state.pagination.currentPage = 1;
            aplicarFiltros();
        }
    });
});

clearFiltersBtn.addEventListener("click", () => {
    areaSelect.value = "todas";
    expSelect.value = "0";
    modalitySelect.value = "todas";
    levelSelect.value = "todos";
    searchInput.value = "";
    locationInput.value = "";
    sortSelect.value = "recientes";

    state.filters = { area: "todas", experiencia: 0, modalidad: "todas", nivel: "todos", keyword: "", location: "" };
    state.sort = "recientes";
    state.pagination.currentPage = 1;

    aplicarFiltros();
});

prevPageBtn.addEventListener("click", () => {
    if (state.pagination.currentPage > 1) {
        state.pagination.currentPage--;
        renderizarPagina();
        volverAlInicioDeLista();
    }
});

nextPageBtn.addEventListener("click", () => {
    if (state.pagination.currentPage < state.pagination.totalPages) {
        state.pagination.currentPage++;
        renderizarPagina();
        volverAlInicioDeLista();
    }
});


/* =========================================
   LÓGICA PRINCIPAL DE FILTRADO Y ORDEN
   ========================================= */

function aplicarFiltros() {
    allJobCards = Array.from(document.querySelectorAll(".job-card"));

    state.filteredJobs = allJobCards.filter(vacante => {
        const area = vacante.dataset.area || "";
        const experiencia = Number(vacante.dataset.experience || 0);
        const modalidad = vacante.dataset.modality || "";
        const nivel = vacante.dataset.level || "";

        const textContent = vacante.innerText.toLowerCase();
        const jobCompanyElement = vacante.querySelector('.job-company');
        const locationText = jobCompanyElement ? jobCompanyElement.innerText.toLowerCase() : "";

        const coincideArea = state.filters.area === "todas"
            || area.trim().toLowerCase() === state.filters.area.trim().toLowerCase();
        const coincideExperiencia = experiencia >= state.filters.experiencia;
        const coincideModalidad = state.filters.modalidad === "todas"
            || modalidad.trim().toLowerCase() === state.filters.modalidad.trim().toLowerCase();
        const coincideNivel = state.filters.nivel === "todos"
            || nivel.trim().toLowerCase() === state.filters.nivel.trim().toLowerCase();

        const coincidePalabra = state.filters.keyword === "" || textContent.includes(state.filters.keyword);
        const coincideLugar = state.filters.location === "" || locationText.includes(state.filters.location);

        return coincideArea && coincideExperiencia && coincideModalidad && coincideNivel && coincidePalabra && coincideLugar;
    });

    state.filteredJobs.sort((a, b) => {
        const salarioA = Number(a.dataset.salary || 0);
        const salarioB = Number(b.dataset.salary || 0);
        const fechaA = new Date(a.dataset.date || "2000-01-01").getTime();
        const fechaB = new Date(b.dataset.date || "2000-01-01").getTime();

        if (state.sort === "salario-mayor") return salarioB - salarioA;
        if (state.sort === "salario-menor") return salarioA - salarioB;
        return fechaB - fechaA;
    });

    allJobCards.forEach(vacante => vacante.style.display = "none");

    const total = state.filteredJobs.length;
    if (resultsCount) {
        resultsCount.textContent = `${total} ${total === 1 ? "resultado encontrado" : "resultados encontrados"}`;
    }

    state.pagination.totalPages = Math.ceil(total / state.pagination.itemsPerPage) || 1;
    if (state.pagination.currentPage > state.pagination.totalPages) {
        state.pagination.currentPage = 1;
    }

    paginationContainer.style.display = total > 0 ? "flex" : "none";

    renderizarPagina();
}


/* =========================================
   RENDERIZADO DE PAGINACIÓN
   ========================================= */

function renderizarPagina() {
    state.filteredJobs.forEach(vacante => vacante.style.display = "none");

    const startIndex = (state.pagination.currentPage - 1) * state.pagination.itemsPerPage;
    const endIndex = startIndex + state.pagination.itemsPerPage;

    const jobsToShow = state.filteredJobs.slice(startIndex, endIndex);

    jobsToShow.forEach(vacante => {
        vacante.style.display = "flex";
        jobList.appendChild(vacante);
    });

    actualizarBotonesPaginacion();
}

// Sube hasta el inicio de la lista al cambiar de página, para no quedarse mirando el final
function volverAlInicioDeLista() {
    const zona = document.getElementById("vacantes");
    if (zona) zona.scrollIntoView({ behavior: "smooth", block: "start" });
}

function actualizarBotonesPaginacion() {
    prevPageBtn.disabled = state.pagination.currentPage === 1;
    nextPageBtn.disabled = state.pagination.currentPage === state.pagination.totalPages;

    pageNumbers.innerHTML = "";

    // rangoPaginas devuelve números y '…', ej: [1, '…', 9, 10, 11, '…', 28]
    rangoPaginas(state.pagination.currentPage, state.pagination.totalPages).forEach(p => {
        if (p === "…") {
            const puntos = document.createElement("span");
            puntos.classList.add("page-ellipsis");
            puntos.textContent = "…";
            pageNumbers.appendChild(puntos);
            return;
        }

        const btn = document.createElement("button");
        btn.classList.add("page-num");
        if (p === state.pagination.currentPage) btn.classList.add("active");
        btn.textContent = p;

        btn.addEventListener("click", () => {
            state.pagination.currentPage = p;
            renderizarPagina();
            volverAlInicioDeLista();
        });

        pageNumbers.appendChild(btn);
    });
}