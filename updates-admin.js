
(() => {
    "use strict";

    const REPOSITORY = "helloiamtheone/676767";

    const analyzeButton = document.getElementById("analyzeUpdatesButton");
    const statusBox = document.getElementById("updatesAnalysisStatus");
    const proposalPanel = document.getElementById("updatesProposal");

    const titleInput = document.getElementById("updateProposalTitle");
    const descriptionInput = document.getElementById("updateProposalDescription");
    const dateInput = document.getElementById("updateProposalDate");
    const categoryInput = document.getElementById("updateProposalCategory");

const technicalDetails = document.getElementById("updateTechnicalDetails");

    const publishButton = document.getElementById("publishUpdateButton");
    const rejectButton = document.getElementById("rejectUpdateButton");

    if (
        !analyzeButton ||
        !statusBox ||
        !proposalPanel ||
        !titleInput ||
        !descriptionInput ||
        !dateInput ||
        !categoryInput
    ) {
        console.error("No se encontraron todos los elementos del generador.");
        return;
    }

    let proposalReady = false;

    function isAdministrator() {
        return typeof isAdmin !== "undefined" && isAdmin === true;
    }

    function getCommitDate(commit) {
        const date =
            commit.commit.author?.date ||
            commit.commit.committer?.date;

        if (!date) {
            return new Date().toISOString().slice(0, 10);
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return new Date().toISOString().slice(0, 10);
        }

        return date.slice(0, 10);
    }

    function detectCategory(commit) {
        const message = (commit.commit.message || "").toLowerCase();

        const files = commit.files || [];

        const filePaths = files
            .map(file => file.filename.toLowerCase());

        const addedFiles = files.some(
            file => file.status === "added"
        );

        // Cambios importantes.
        if (
            /security|seguridad|critical|critico|crítico|breaking|permission|permisos|vulnerabilidad/.test(message)
        ) {
            return "important";
        }

        // Correcciones.
        if (
            /fix|bug|error|correg|arregl|repair|hotfix/.test(message)
        ) {
            return "fix";
        }

        // Contenido nuevo o documental.
        if (
            /content|contenido|document|documento|docs/.test(message) ||
            filePaths.some(file =>
                /(^|\/)(docs|documentos|content)(\/|$)|\.pdf$/i.test(file)
            )
        ) {
            return "content";
        }

        // Novedades.
        if (
            /add|create|new|nuevo|nueva|agreg|añad|feat/.test(message) ||
            addedFiles
        ) {
            return "new";
        }

        // Si no se identifica una categoría específica.
        return "improvement";
    }

    function createTitle(commit) {
    const files = (commit.files || [])
        .map(file => file.filename.toLowerCase());

    if (files.some(file => file.includes("profiles.js"))) {
        return "Mejoras en el sistema de perfiles";
    }

    if (files.some(file => file.includes("updates-admin.js"))) {
        return "Mejoras en el generador de actualizaciones";
    }

    if (files.some(file => file.includes("styles.css"))) {
        return "Renovación visual del proyecto";
    }

    if (files.some(file => file.includes("build.js"))) {
        return "Mejoras en el sistema de compilación";
    }

    if (files.some(file => file.includes("app.js"))) {
        return "Mejoras en el funcionamiento del sistema";
    }

    if (files.some(file => file.includes("index.html"))) {
        return "Actualización de la estructura principal";
    }

    return "Nueva actualización del proyecto";
}

 
function createDescription(commit) {
    const files = commit.files || [];

    if (files.length === 0) {
        return "Se han realizado ajustes internos en ARCHIVO CLASIFICADO como parte del desarrollo continuo del proyecto.";
    }

    const areas = new Set();

    files.forEach(file => {
        const path = file.filename.toLowerCase();

        if (/(^|\/)profiles\.js$/.test(path)) {
            areas.add("el sistema de perfiles y clasificación");
        }

        if (/(^|\/)updates-admin\.js$/.test(path)) {
            areas.add("las herramientas administrativas del Registro de Actualizaciones");
        }

        if (/(^|\/)app\.js$/.test(path)) {
            areas.add("el funcionamiento general del sistema");
        }

        if (/(^|\/)styles\.css$/.test(path)) {
            areas.add("la presentación visual del proyecto");
        }

        if (/(^|\/)build\.js$/.test(path)) {
            areas.add("el sistema de compilación y publicación");
        }

        if (/(^|\/)index\.html$/.test(path)) {
            areas.add("la estructura y el contenido de las páginas");
        }

        if (
            /(^|\/)(docs|documentos|content)(\/|$)|\.pdf$/i.test(path)
        ) {
            areas.add("los documentos y contenidos del proyecto");
        }
    });

    const areaList = Array.from(areas);

    if (areaList.length === 0) {
        return "Se han realizado modificaciones en componentes internos de ARCHIVO CLASIFICADO. Consulta el análisis técnico para conocer los archivos afectados.";
    }

    let description;

    if (areaList.length === 1) {
        description = areaList[0];
    } else if (areaList.length === 2) {
        description = areaList[0] + " y " + areaList[1];
    } else {
        description =
            areaList.slice(0, -1).join(", ") +
            " y " +
            areaList[areaList.length - 1];
    }

return "¡ARCHIVO CLASIFICADO continúa evolucionando! Se han realizado cambios relacionados con " +
    description +
    ".";

}


function createTechnicalDetails(commit) {
    const files = commit.files || [];

    const fileList = files.length
        ? files.map(file =>
            "• " + file.filename +
            " | Estado: " + file.status +
            " | +" + (file.additions || 0) +
            " -" + (file.deletions || 0)
        ).join("\n")
        : "No hay información de archivos.";

    const additions = files.reduce(
        (total, file) => total + (file.additions || 0),
        0
    );

    const deletions = files.reduce(
        (total, file) => total + (file.deletions || 0),
        0
    );

    return [
        "IDENTIFICADOR: " + commit.sha.slice(0, 7),
        "MENSAJE ORIGINAL: " + (commit.commit.message || "Sin mensaje"),
        "FECHA: " + getCommitDate(commit),
        "",
        "ARCHIVOS MODIFICADOS:",
        fileList,
        "",
        "RESUMEN:",
        "Archivos afectados: " + files.length,
        "Líneas añadidas: " + additions,
        "Líneas eliminadas: " + deletions
    ].join("\n");
}

    function createProposal(commit) {
        titleInput.value = createTitle(commit);
        descriptionInput.value = createDescription(commit);
        dateInput.value = getCommitDate(commit);
        categoryInput.value = detectCategory(commit);

if (technicalDetails) {
    technicalDetails.textContent = createTechnicalDetails(commit);
}

        proposalReady = true;
        proposalPanel.style.display = "block";
    }

    async function githubRequest(url) {
        const response = await fetch(url);

        if (response.status === 403) {
            throw new Error(
                "GitHub ha limitado temporalmente las consultas. Inténtalo más tarde."
            );
        }

        if (response.status === 404) {
            throw new Error(
                "No se encontró el repositorio o el recurso solicitado."
            );
        }

        if (!response.ok) {
            throw new Error(
                "Error de GitHub. Código: " + response.status
            );
        }

        return response.json();
    }


    async function loadPublishedUpdates() {
        if (typeof db === "undefined" || !db) {
            console.error("El cliente de Supabase no está disponible.");
            return;
        }

        const updatesList = document.getElementById("updatesList");

        if (!updatesList) return;

        const { data, error } = await db
            .from("updates")
            .select("update_id,title,description,date,category,created_at")
            .order("date", { ascending: false })
            .order("created_at", { ascending: false });

    
        if (error) {
            console.error("Error al cargar actualizaciones:", error);
            return;
        }

        console.log("ACTUALIZACIONES RECIBIDAS:", data);

        statusBox.textContent =
            "ACTUALIZACIONES RECIBIDAS: " + data.length;


        updatesList
            .querySelectorAll("[data-dynamic-update]")
            .forEach(card => card.remove());

        const template = updatesList.querySelector(".update-entry");

        if (!template) {
            console.error("No se encontró una tarjeta de plantilla.");
            return;
        }

        const existingUpdates = new Set();

        updatesList.querySelectorAll(
            ".update-entry:not([data-dynamic-update])"
        ).forEach(card => {
            const title = card.querySelector(".update-title")?.textContent
                .trim().toLowerCase();

            const date = card.querySelector(".update-date")?.textContent
                .trim();

            if (title && date) {
                existingUpdates.add(title + "|" + date);
            }
        });

        const categories = {
            new: {
                className: "category-new",
                typeClass: "type-new",
                label: "NOVEDAD"
            },
            improvement: {
                className: "category-improvement",
                typeClass: "type-improvement",
                label: "MEJORA"
            },
            fix: {
                className: "category-fix",
                typeClass: "type-fix",
                label: "CORRECCIÓN"
            },
            important: {
                className: "category-important",
                typeClass: "type-important",
                label: "CAMBIO IMPORTANTE"
            },
            content: {
                className: "category-content",
                typeClass: "type-content",
                label: "CONTENIDO NUEVO"
            }
        };

        data.forEach(update => {
            const category = categories[update.category];

            if (!category) return;

            const [year, month, day] = update.date.split("-");
            const formattedDate = `${day}/${month}/${year}`;

            const updateKey =
                update.title.trim().toLowerCase() + "|" + formattedDate;

            if (existingUpdates.has(updateKey)) return;

            existingUpdates.add(updateKey);

            const card = template.cloneNode(true);

            card.dataset.updateId = update.update_id;
            card.dataset.dynamicUpdate = "true";

            [
                "category-new",
                "category-improvement",
                "category-fix",
                "category-important",
                "category-content"
            ].forEach(className => card.classList.remove(className));

            card.classList.add(category.className);

            const dateElement = card.querySelector(".update-date");
            const typeElement = card.querySelector(".update-type");
            const titleElement = card.querySelector(".update-title");
            const descriptionElement = card.querySelector(".update-description");
            const speechElement = card.querySelector(".update-speech");

            if (dateElement) {
                const [year, month, day] = update.date.split("-");
                dateElement.textContent = `${day}/${month}/${year} 
`;
          dateElement.setAttribute("datetime", update.date);
            }

            if (typeElement) {
                typeElement.textContent = category.label;

                typeElement.classList.remove(
                    "type-new",
                    "type-improvement",
                    "type-fix",
                    "type-important",
                    "type-content"
                );

                typeElement.classList.add(category.typeClass);
            }

            if (titleElement) {
                titleElement.textContent = update.title;
            }

            if (descriptionElement) {
                descriptionElement.textContent = update.description;
            }

            if (speechElement) {
                speechElement.textContent = "";
                speechElement.hidden = true;
            }

            card.querySelectorAll(".update-unseen").forEach(element => {
                element.textContent = "NUEVO";
            });

            updatesList.prepend(card);
        });

      if (typeof applyUserOrganizationSettings === "function") {
    applyUserOrganizationSettings();
    }

    }

    window.loadPublishedUpdates = loadPublishedUpdates;

    document.addEventListener("DOMContentLoaded", () => {
        loadPublishedUpdates();
    });


    analyzeButton.addEventListener("click", async () => {
        if (!isAdministrator()) {
            statusBox.textContent = "ACCESO DENEGADO.";
            return;
        }

        analyzeButton.disabled = true;
        proposalReady = false;
        proposalPanel.style.display = "none";

        statusBox.textContent =
            "CONSULTANDO EL REPOSITORIO Y ANALIZANDO CAMBIOS...";

        try {
            const repository = await githubRequest(
                `https://api.github.com/repos/${REPOSITORY}`
            );

            const commits = await githubRequest(
                `https://api.github.com/repos/${REPOSITORY}/commits?sha=${encodeURIComponent(repository.default_branch)}&per_page=5`
            );

            if (!Array.isArray(commits) || commits.length === 0) {
                statusBox.textContent =
                    "No se encontraron cambios en el historial.";
                return;
            }

            const details = await Promise.all(
                commits.map(commit =>
                    githubRequest(
                        `https://api.github.com/repos/${REPOSITORY}/commits/${commit.sha}`
                    )
                )
            );

            if (!isAdministrator()) {
                statusBox.textContent = "ACCESO DENEGADO.";
                return;
            }

            const report = details.map(commit => {
                const files = (commit.files || [])
                    .map(file =>
                        `• ${file.filename} (${file.status})`
                    )
                    .join("\n");

                return [
                    "COMMIT: " + commit.sha.slice(0, 7),
                    commit.commit.message || "Sin mensaje",
                    "FECHA: " + getCommitDate(commit),
                    "ARCHIVOS MODIFICADOS:",
                    files || "Sin información de archivos."
                ].join("\n");
            }).join("\n\n--------------------\n\n");

            createProposal(details[0]);

            statusBox.textContent =
                "ANÁLISIS COMPLETADO\n\n" +
                report +
                "\n\nPROPUESTA PRELIMINAR GENERADA." +
                "\nREVISA Y EDITA LOS CAMPOS ANTES DE PUBLICAR.";

        } catch (error) {
            statusBox.textContent =
                "ERROR: " + error.message;

            console.error("Error en el generador:", error);

        } finally {
            analyzeButton.disabled = false;
        }
    });

    if (rejectButton) {
        rejectButton.addEventListener("click", () => {
            if (!isAdministrator()) {
                statusBox.textContent = "ACCESO DENEGADO.";
                return;
            }

            proposalReady = false;
            proposalPanel.style.display = "none";

            titleInput.value = "";
            descriptionInput.value = "";
            dateInput.value = "";

            statusBox.textContent =
                "PROPUESTA RECHAZADA.";
        });
    }

    
    if (publishButton) {
        publishButton.addEventListener("click", async () => {
            if (!isAdministrator()) {
                statusBox.textContent = "ACCESO DENEGADO.";
                return;
            }

            if (!proposalReady) {
                statusBox.textContent =
                    "NO HAY NINGUNA PROPUESTA DISPONIBLE.";
                return;
            }

            if (
                !titleInput.value.trim() ||
                !descriptionInput.value.trim() ||
                !dateInput.value
            ) {
                statusBox.textContent =
                    "COMPLETA EL TÍTULO, LA DESCRIPCIÓN Y LA FECHA.";
                return;
            }

            if (typeof db === "undefined" || !db) {
                statusBox.textContent =
                    "ERROR: SUPABASE NO ESTÁ DISPONIBLE.";
                return;
            }

            const allowedCategories = [
                "new",
                "improvement",
                "fix",
                "important",
                "content"
            ];

            if (!allowedCategories.includes(categoryInput.value)) {
                statusBox.textContent =
                    "ERROR: CATEGORÍA NO VÁLIDA.";
                return;
            }

            publishButton.disabled = true;
            statusBox.textContent =
                "VERIFICANDO AUTORIZACIÓN Y PUBLICANDO...";

            try {
                const { data: userData, error: userError } =
                    await db.auth.getUser();

                if (
                    userError ||
                    !userData.user ||
                    userData.user.id !==
                        "a899ab31-456a-40dc-b03d-af59182afd41"
                ) {
                    statusBox.textContent = "ACCESO DENEGADO.";
                    return;
                }

                const { error } = await db
                    .from("updates")
                    .insert({
                        update_id: "update-" + crypto.randomUUID(),
                        title: titleInput.value.trim(),
                        description: descriptionInput.value.trim(),
                        date: dateInput.value,
                        category: categoryInput.value
                    });

                if (error) {
                    throw error;
                }

                await loadPublishedUpdates();

                proposalReady = false;
                proposalPanel.style.display = "none";

                statusBox.textContent =
                    "¡ACTUALIZACIÓN PUBLICADA CORRECTAMENTE!";

                titleInput.value = "";
                descriptionInput.value = "";
                dateInput.value = "";

            } catch (error) {
                console.error("Error al publicar:", error);

                statusBox.textContent =
                    "ERROR AL PUBLICAR: " + error.message;

            } finally {
                publishButton.disabled = false;
            }
        });
    }


    console.log("Generador administrativo de actualizaciones cargado.");

})();



