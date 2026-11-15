
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
        return "Se han realizado cambios en ARCHIVO CLASIFICADO como parte del desarrollo y mantenimiento del proyecto.";
    }

    const areas = [];

    const addArea = (name, status) => {
        if (!areas.some(area => area.name === name)) {
            areas.push({ name, status });
        }
    };

    files.forEach(file => {
        const path = file.filename.toLowerCase();
        const status = file.status;

        let area = null;

        if (path.includes("profiles.js")) {
            area = "el sistema de perfiles y clasificación";
        } else if (path.includes("updates-admin.js")) {
            area = "las herramientas administrativas del Registro de Actualizaciones";
        } else if (path.includes("styles.css")) {
            area = "la apariencia visual del proyecto";
        } else if (path.includes("build.js")) {
            area = "el sistema de compilación y publicación";
        } else if (path.includes("app.js")) {
            area = "el funcionamiento general del sistema";
        } else if (path.includes("index.html")) {
            area = "la estructura y el contenido de las páginas";
        } else if (
            /(^|\/)(docs|documentos|content)(\/|$)|\.pdf$/i.test(path)
        ) {
            area = "los documentos y contenidos del proyecto";
        } else {
            area = "otros componentes del proyecto";
        }

        addArea(area, status);
    });

    const added = files.filter(file => file.status === "added").length;
    const removed = files.filter(file => file.status === "removed").length;
    const modified = files.filter(file => file.status === "modified").length;
    const renamed = files.filter(file => file.status === "renamed").length;

    let opening = "Se han realizado cambios";

    if (added > 0 && modified === 0 && removed === 0) {
        opening = "Se han incorporado nuevos elementos";
    } else if (removed > 0 && added === 0 && modified === 0) {
        opening = "Se han realizado ajustes y retirado elementos";
    } else if (modified > 0 || renamed > 0) {
        opening = "Se han realizado modificaciones y ajustes";
    }

    const areaNames = areas.map(area => area.name);

    let areaText;

    if (areaNames.length === 1) {
        areaText = areaNames[0];
    } else if (areaNames.length === 2) {
        areaText = areaNames[0] + " y " + areaNames[1];
    } else {
        areaText =
            areaNames.slice(0, -1).join(", ") +
            " y " +
            areaNames[areaNames.length - 1];
    }

    return opening + " en " + areaText +
        ", como parte del desarrollo continuo de ARCHIVO CLASIFICADO.";
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
        publishButton.addEventListener("click", () => {
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

            statusBox.textContent =
                "PUBLICACIÓN NO CONFIGURADA. " +
                "LA PROPUESTA SIGUE SIN PUBLICARSE.";
        });
    }

    console.log("Generador administrativo de actualizaciones cargado.");

})();
