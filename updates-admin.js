
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
        const message = (commit.commit.message || "")
            .trim();

        const files = commit.files || [];

        const fileList = files.length
            ? files.map(file => {
                return "- " + file.filename +
                    " (" + file.status + ")";
            }).join("\n")
            : "No se obtuvo información de los archivos.";

        const additions = files.reduce(
            (total, file) => total + (file.additions || 0),
            0
        );

        const deletions = files.reduce(
            (total, file) => total + (file.deletions || 0),
            0
        );

        return [
            "RESUMEN DEL CAMBIO",
            message || "Sin descripción en el commit.",
            "",
            "ARCHIVOS MODIFICADOS",
            fileList,
            "",
            "ESTADÍSTICAS",
            "Archivos afectados: " + files.length,
            "Líneas añadidas: " + additions,
            "Líneas eliminadas: " + deletions,
            "",
            "INFORMACIÓN DEL COMMIT",
            "Identificador: " + commit.sha.slice(0, 7),
            "",
            "Esta propuesta se ha generado a partir del historial de GitHub.",
            "El administrador debe revisar y editar su contenido antes de publicarla."
        ].join("\n");
    }

    function createProposal(commit) {
        titleInput.value = createTitle(commit);
        descriptionInput.value = createDescription(commit);
        dateInput.value = getCommitDate(commit);
        categoryInput.value = detectCategory(commit);

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
