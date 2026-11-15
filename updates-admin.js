
(() => {
    const REPOSITORY = "helloiamtheone/676767";

    const analyzeButton = document.getElementById("analyzeUpdatesButton");
    const statusBox = document.getElementById("updatesAnalysisStatus");

    if (!analyzeButton || !statusBox) return;

    analyzeButton.addEventListener("click", async () => {
        if (typeof isAdmin === "undefined" || !isAdmin) {
            statusBox.textContent = "ACCESO DENEGADO.";
            return;
        }

        analyzeButton.disabled = true;
        statusBox.textContent = "Consultando el repositorio...";

        try {
            const repositoryResponse = await fetch(
                `https://api.github.com/repos/${REPOSITORY}`
            );

            if (!repositoryResponse.ok) {
                throw new Error("No se pudo consultar el repositorio.");
            }

            const repository = await repositoryResponse.json();

            const commitsResponse = await fetch(
                `https://api.github.com/repos/${REPOSITORY}/commits?sha=${encodeURIComponent(repository.default_branch)}&per_page=5`
            );

            if (!commitsResponse.ok) {
                throw new Error("No se pudo consultar el historial.");
            }

            const commits = await commitsResponse.json();

            if (!commits.length) {
                statusBox.textContent = "No se encontraron cambios.";
                return;
            }

            const details = await Promise.all(
                commits.map(async commit => {
                    const response = await fetch(
                        `https://api.github.com/repos/${REPOSITORY}/commits/${commit.sha}`
                    );

                    if (!response.ok) {
                        throw new Error("No se pudieron consultar los archivos modificados.");
                    }

                    return response.json();
                })
            );

            const report = details.map(commit => {
                const files = (commit.files || [])
                    .map(file => `• ${file.filename} (${file.status})`)
                    .join("\n");

                return [
                    `COMMIT: ${commit.sha.slice(0, 7)}`,
                    commit.commit.message,
                    `FECHA: ${commit.commit.author.date}`,
                    "ARCHIVOS MODIFICADOS:",
                    files || "Sin información de archivos."
                ].join("\n");
            }).join("\n\n--------------------\n\n");

            statusBox.textContent =
                "ANÁLISIS COMPLETADO\n\n" + report;

        } catch (error) {
            statusBox.textContent = "ERROR: " + error.message;
        } finally {
            analyzeButton.disabled = false;
        }
    });
})();