/* =================================
   INDICADOR DE ACTUALIZACIONES NUEVAS
================================= */

(() => {
    "use strict";

    const alertElement = document.getElementById("updatesEntryAlert");
    const button = document.getElementById("updatesEntryButton");

    if (!alertElement || !button || typeof profileDB === "undefined") return;

    const STORAGE_PREFIX = "archivo_updates_seen_";

    async function getViewerKey() {
        const { data } = await profileDB.auth.getUser();

        const user = data?.user || window.currentProfileUser;

        return user?.id || null;
    }

    async function getLatestUpdate() {
        const { data, error } = await profileDB
            .from("updates")
            .select("update_id,date,created_at")
            .order("date", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error("Error consultando actualizaciones:", error);
            return null;
        }

        return data;
    }

    function applyAlertColor() {
    if (window.profileHistoryReady !== true) return;

    alertElement.className = "updates-entry-alert";

    const level = window.getProfileClassificationLevel();

    const colors = {
        2: "level-2",
        3: "level-3",
        4: "level-4",
        5: "level-5"
    };

    if (colors[level]) {
        alertElement.classList.add(colors[level]);
    }
}

    async function refreshUpdatesAlert() {
        const latest = await getLatestUpdate();

        if (!latest) {
            alertElement.hidden = true;
            return;
        }

        const viewerKey = await getViewerKey();
        if (!viewerKey) {
    alertElement.hidden = true;
    return;
}
        const seenId = localStorage.getItem(
            STORAGE_PREFIX + viewerKey
        );

        applyAlertColor();

        alertElement.hidden = seenId === latest.update_id;
button.parentElement.classList.toggle(
    "has-alert",
    !alertElement.hidden
);
    }

    async function markUpdatesAsSeen() {
        const latest = await getLatestUpdate();

        if (!latest) return;

        const viewerKey = await getViewerKey();

        localStorage.setItem(
            STORAGE_PREFIX + viewerKey,
            latest.update_id
        );

        alertElement.hidden = true;
button.parentElement.classList.remove("has-alert");
    }

    button.addEventListener("click", markUpdatesAsSeen);

    profileDB.auth.onAuthStateChange(() => {
        setTimeout(refreshUpdatesAlert, 0);
    });

window.addEventListener(
    "profile-history-loaded",
    refreshUpdatesAlert
);

    refreshUpdatesAlert();

    window.refreshUpdatesEntryAlert = refreshUpdatesAlert;

    setInterval(refreshUpdatesAlert, 20000);
})();
