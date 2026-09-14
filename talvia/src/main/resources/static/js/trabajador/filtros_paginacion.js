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
        itemsPerPage: 3, // Cambia este número para mostrar más/menos por página
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

areaSelect.addEventListener("change", (e) => {
    state.filters.area = e.target.value;
    aplicarFiltros();
});

expSelect.addEventListener("change", (e) => {
    state.filters.experiencia = Number(e.target.value);
    aplicarFiltros();
});

modalitySelect.addEventListener("change", (e) => {
    state.filters.modalidad = e.target.value;
    aplicarFiltros();
});

levelSelect.addEventListener("change", (e) => {
    state.filters.nivel = e.target.value;
    aplicarFiltros();
});

sortSelect.addEventListener("change", (e) => {
    state.sort = e.target.value;
    aplicarFiltros();
});

searchBtn.addEventListener("click", () => {
    state.filters.keyword = searchInput.value.toLowerCase().trim();
    state.filters.location = locationInput.value.toLowerCase().trim();
    aplicarFiltros();
});

[searchInput, locationInput].forEach(input => {
    input.addEventListener("keyup", (e) => {
        if(e.key === "Enter"){
            state.filters.keyword = searchInput.value.toLowerCase().trim();
            state.filters.location = locationInput.value.toLowerCase().trim();
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
    
    aplicarFiltros();
});

prevPageBtn.addEventListener("click", () => {
    if (state.pagination.currentPage > 1) {
        state.pagination.currentPage--;
        renderizarPagina();
    }
});

nextPageBtn.addEventListener("click", () => {
    if (state.pagination.currentPage < state.pagination.totalPages) {
        state.pagination.currentPage++;
        renderizarPagina();
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

        const coincideArea = state.filters.area === "todas" || area === state.filters.area;
        const coincideExperiencia = experiencia >= state.filters.experiencia;
        const coincideModalidad = state.filters.modalidad === "todas" || modalidad === state.filters.modalidad;
        const coincideNivel = state.filters.nivel === "todos" || nivel === state.filters.nivel;
        
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

function actualizarBotonesPaginacion() {
    prevPageBtn.disabled = state.pagination.currentPage === 1;
    nextPageBtn.disabled = state.pagination.currentPage === state.pagination.totalPages;

    pageNumbers.innerHTML = "";
    
    for (let i = 1; i <= state.pagination.totalPages; i++) {
        const btn = document.createElement("button");
        btn.classList.add("page-num");
        if (i === state.pagination.currentPage) btn.classList.add("active");
        btn.textContent = i;
        
        btn.addEventListener("click", () => {
            state.pagination.currentPage = i;
            renderizarPagina();
        });
        
        pageNumbers.appendChild(btn);
    }
}