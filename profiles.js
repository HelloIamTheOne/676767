
window.profileScriptLoaded = true;

const profileDB = window.supabase.createClient(
    "https://wiwqnlhavvmhnwmoyjtw.supabase.co",
    "sb_publishable_Gv_HEVvrHYarvp6Exf5OXQ_raWWq59s",
    {
        auth: {
            storageKey: "archivo_clasificado_profile_auth",
            persistSession: true,
            autoRefreshToken: true
        }
    }
);

let profileHistory = [];
let profileLoadingId = null;
window.profileHistoryReady = false;

const PROFILE_SECRETS = {
    secret1: { name: "SECRETO 1", emblem: "🔴" },
    secret2: { name: "SECRETO 2", emblem: "🔵" },
    secret3: { name: "SECRETO 3", emblem: "⚪" }
};

function profileEmail(username) {
    return username.trim().toLowerCase() +
        "@usuarios.archivoclasificado.invalid";
}

function profileMessage(message) {
    const element = document.getElementById("profileMessage");
    if (element) element.textContent = message;
}

function profileDate(value) {
    return new Date(value).toLocaleString("es-CR", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

/* =================================
   REGISTRO
================================= */

async function registerProfile() {
    const username =
        document.getElementById("profileUsername").value.trim();

    const password =
        document.getElementById("profilePassword").value;

    if (!username || !password) {
        profileMessage("Completa ambos campos.");
        return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        profileMessage(
            "El usuario debe tener entre 3 y 20 caracteres. Usa letras, números o guion bajo."
        );
        return;
    }

    if (password.length < 6) {
        profileMessage("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    profileMessage("Creando cuenta...");

    try {
        const response = await fetch(
            "https://wiwqnlhavvmhnwmoyjtw.supabase.co/functions/v1/registrar-usuario",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": "sb_publishable_Gv_HEVvrHYarvp6Exf5OXQ_raWWq59s",
                },
                body: JSON.stringify({ username, password })
            }
        );

        const responseText = await response.text();

let result = {};

try {
    result = JSON.parse(responseText);
} catch {
    result = { error: responseText || "Respuesta no válida del servidor." };
}

if (!response.ok) {
    profileMessage(
    "Error " + response.status + ": " + responseText
);
        
    return;
}

        profileMessage(
            "Cuenta creada correctamente. Ahora puedes iniciar sesión."
        );

    } catch (error) {
        console.error("Error de registro:", error);
        profileMessage("Error de conexión.");
    }
}

/* =================================
   INICIO DE SESIÓN
================================= */

async function loginProfile() {
    const username =
        document.getElementById("profileUsername").value.trim();

    const password =
        document.getElementById("profilePassword").value;

    if (!username || !password) {
        profileMessage("Completa ambos campos.");
        return;
    }

    profileMessage("Verificando acceso...");

    const { data, error } = await profileDB.auth.signInWithPassword({
        email: profileEmail(username),
        password
    });

    if (error) {
        profileMessage("Usuario o contraseña incorrectos.");
        return;
    }

    await loadProfile(data.user);
}

/* =================================
   CARGAR PERFIL
================================= */

async function loadProfile(user) {
    if (!user) return;

    if (profileLoadingId === user.id) return;
    profileLoadingId = user.id;

    try {
        const { data, error } = await profileDB
            .from("profiles")
            .select("username, avatar_path, created_at")
            .eq("id", user.id)
            .single();

        if (error || !data) {
            console.error("Error cargando perfil:", error);
            profileMessage("No se pudo cargar el perfil.");
            return;
        }

        window.currentProfile = data;
        window.currentProfileUser = user;

        document.getElementById("profileAuthForm").style.display = "none";
        document.getElementById("profileAuthArea").style.display = "none";
        document.getElementById("userProfileArea").style.display = "flex";

document.body.classList.add("profile-session-active");
        document.getElementById("userProfileName").textContent =
            data.username;

await loadProfileAvatar();
await loadProfileHistory();
await loadUserSettings();

if (typeof window.refreshUpdatesEntryAlert === "function") {
    window.refreshUpdatesEntryAlert();
}

profileMessage("");     

    } finally {
        profileLoadingId = null;
    }
}

/* =================================
   AVATAR
================================= */


function setupAvatarInput() {
    const card = document.getElementById("userProfileCard");
    const avatar = document.getElementById("userProfileAvatar");

    if (!card || !avatar) return;

    let input = document.getElementById("profileAvatarInput");

    if (!input) {
        input = document.createElement("input");
        input.type = "file";
        input.id = "profileAvatarInput";
        input.accept = "image/png,image/jpeg,image/webp,image/gif";
        input.style.display = "none";

        input.addEventListener("change", async () => {
            const file = input.files[0];
            if (!file) return;

            await uploadProfileAvatar(file);
            input.value = "";
        });

        card.appendChild(input);
    }

    avatar.style.cursor = "pointer";
    avatar.title = "Toca para cambiar tu imagen";

    avatar.onclick = () => {
        if (confirm("¿Quieres cambiar tu imagen de perfil?")) {
            input.click();
        }
    };
}


async function loadProfileAvatar() {
    const container = document.getElementById("userProfileAvatar");
    if (!container) return;

    container.replaceChildren();

    const image = document.createElement("img");
    image.alt = "Avatar del usuario";
    image.style.width = "100%";
    image.style.height = "100%";
    image.style.objectFit = "cover";
    image.style.borderRadius = "50%";

    const path = window.currentProfile?.avatar_path;

    if (path) {
        const url = path.startsWith("http")
            ? path
            : profileDB.storage
                .from("avatars")
                .getPublicUrl(path).data.publicUrl;

        image.src = url;
        container.appendChild(image);
    } else {
        container.textContent = "?";
    }

    setupAvatarInput();
}

async function uploadProfileAvatar(file) {
    const user = window.currentProfileUser;

    if (!user) return;

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    if (!allowedTypes.includes(file.type)) {
        alert("Formato de imagen no permitido.");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no puede superar los 5 MB.");
        return;
    }

    const extension = file.name.split(".").pop().toLowerCase();
    const path = user.id + "/" + Date.now() + "." + extension;

    try {
        const { error: uploadError } = await profileDB.storage
            .from("avatars")
            .upload(path, file, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) throw uploadError;

        const { error: updateError } = await profileDB
            .from("profiles")
            .update({ avatar_path: path })
            .eq("id", user.id);

        if (updateError) throw updateError;

        window.currentProfile.avatar_path = path;

        await loadProfileAvatar();

        alert("Avatar actualizado correctamente.");

    } catch (error) {
        console.error("Error subiendo avatar:", error);
        alert("No se pudo actualizar el avatar: " + error.message);
    }
}


/* =================================
   HISTORIAL DE SECRETOS
================================= */

const PENDING_SECRET_UNLOCKS =
    "archivo_clasificado_pending_secret_unlocks";

let pendingSyncPromise = null;

function getPendingSecretUnlocks() {
    try {
        const stored = JSON.parse(
            localStorage.getItem(PENDING_SECRET_UNLOCKS) || "[]"
        );

        if (!Array.isArray(stored)) return [];

        let migrated = false;

        const pending = stored
            .map((item, index) => {
                if (typeof item === "string") {
                    migrated = true;

                    return {
                        id: "legacy_" + index + "_" + item,
                        secretKey: item
                    };
                }

                return item;
            })
            .filter(item =>
                item &&
                typeof item.id === "string" &&
                PROFILE_SECRETS[item.secretKey]
            );

        // Guarda los identificadores para que no cambien
        // cada vez que se consultan los registros pendientes.
        if (migrated) {
            savePendingSecretUnlocks(pending);
        }

        return pending;

    } catch (error) {
        console.error("Error leyendo desbloqueos pendientes:", error);
        return [];
    }
}

function savePendingSecretUnlocks(pending) {
    try {
        if (pending.length) {
            localStorage.setItem(
                PENDING_SECRET_UNLOCKS,
                JSON.stringify(pending)
            );
        } else {
            localStorage.removeItem(PENDING_SECRET_UNLOCKS);
        }

        return true;
    } catch (error) {
        console.error("Error guardando desbloqueos pendientes:", error);
        return false;
    }
}

function queuePendingSecretUnlock(secretKey) {
    if (!PROFILE_SECRETS[secretKey]) return;

    const pending = getPendingSecretUnlocks();

    pending.push({
        id: Date.now().toString(36) +
            "_" + Math.random().toString(36).slice(2),
        secretKey
    });

    savePendingSecretUnlocks(pending);
}

async function syncPendingSecretUnlocks(user) {
    if (!user) return;

    if (pendingSyncPromise) {
        await pendingSyncPromise;
        return;
    }

    pendingSyncPromise = (async () => {
        const pending = getPendingSecretUnlocks();

        if (!pending.length) return;

const records = pending.map(item => ({
    user_id: user.id,
    secret_number: Number(item.secretKey.replace("secret", ""))
}));
        const { error } = await profileDB
            .from("secret_unlock_history")
            .insert(records);

        if (error) {
            console.error(
                "Error sincronizando desbloqueos pendientes:",
                error
            );
            return;
        }

        // Solo elimina los registros que se enviaron.
        // Los desbloqueos nuevos permanecen pendientes.
        const currentPending = getPendingSecretUnlocks();

        const syncedIds = new Set(
            pending.map(item => item.id)
        );

        const remaining = currentPending.filter(
            item => !syncedIds.has(item.id)
        );

        savePendingSecretUnlocks(remaining);

    })();

    try {
        await pendingSyncPromise;
    } finally {
        pendingSyncPromise = null;
    }
}

async function loadProfileHistory() {
    const user = window.currentProfileUser;
    if (!user) return;

    await syncPendingSecretUnlocks(user);

    const { data, error } = await profileDB
    .from("secret_unlock_history")
    .select("secret_number, unlocked_at")
    .eq("user_id", user.id)
    .order("unlocked_at", { ascending: true });

    if (error) {
        console.error("Error cargando historial:", error);
        profileHistory = [];
    } else {
         profileHistory = (data || []).map(item => ({
    ...item,
    secret_key: "secret" + item.secret_number
}));

window.profileHistoryReady = true;

    }

    renderProfileSecrets();
    renderProfileTime();
    renderProfileLevels();
    updateUserSettingsAccess();

    if (typeof window.updateLevel2UI === "function") {
        window.updateLevel2UI();
    }
}

window.dispatchEvent(
    new Event("profile-history-loaded")
);

window.recordSecretUnlock = async function(secretKey) {
    if (!PROFILE_SECRETS[secretKey]) {
        alert("Error: secreto no reconocido.");
        return;
    }

    let user = window.currentProfileUser;

    if (!user) {
        const { data, error } = await profileDB.auth.getSession();

        if (error) {
            alert("Error comprobando la sesión: " + error.message);
            return;
        }

        user = data?.session?.user || null;
    }

    if (!user) {
    queuePendingSecretUnlock(secretKey);

    if (typeof window.updateLevel2UI === "function") {
        window.updateLevel2UI();
    }

    return;
}

    try {
        const { error } = await profileDB
            .from("secret_unlock_history")
            .insert({
    user_id: user.id,
    secret_number: Number(secretKey.replace("secret", ""))
});

        if (error) throw error;

        if (
            window.currentProfileUser &&
            window.currentProfileUser.id === user.id
        ) {
            await loadProfileHistory();
        }


    } catch (error) {
        console.error("Error registrando secreto:", error);
        alert("No se pudo registrar el desbloqueo: " + error.message);
        queuePendingSecretUnlock(secretKey);
    }
};
            
        
/* =================================
   SECCIÓN SECRETOS
================================= */

function renderProfileSecrets() {
    const container =
        document.getElementById("profileSecretsList");

    if (!container) return;

    container.replaceChildren();

    Object.entries(PROFILE_SECRETS).forEach(([key, secret]) => {
        const records = profileHistory.filter(
            item => item.secret_key === key
        );

        const card = document.createElement("div");
        card.className = "secret-badge" +
            (records.length ? "" : " locked");

        const title = document.createElement("strong");
        title.textContent =
            secret.emblem + " " + secret.name;

        card.appendChild(title);

        const count = document.createElement("p");
        count.textContent =
            records.length + " desbloqueo(s)";

        card.appendChild(count);

        if (records.length) {
            records.forEach(record => {
                const date = document.createElement("p");
                date.textContent = profileDate(record.unlocked_at);
                card.appendChild(date);
            });
        } else {
            const locked = document.createElement("p");
            locked.textContent = "Aún no descubierto";
            card.appendChild(locked);
        }

        container.appendChild(card);
    });
}

/* =================================
   SECCIÓN TIEMPO
================================= */

function renderProfileTime() {
    const element =
        document.getElementById("profileElapsedTime");

    if (!element || !window.currentProfile?.created_at) return;

    const created = new Date(window.currentProfile.created_at);
    const elapsed = Date.now() - created.getTime();

    const days = Math.floor(elapsed / 86400000);
    const hours = Math.floor((elapsed % 86400000) / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);

    element.textContent =
        days + " días, " +
        hours + " horas y " +
        minutes + " minutos desde tu registro.";
}

function unlockProfileGraph() {
    const input = document.getElementById("profileTimeCode");
    const message = document.getElementById("profileTimeMessage");
    const canvas = document.getElementById("profileSecretGraph");

    if (input.value.trim().toLowerCase() !== "celeste") {
        message.textContent = "Código incorrecto.";
        canvas.style.display = "none";
        return;
    }

    message.textContent = "Acceso autorizado.";
    canvas.style.display = "block";

    drawProfileGraph();
}

function drawProfileGraph() {
    const canvas = document.getElementById("profileSecretGraph");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const colors = {
        secret1: "#39FF14",
        secret2: "#87CEFA",
        secret3: "#FFFFFF"
    };

    const dates = [
        ...new Set(
            profileHistory.map(item =>
                new Date(item.unlocked_at).toLocaleDateString("es-CR")
            )
        )
    ];

    if (!dates.length) {
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "15px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            "Todavía no hay desbloqueos registrados.",
            width / 2,
            height / 2
        );
        return;
    }

    const padding = {
        left: 42,
        right: 15,
        top: 25,
        bottom: 42
    };

    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    const counts = {
        secret1: [],
        secret2: [],
        secret3: []
    };

    const cumulative = {
        secret1: 0,
        secret2: 0,
        secret3: 0
    };

    dates.forEach(date => {
        profileHistory
            .filter(item =>
                new Date(item.unlocked_at).toLocaleDateString("es-CR") === date
            )
            .forEach(item => cumulative[item.secret_key]++);

        Object.keys(counts).forEach(key => {
            counts[key].push(cumulative[key]);
        });
    });

    const maximum = Math.max(
        1,
        ...Object.values(counts).flat()
    );

    ctx.strokeStyle = "#405040";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
        const y = padding.top + graphHeight * i / 4;

        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = "#BBBBBB";
        ctx.font = "10px Arial";
        ctx.textAlign = "right";

        ctx.fillText(
            String(Math.ceil(maximum * (4 - i) / 4)),
            padding.left - 7,
            y + 4
        );
    }

    Object.entries(counts).forEach(([key, values]) => {
        ctx.beginPath();
        ctx.strokeStyle = colors[key];
        ctx.lineWidth = 2;

        values.forEach((value, index) => {
            const x = dates.length === 1
                ? padding.left + graphWidth / 2
                : padding.left +
                    graphWidth * index / (dates.length - 1);

            const y = padding.top +
                graphHeight -
                (value / maximum) * graphHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        values.forEach((value, index) => {
            const x = dates.length === 1
                ? padding.left + graphWidth / 2
                : padding.left +
                    graphWidth * index / (dates.length - 1);

            const y = padding.top +
                graphHeight -
                (value / maximum) * graphHeight;

            ctx.fillStyle = colors[key];
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    });

    ctx.font = "10px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";

    dates.forEach((date, index) => {
        if (dates.length > 6 && index % 2 !== 0) return;

        const x = dates.length === 1
            ? padding.left + graphWidth / 2
            : padding.left +
                graphWidth * index / (dates.length - 1);

        ctx.fillText(
            date,
            x,
            height - 12
        );
    });

    const legend = [
        ["Secreto 1", colors.secret1],
        ["Secreto 2", colors.secret2],
        ["Secreto 3", colors.secret3]
    ];

    ctx.textAlign = "left";
    ctx.font = "10px Arial";

    legend.forEach((item, index) => {
        const x = padding.left + index * 125;

        ctx.fillStyle = item[1];
        ctx.fillRect(x, 5, 9, 9);

        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(item[0], x + 13, 14);
    });

    renderProfile87();
}

function renderProfile87() {
    const section = document.getElementById("profileTime");
    if (!section) return;

    let indicator = document.getElementById("profile87");

    if (!indicator) {
        indicator = document.createElement("div");
        indicator.id = "profile87";
        indicator.style.display = "none";
        indicator.style.color = "#87CEFA";
        indicator.style.fontSize = "32px";
        indicator.style.fontWeight = "bold";
        indicator.style.textShadow = "0 0 12px #87CEFA";

        const graph = document.getElementById("profileSecretGraph");
        graph.parentNode.insertBefore(indicator, graph.nextSibling);
    }

    const count = profileHistory.filter(
        item => item.secret_key === "secret2"
    ).length;

    indicator.style.display = count >= 8 ? "block" : "none";
    indicator.textContent = "87";
}

/* =================================
   SECCIÓN NIVELES
================================= */

function calculateProfileLevel(total) {
    if (typeof isAdmin !== "undefined" && isAdmin) return 5;

    if (total >= 9) return 4;
    if (total >= 6) return 3;
    if (total >= 3) return 2;

    return 1;
}

window.getProfileClassificationLevel = function() {
    const registeredSecrets = profileHistory.map(
        item => item.secret_key
    );

    const pendingSecrets = getPendingSecretUnlocks().map(
        item => item.secretKey
    );

    const total = new Set([
        ...registeredSecrets,
        ...pendingSecrets
    ]).size;

    return calculateProfileLevel(total);
};

  function renderProfileLevels() {
    const current =
        document.getElementById("profileCurrentLevel");

    const next =
        document.getElementById("profileNextLevel");

    if (!current || !next) return;

    const total = new Set(
    profileHistory.map(item => item.secret_key)
).size;
    const level = calculateProfileLevel(total);

    const nextLevel = level + 1;

    current.replaceChildren();

    const label = document.createElement("div");
    label.textContent = "NIVEL DE CLASIFICACIÓN";
    current.appendChild(label);

    const number = document.createElement("div");
    number.className =
        "profile-level" + (level % 8 === 0 ? " cyan" : "");
    number.textContent = "NIVEL " + level;
    current.appendChild(number);

    if (level >= 5) {
        next.textContent =
            "CLASIFICACIÓN ADMINISTRATIVA: NIVEL MÁXIMO.";
        return;
    }

    if (level >= 4) {
        next.textContent =
            "Has alcanzado el nivel máximo disponible.";
        return;
    }

    const remaining = (level * 3) - total;

    next.replaceChildren();

    const progress = document.createElement("p");
    progress.textContent =
        "Secretos restantes para el siguiente nivel: " +
        remaining;

    const nextNumber = document.createElement("p");
    nextNumber.textContent =
        "SIGUIENTE CLASIFICACIÓN: NIVEL " + nextLevel;

    if (nextLevel % 8 === 0) {
        nextNumber.classList.add("cyan");
    }

    next.append(progress, nextNumber);
}

/* =================================
   NAVEGACIÓN
================================= */

function openProfileSection(section) {
    const sections = {
        secrets: "profileSecrets",
        time: "profileTime",
        levels: "profileLevels"
    };

    const target = sections[section];
    if (!target || !window.currentProfileUser) return;

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.querySelectorAll(".profile-section").forEach(panel => {
        panel.classList.remove("active");
    });

    document.getElementById(target).classList.add("active");

    document.getElementById("userProfileMenu")
        .classList.remove("open");

    loadProfileHistory();

    if (section === "time") {
        renderProfileTime();
    }
}

function closeProfileSection() {
    document.querySelectorAll(".profile-section").forEach(panel => {
        panel.classList.remove("active");
    });

    if (typeof window.show === "function") {
        window.show("home");
    }
}

function toggleProfileMenu() {
    document.getElementById("userProfileMenu")
        .classList.toggle("open");
}

function toggleProfileAuth() {
    const area = document.getElementById("profileAuthArea");

    area.style.display =
        area.style.display === "none" ? "block" : "none";
}

window.toggleProfileAuth = toggleProfileAuth;

/* =================================
   CERRAR SESIÓN
================================= */

async function logoutProfile() {
    const { error } = await profileDB.auth.signOut();

    if (error) {
        alert("No se pudo cerrar la sesión: " + error.message);
        return;
    }

    document.getElementById("userProfileArea").style.display = "none";
document.body.classList.remove("profile-session-active");
    document.getElementById("profileAuthArea").style.display = "none";
    document.getElementById("profileAuthForm").style.display = "block";

    document.getElementById("userProfileMenu")
        .classList.remove("open");

    document.querySelectorAll(".profile-section").forEach(panel => {
        panel.classList.remove("active");
    });

    profileHistory = [];
    window.currentProfile = null;
    window.currentProfileUser = null;
    window.currentUserSettings = {};
    window.closeUserSettingsWindow();
    renderUpdatesCustomFilterButton();

const settingsTrigger =
    document.getElementById("userSettingsTrigger");

if (settingsTrigger) {
    settingsTrigger.style.display = "none";
}

const customWindowButtons = document.getElementById(
    "updatesCustomWindowButtons"
);

if (customWindowButtons) {
    customWindowButtons.replaceChildren();
}


    if (typeof window.show === "function") {
        window.show("home");
    }
}

/* =================================
   SESIÓN PERSISTENTE
================================= */

profileDB.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
        setTimeout(() => {
            loadProfile(session.user);
        }, 0);
        } else if (event === "SIGNED_OUT") {
        document.body.classList.remove("profile-session-active");

        const profileArea = document.getElementById("userProfileArea");
        if (profileArea) {
            profileArea.style.display = "none";
        }

        window.currentProfile = null;
        window.currentProfileUser = null;
        window.currentUserSettings = {};

        profileHistory = [];
        window.profileHistoryReady = false;

        window.closeUserSettingsWindow();
        window.closeUpdatesCustomWindow();

document.getElementById("userFiltersMenuOverlay")?.remove();
document.getElementById("userFilterEditorOverlay")?.remove();

        const settingsTrigger =
            document.getElementById("userSettingsTrigger");

        if (settingsTrigger) {
            settingsTrigger.style.display = "none";
        }

        const customWindowButtons =
            document.getElementById("updatesCustomWindowButtons");

        if (customWindowButtons) {
            customWindowButtons.replaceChildren();
        }

        renderUpdatesCustomFilterButton();
    }
});



/* =================================
   CONFIGURACIONES DEL USUARIO
================================= */

const USER_SETTINGS_CATEGORIES = {
    cards: "Tarjetas",
    types: "Tipos de tarjetas",
    windows: "Ventanas desplegables",
    filters: "Filtros personalizados",
    appearance: "Apariencia",
    organization: "Organización",
    general: "General"
};

window.currentUserSettings = {};

/* COMPROBAR ACCESO */

function updateUserSettingsAccess() {
    const trigger = document.getElementById("userSettingsTrigger");
    if (!trigger) return;

    const level = window.getProfileClassificationLevel
        ? window.getProfileClassificationLevel()
        : 1;

    const allowed = !!window.currentProfileUser && level >= 2;

    trigger.style.display = allowed ? "" : "none";

    if (!allowed) {
        window.closeUserSettingsWindow();
    }
}

/* CARGAR CONFIGURACIONES */

async function loadUserSettings() {
    const user = window.currentProfileUser;
    if (!user) return;

    const { data, error } = await profileDB
        .from("profile_user_settings")
        .select("settings")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Error cargando configuraciones:", error);
        window.currentUserSettings = {};
        return;
    }

    window.currentUserSettings =
        data?.settings &&
        typeof data.settings === "object"
            ? data.settings
            : {};

    updateUserSettingsAccess();
    applyUserCardSettings();
    applyUserAppearanceSettings(); 
    applyUserTypeSettings();
    renderUpdatesCustomWindowButtons();
    renderUpdatesCustomFilterButton();
}

/* GUARDAR CONFIGURACIONES */

window.saveUserSetting = async function(category, value) {
    const user = window.currentProfileUser;

    if (!user) {
        throw new Error("Debes iniciar sesión.");
    }

    if (!Object.prototype.hasOwnProperty.call(
        USER_SETTINGS_CATEGORIES,
        category
    )) {
        throw new Error("Categoría no válida.");
    }

    const currentCategorySettings =
    window.currentUserSettings[category];

const nextCategorySettings =
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
        ? {
            ...(currentCategorySettings &&
            typeof currentCategorySettings === "object"
                ? currentCategorySettings
                : {}),
            ...value
        }
        : value;

const nextSettings = {
    ...window.currentUserSettings,
    [category]: nextCategorySettings
};


    const { error } = await profileDB
        .from("profile_user_settings")
        .upsert({
            user_id: user.id,
            settings: nextSettings,
            updated_at: new Date().toISOString()
        }, {
            onConflict: "user_id"
        });

    if (error) {
        console.error("Error guardando configuraciones:", error);
        throw error;
    }

    window.currentUserSettings = nextSettings;

    if (category === "cards") {
    applyUserCardSettings();
}


if (category === "appearance") {
    applyUserAppearanceSettings();
}


if (category === "types") {
    applyUserTypeSettings();
}


if (category === "filters") {
    applyUserTypeSettings();
    renderUpdatesCustomFilterButton();
}


if (category === "windows") {
    renderUpdatesCustomWindowButtons();
}

renderUserSettingsCategory(category);

return true;
};


/* BOTONES DE ACCESO A VENTANAS PERSONALIZADAS */

function renderUpdatesCustomWindowButtons() {
    const trigger = document.getElementById("userSettingsTrigger");
    if (!trigger) return;

    let container = document.getElementById(
        "updatesCustomWindowButtons"
    );

    if (!container) {
        container = document.createElement("div");
        container.id = "updatesCustomWindowButtons";
        trigger.insertAdjacentElement("afterend", container);
    }

    container.replaceChildren();

    const windows = window.currentUserSettings.windows?.items || [];

    windows.forEach(item => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "updates-custom-window-button";
        button.textContent = item.name;

        button.addEventListener("click", () => {
            window.openUpdatesCustomWindow(item.id);
        });

        container.appendChild(button);
    });
}


/* ABRIR VENTANA PERSONALIZADA */

window.openUpdatesCustomWindow = function(windowId) {
    const windows = window.currentUserSettings.windows?.items || [];
    const selectedWindow = windows.find(item => item.id === windowId);

    if (!selectedWindow) return;

    const container = document.getElementById("updatesList");
    if (!container) return;

    window.closeUpdatesCustomWindow();

    const overlay = document.createElement("div");
    overlay.id = "updatesCustomWindowOverlay";

    const panel = document.createElement("section");
    panel.id = "updatesCustomWindowPanel";

    const header = document.createElement("header");

    const title = document.createElement("h3");
    title.textContent = selectedWindow.name;

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "X";
    closeButton.addEventListener("click", window.closeUpdatesCustomWindow);

    header.append(title, closeButton);

    const content = document.createElement("div");
    content.id = "updatesCustomWindowContent";

    const selectedCards = selectedWindow.selectedCards || [];

    selectedCards.forEach(cardId => {
        const original = Array.from(
            container.querySelectorAll(".update-entry")
        ).find(card => card.dataset.updateId === cardId);

        if (!original || original.hidden) return;

        const copy = original.cloneNode(true);
        copy.removeAttribute("id");

        copy.querySelectorAll("[id]").forEach(element => {
            element.removeAttribute("id");
        });

        content.appendChild(copy);
    });

    if (!content.children.length) {
        const message = document.createElement("p");
        message.textContent =
            "Esta ventana todavía no tiene tarjetas visibles.";
        content.appendChild(message);
    }

    panel.append(header, content);
    overlay.appendChild(panel);

    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
            window.closeUpdatesCustomWindow();
        }
    });

    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    document.body.appendChild(overlay);
};


/* CERRAR VENTANA PERSONALIZADA */

window.closeUpdatesCustomWindow = function() {
    document.getElementById(
        "updatesCustomWindowOverlay"
    )?.remove();
};


/* OBTENER TARJETAS DEL REGISTRO DE ACTUALIZACIONES */

function getUpdatesCards() {
    const container = document.getElementById("updatesList");

    if (!container) return [];

    return Array.from(
        container.querySelectorAll(".update-entry")
    ).map(card => {
        const title = card.querySelector(".update-title, h2");

        const description = card.querySelector(
            ".update-description, .update-copy p"
        );

        const date = card.querySelector(".update-date, time");

        const type = card.querySelector(".update-type");

        return {
            id: card.dataset.updateId || "",
            title: title?.textContent.trim() || "Sin título",
            description: description?.textContent.trim() || "",
            date: date?.textContent.trim() || "",
            type: type?.textContent.trim() || ""
        };
    }).filter(card => card.id);
}


/* APLICAR CONFIGURACIONES A LAS TARJETAS */

function applyUserCardSettings() {
    const container = document.getElementById("updatesList");
    if (!container) return;

    const saved = window.currentUserSettings.cards || {};

    const settings = {
        showDescriptions: saved.showDescriptions ?? true,
        showDates: saved.showDates ?? true,
        showIdentifiers: saved.showIdentifiers ?? false,
        showSeparators: saved.showSeparators ?? true,
        density: saved.density || "normal",
        corners: saved.corners || "rounded",
        borders: saved.borders ?? true
    };

    container.querySelectorAll(".update-entry").forEach(card => {
        const description = card.querySelector(".update-description");
        const date = card.querySelector("time");
        const identifier = card.dataset.updateId;

        if (description) {
            description.hidden = !settings.showDescriptions;
        }

        if (date) {
            date.hidden = !settings.showDates;
        }

        let idElement = card.querySelector(".user-update-identifier");

        if (settings.showIdentifiers && !idElement) {
            idElement = document.createElement("small");
            idElement.className = "user-update-identifier";
            idElement.textContent = "ID: " + identifier;
            card.appendChild(idElement);
        } else if (!settings.showIdentifiers && idElement) {
            idElement.remove();
        }

        card.style.borderBottom = settings.showSeparators
            ? ""
            : "none";

        card.style.border = settings.borders
            ? ""
            : "none";

        card.style.borderRadius = settings.corners === "square"
            ? "0"
            : "";

        card.style.padding = settings.density === "compact"
            ? "12px"
            : settings.density === "spacious"
                ? "28px"
                : "";
    });
}


function applyUserAppearanceSettings() {
    const container = document.getElementById("updatesList");
    if (!container) return;

    const saved = window.currentUserSettings.appearance || {};

    const settings = {
        shadow: saved.shadow ?? 50,
        glow: saved.glow ?? 30,
        backgroundOpacity: saved.backgroundOpacity ?? 100,
        effects: saved.effects ?? 50
    };

    container.style.setProperty(
        "--user-shadow-strength",
        settings.shadow + "%"
    );

    container.style.setProperty(
        "--user-glow-strength",
        settings.glow + "%"
    );

    container.style.setProperty(
        "--user-background-opacity",
        settings.backgroundOpacity + "%"
    );

    container.style.setProperty(
        "--user-effects-strength",
        settings.effects + "%"
    );
}


/* APLICAR TIPOS Y FILTROS PERSONALIZADOS */


function applyUserTypeSettings() {
    const container = document.getElementById("updatesList");
    if (!container) return;

    const savedTypes = window.currentUserSettings.types || {};
    const savedFilters = window.currentUserSettings.filters || {};

    const filters = Array.isArray(savedFilters.items)
        ? savedFilters.items
        : [];

    const activeFilter = filters.find(
        filter => filter.id === savedFilters.activeId
    );

    const criteria = activeFilter?.criteria || {};

    const keyword = (criteria.keyword || "").trim().toLowerCase();
    const identifier = (criteria.identifier || "").trim().toLowerCase();

    const selectedTypes = Array.isArray(criteria.types)
        ? criteria.types
        : [];

    const dateFrom = criteria.dateFrom || "";
    const dateTo = criteria.dateTo || "";

    container.querySelectorAll(".update-entry").forEach(card => {
        const typeElement = card.querySelector(".update-type");
        const type = typeElement?.textContent.trim() || "";

        const typeVisible = savedTypes[type] ?? true;

        const title = card.querySelector(".update-title, h2")
            ?.textContent.trim() || "";

        const description = card.querySelector(
            ".update-description, .update-copy p"
        )?.textContent.trim() || "";

        const textMatches = !keyword ||
            (title + " " + description).toLowerCase().includes(keyword);

        const selectedTypeMatches =
            !selectedTypes.length || selectedTypes.includes(type);

        const identifierMatches = !identifier ||
            (card.dataset.updateId || "").toLowerCase().includes(identifier);

        const dateElement = card.querySelector(".update-date, time");

        let cardDate = "";

        if (dateElement) {
            const rawDate = dateElement.getAttribute("datetime") ||
                dateElement.textContent.trim();

            const parsedDate = new Date(rawDate);

            if (!Number.isNaN(parsedDate.getTime())) {
                cardDate = [
                    parsedDate.getFullYear(),
                    String(parsedDate.getMonth() + 1).padStart(2, "0"),
                    String(parsedDate.getDate()).padStart(2, "0")
                ].join("-");
            }
        }

        const dateMatches =
            (!dateFrom && !dateTo) ||
            (
                !!cardDate &&
                (!dateFrom || cardDate >= dateFrom) &&
                (!dateTo || cardDate <= dateTo)
            );

        card.hidden = !(
            typeVisible &&
            textMatches &&
            selectedTypeMatches &&
            identifierMatches &&
            dateMatches
        );
    });
}


/* MOSTRAR CATEGORÍA */

function renderUserSettingsCategory(category) {
    const content = document.getElementById(
        "userSettingsCategoryContent"
    );

    if (!content || !USER_SETTINGS_CATEGORIES[category]) return;

    content.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = USER_SETTINGS_CATEGORIES[category];

    content.appendChild(heading);

if (category === "types") {
    const cards = getUpdatesCards();
    const saved = window.currentUserSettings.types || {};

    const types = [...new Set(
        cards.map(card => card.type).filter(Boolean)
    )];

    const description = document.createElement("p");
    description.textContent =
        "Selecciona qué tipos de actualizaciones deseas mostrar.";
    content.appendChild(description);

    if (!types.length) {
        const message = document.createElement("p");
        message.textContent = "No se encontraron tipos de tarjetas.";
        content.appendChild(message);
        return;
    }

    types.forEach(type => {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = saved[type] ?? true;

        checkbox.addEventListener("change", async () => {
            try {
                await window.saveUserSetting("types", {
                    [type]: checkbox.checked
                });
            } catch (error) {
                alert("No se pudo guardar: " + error.message);
            }
        });

        label.append(checkbox, document.createTextNode(" " + type));
        content.appendChild(label);
    });

    return;
}
   

if (category === "windows") {
    const cards = getUpdatesCards();
    const saved = window.currentUserSettings.windows || {};

    const windows = Array.isArray(saved.items)
        ? saved.items
        : [];

    const description = document.createElement("p");
    description.textContent =
        "Crea ventanas independientes y selecciona las tarjetas que aparecerán en cada una.";
    content.appendChild(description);

    const createButton = document.createElement("button");
    createButton.type = "button";
    createButton.textContent = "+ CREAR VENTANA";

    createButton.addEventListener("click", async () => {
        const name = prompt("Nombre de la nueva ventana:");

        if (!name || !name.trim()) return;

        const nextWindows = [
            ...windows,
            {
                id: "window-" + Date.now(),
                name: name.trim(),
                selectedCards: []
            }
        ];

        try {
            await window.saveUserSetting("windows", {
                items: nextWindows
            });
        } catch (error) {
            alert("No se pudo crear la ventana: " + error.message);
        }
    });

    content.appendChild(createButton);

    if (windows.length > 0) {
        const deleteAllButton = document.createElement("button");

        deleteAllButton.type = "button";
        deleteAllButton.textContent = "ELIMINAR TODAS LAS VENTANAS";

        deleteAllButton.addEventListener("click", async () => {
            const confirmed = confirm(
                "¿Seguro que quieres eliminar todas tus ventanas desplegables?"
            );

            if (!confirmed) return;

            try {
                await window.saveUserSetting("windows", {
                    items: []
                });

                window.closeUpdatesCustomWindow();

                alert("Todas las ventanas han sido eliminadas.");
            } catch (error) {
                alert("No se pudieron eliminar las ventanas: " + error.message);
            }
        });

        content.appendChild(deleteAllButton);
    }

    if (!cards.length) {
        const message = document.createElement("p");
        message.textContent =
            "No hay tarjetas disponibles en el Registro.";
        content.appendChild(message);
    }

    if (!windows.length) {
        const message = document.createElement("p");
        message.textContent =
            "Todavía no has creado ninguna ventana.";
        content.appendChild(message);
        return;
    }

    windows.forEach((item) => {
        const panel = document.createElement("section");
        panel.className = "user-settings-window-item";

        const title = document.createElement("h4");
        title.textContent = item.name;

        panel.appendChild(title);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "ELIMINAR";

        deleteButton.addEventListener("click", async () => {
            const confirmed = confirm(
                `¿Seguro que quieres eliminar la ventana "${item.name}"?`
            );

            if (!confirmed) return;

            const nextWindows = windows.filter(
                win => win.id !== item.id
            );

            try {
                await window.saveUserSetting("windows", {
                    items: nextWindows
                });

                window.closeUpdatesCustomWindow();
            } catch (error) {
                alert("No se pudo eliminar la ventana: " + error.message);
            }
        });

        panel.appendChild(deleteButton);

        const selectedCards = Array.isArray(item.selectedCards)
            ? item.selectedCards
            : [];

        const cardTitle = document.createElement("p");
        cardTitle.textContent = "TARJETAS DE ESTA VENTANA";
        panel.appendChild(cardTitle);

        cards.forEach(card => {
            const label = document.createElement("label");
            const checkbox = document.createElement("input");

            checkbox.type = "checkbox";
            checkbox.checked = selectedCards.includes(card.id);

            checkbox.addEventListener("change", async () => {
                const nextWindows = [...windows];

                const nextSelected = checkbox.checked
                    ? [...selectedCards, card.id]
                    : selectedCards.filter(id => id !== card.id);

                const windowIndex = nextWindows.findIndex(
                    win => win.id === item.id
                );

                nextWindows[windowIndex] = {
                    ...item,
                    selectedCards: nextSelected
                };

                try {
                    await window.saveUserSetting("windows", {
                        items: nextWindows
                    });
                } catch (error) {
                    alert("No se pudo guardar: " + error.message);
                }
            });

            label.append(
                checkbox,
                document.createTextNode(" " + card.title)
            );

            panel.appendChild(label);
        });

        content.appendChild(panel);
    });

    return;
}       


if (category === "filters") {
    const saved = window.currentUserSettings.filters || {};
    const filters = Array.isArray(saved.items)
        ? saved.items
        : [];

    const description = document.createElement("p");

    description.textContent =
        "Crea filtros personalizados para organizar y localizar actualizaciones mediante criterios independientes.";

    content.appendChild(description);

    const createButton = document.createElement("button");

    createButton.type = "button";
    createButton.textContent = "+ CREAR FILTRO";

    createButton.addEventListener("click", async () => {
        const name = prompt("Nombre del nuevo filtro:");

        if (!name || !name.trim()) return;

        const newFilter = {
            id: "filter-" + Date.now(),
            name: name.trim(),
            createdAt: new Date().toISOString(),
            criteria: {
                keyword: "",
                types: [],
                dateFrom: "",
                dateTo: "",
                identifier: ""
            }
        };

        const nextFilters = [
            ...filters,
            newFilter
        ];

        try {
            await window.saveUserSetting("filters", {
                items: nextFilters
            });
        } catch (error) {
            alert("No se pudo crear el filtro: " + error.message);
        }
    });

    content.appendChild(createButton);

    if (filters.length > 0) {
        const deleteAllButton = document.createElement("button");

        deleteAllButton.type = "button";
        deleteAllButton.textContent = "ELIMINAR TODOS LOS FILTROS";

        deleteAllButton.addEventListener("click", async () => {
            if (!confirm(
                "¿Estás seguro de que deseas eliminar TODOS los filtros personalizados? Esta acción no se puede deshacer."
            )) {
                return;
            }

            try {
                await window.saveUserSetting("filters", {
                    items: [],
                    activeId: null
                });

                alert("Todos los filtros personalizados han sido eliminados.");
            } catch (error) {
                alert("No se pudieron eliminar los filtros: " + error.message);
            }
        });

        content.appendChild(deleteAllButton);
    }

    const message = document.createElement("p");

    message.textContent = filters.length
        ? "Tus filtros se administrarán desde el menú MOSTRAR FILTROS del Registro de actualizaciones."
        : "Todavía no has creado filtros personalizados.";

    content.appendChild(message);

    return;
}


if (category === "cards") {
    const cards = getUpdatesCards();

    const saved = window.currentUserSettings.cards || {};

    const settings = {
        showDescriptions: saved.showDescriptions ?? true,
        showDates: saved.showDates ?? true,
        showIdentifiers: saved.showIdentifiers ?? false,
        showSeparators: saved.showSeparators ?? true,
        density: saved.density || "normal",
        corners: saved.corners || "rounded",
        borders: saved.borders ?? true
    };

    const saveOption = async (key, value) => {
    try {
        await window.saveUserSetting("cards", {
            [key]: value
        });
    } catch (error) {
        alert("No se pudo guardar la configuración: " + error.message);
    }
};

    const options = document.createElement("div");
    options.id = "userSettingsCardOptions";

    const optionTitle = document.createElement("h4");
    optionTitle.textContent = "PRESENTACIÓN DE LAS TARJETAS";
    options.appendChild(optionTitle);

    const toggles = [
        ["showDescriptions", "Mostrar descripciones"],
        ["showDates", "Mostrar fechas"],
        ["showIdentifiers", "Mostrar identificadores"],
        ["showSeparators", "Mostrar separadores"],
        ["borders", "Mostrar bordes"]
    ];

    toggles.forEach(([key, label]) => {
        const row = document.createElement("label");
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = settings[key];

        checkbox.addEventListener("change", () => {
            saveOption(key, checkbox.checked);
        });

        row.append(checkbox, document.createTextNode(label));
        options.appendChild(row);
    });

    const densityLabel = document.createElement("label");
    densityLabel.textContent = "Densidad de las tarjetas";

    const density = document.createElement("select");

    [
        ["normal", "Normal"],
        ["compact", "Compacta"],
        ["spacious", "Espaciosa"]
    ].forEach(([value, label]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        density.appendChild(option);
    });

    density.value = settings.density;

    density.addEventListener("change", () => {
        saveOption("density", density.value);
    });

    densityLabel.appendChild(density);
    options.appendChild(densityLabel);

    const cornersLabel = document.createElement("label");
    cornersLabel.textContent = "Esquinas de las tarjetas";

    const corners = document.createElement("select");

    [
        ["rounded", "Redondeadas"],
        ["square", "Rectas"]
    ].forEach(([value, label]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        corners.appendChild(option);
    });

    corners.value = settings.corners;

    corners.addEventListener("change", () => {
        saveOption("corners", corners.value);
    });

    cornersLabel.appendChild(corners);
    options.appendChild(cornersLabel);

    content.appendChild(options);

    const listTitle = document.createElement("h4");
    listTitle.textContent = "TARJETAS DETECTADAS";
    content.appendChild(listTitle);

    if (!cards.length) {
        const message = document.createElement("p");
        message.textContent =
            "No hay tarjetas disponibles en el Registro.";
        content.appendChild(message);
        return;
    }

    const list = document.createElement("div");
    list.id = "userSettingsCardsList";

    cards.forEach(card => {
        const item = document.createElement("div");
        item.className = "user-settings-card-item";

        const title = document.createElement("h4");
        title.textContent = card.title;

        item.appendChild(title);

        if (settings.showDescriptions && card.description) {
            const description = document.createElement("p");
            description.textContent = card.description;
            item.appendChild(description);
        }

        if (settings.showDates && card.date) {
            const date = document.createElement("p");
            date.textContent = card.date;
            item.appendChild(date);
        }

        if (settings.showIdentifiers) {
            const identifier = document.createElement("small");
            identifier.textContent = "ID: " + card.id;
            item.appendChild(identifier);
        }

        if (card.type) {
            const type = document.createElement("p");
            type.textContent = card.type;
            item.appendChild(type);
        }

        list.appendChild(item);
    });

    content.appendChild(list);
    return;
}


if (category === "appearance") {
    const saved = window.currentUserSettings.appearance || {};

    const settings = {
        shadow: saved.shadow ?? 50,
        glow: saved.glow ?? 30,
        backgroundOpacity: saved.backgroundOpacity ?? 100,
        effects: saved.effects ?? 50
    };

    const options = document.createElement("div");
    options.id = "userSettingsAppearanceOptions";

    const title = document.createElement("h4");
    title.textContent = "PERSONALIZACIÓN VISUAL";
    options.appendChild(title);

    const controls = [
        ["shadow", "Intensidad de sombras"],
        ["glow", "Intensidad de brillo"],
        ["backgroundOpacity", "Transparencia de fondos"],
        ["effects", "Intensidad de efectos visuales"]
    ];

    controls.forEach(([key, label]) => {
    const row = document.createElement("div");
    row.className = "appearance-control";

    const header = document.createElement("div");
    header.className = "appearance-control-header";

    const name = document.createElement("span");
    name.textContent = label;

    const value = document.createElement("span");
    value.className = "appearance-control-value";
    value.textContent = settings[key] + "%";

    header.appendChild(name);
    header.appendChild(value);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = settings[key];

    slider.addEventListener("change", async () => {
        value.textContent = slider.value + "%";

        try {
            await window.saveUserSetting("appearance", {
                [key]: Number(slider.value)
            });
        } catch (error) {
            alert(
                "No se pudo guardar la configuración: " +
                error.message
            );
        }
    });

    row.appendChild(header);
    row.appendChild(slider);
    options.appendChild(row);
});


    const resetButton = document.createElement("button");
    resetButton.textContent = "RESTAURAR VALORES PREDETERMINADOS";

    resetButton.addEventListener("click", async () => {
        if (!confirm(
            "¿Restaurar todas las opciones de apariencia?"
        )) return;

        try {
            await window.saveUserSetting("appearance", {
                shadow: 50,
                glow: 30,
                backgroundOpacity: 100,
                effects: 50
            });
        } catch (error) {
            alert(
                "No se pudieron restaurar los valores: " +
                error.message
            );
        }
    });

    options.appendChild(resetButton);
    content.appendChild(options);
    return;
}


    const saved = window.currentUserSettings[category];

    if (saved === undefined) {
        const message = document.createElement("p");
        message.textContent =
            "Todavía no hay configuraciones guardadas en esta categoría.";

        content.appendChild(message);
        return;
    }

    const output = document.createElement("pre");
    output.style.whiteSpace = "pre-wrap";
    output.style.overflowWrap = "anywhere";
    output.textContent = JSON.stringify(saved, null, 2);

    content.appendChild(output);
}


/* BOTÓN PARA MOSTRAR FILTROS */

function renderUpdatesCustomFilterButton() {
    const trigger = document.getElementById("userSettingsTrigger");

    let button = document.getElementById(
        "updatesShowFiltersButton"
    );

    if (!trigger) {
        button?.remove();
        return;
    }

    const filters = window.currentUserSettings.filters?.items || [];

    const level = window.getProfileClassificationLevel
        ? window.getProfileClassificationLevel()
        : 1;

    const allowed = !!window.currentProfileUser && level >= 2;

    if (!filters.length || !allowed) {
        button?.remove();
        return;
    }

    if (!button) {
        button = document.createElement("button");
        button.id = "updatesShowFiltersButton";
        button.type = "button";
        button.className = "updates-show-filters-button";
        button.textContent = "MOSTRAR FILTROS";

        button.addEventListener("click", () => {
            window.openUserFiltersMenu();
        });

        const windowsContainer = document.getElementById(
            "updatesCustomWindowButtons"
        );

        (windowsContainer || trigger).insertAdjacentElement(
            "afterend",
            button
        );
    }
}    


function closeUserFilterOverlay(overlay) {
    if (!overlay || overlay.classList.contains("closing")) return;

    overlay.classList.add("closing");

    setTimeout(() => {
        overlay.remove();
    }, 200);
}


/* MENÚ DE FILTROS PERSONALIZADOS */

window.openUserFiltersMenu = function() {
    document.getElementById(
        "userFiltersMenuOverlay"
    )?.remove();

    const saved = window.currentUserSettings.filters || {};

    const filters = Array.isArray(saved.items)
        ? saved.items
        : [];

    if (!filters.length) return;

    const overlay = document.createElement("div");
    overlay.id = "userFiltersMenuOverlay";

    const level = window.getProfileClassificationLevel
    ? window.getProfileClassificationLevel()
    : 2;

const filterColors = {
    2: "#39ff14",
    3: "#ff3030",
    4: "#ffffff",
    5: "#87cefa"
};

const accent = filterColors[level] || "#39ff14";

overlay.style.setProperty("--filter-accent", accent);
overlay.style.setProperty(
    "--filter-glow",
    accent + "40"
);

    const panel = document.createElement("section");
    panel.id = "userFiltersMenuPanel";

    const header = document.createElement("header");

    const title = document.createElement("h2");
    title.textContent = "FILTROS PERSONALIZADOS";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "X";

    closeButton.addEventListener("click", () => {
    closeUserFilterOverlay(overlay);
});

    header.append(title, closeButton);

    const list = document.createElement("div");
    list.id = "userFiltersMenuList";

    filters.forEach(filter => {
        const card = document.createElement("article");
        card.className = "user-filter-card";

        const name = document.createElement("h3");
        name.textContent = filter.name || "Filtro sin nombre";

        const date = document.createElement("p");
        date.textContent = "CREADO: " +
            (filter.createdAt
                ? new Date(filter.createdAt).toLocaleDateString("es-CR")
                : "Fecha desconocida");

        const status = document.createElement("p");
        status.textContent =
            saved.activeId === filter.id
                ? "ESTADO: ACTIVO"
                : "ESTADO: INACTIVO";

        const actions = document.createElement("div");
        actions.className = "user-filter-card-actions";

        const activateButton = document.createElement("button");
        activateButton.type = "button";
        activateButton.textContent = "ACTIVAR";

        activateButton.addEventListener("click", async () => {
            try {
                await window.saveUserSetting("filters", {
    activeId: filter.id
});

closeUserFilterOverlay(overlay);

setTimeout(() => {
    window.openUserFiltersMenu();
}, 200);
            } catch (error) {
                alert("No se pudo activar el filtro: " + error.message);
            }
        });

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "EDITAR";

        editButton.addEventListener("click", () => {
            window.openUserFilterEditor(filter.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "ELIMINAR";

        deleteButton.addEventListener("click", async () => {
            if (!confirm("¿Eliminar este filtro personalizado?")) {
                return;
            }

            const current = window.currentUserSettings.filters || {};
            const currentItems = Array.isArray(current.items)
                ? current.items
                : [];

            const nextItems = currentItems.filter(
                item => item.id !== filter.id
            );

            try {
                await window.saveUserSetting("filters", {
                    items: nextItems,
                    activeId: current.activeId === filter.id
                        ? null
                        : current.activeId
                });

                closeUserFilterOverlay(overlay);

if (nextItems.length) {
    setTimeout(() => {
        window.openUserFiltersMenu();
    }, 200);
}
            renderUpdatesCustomFilterButton();
            } catch (error) {
                alert("No se pudo eliminar el filtro: " + error.message);
            }
        });

        actions.append(
            activateButton,
            editButton,
            deleteButton
        );

        card.append(name, date, status, actions);
        list.appendChild(card);
    });

    panel.append(header, list);
    overlay.appendChild(panel);

    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
    closeUserFilterOverlay(overlay);
     }
        });

    document.body.appendChild(overlay);
};


/* EDITOR DE FILTROS PERSONALIZADOS */

window.openUserFilterEditor = function(filterId) {
    document.getElementById(
        "userFilterEditorOverlay"
    )?.remove();

    const saved = window.currentUserSettings.filters || {};

    const filters = Array.isArray(saved.items)
        ? saved.items
        : [];

    const filter = filters.find(item => item.id === filterId);

    if (!filter) return;

    const criteria = filter.criteria || {};

    const overlay = document.createElement("div");
    overlay.id = "userFilterEditorOverlay";

    const level = window.getProfileClassificationLevel
    ? window.getProfileClassificationLevel()
    : 2;

const filterColors = {
    2: "#39ff14",
    3: "#ff3030",
    4: "#ffffff",
    5: "#87cefa"
};

const accent = filterColors[level] || "#39ff14";

overlay.style.setProperty("--filter-accent", accent);
overlay.style.setProperty(
    "--filter-glow",
    accent + "40"
);

    const panel = document.createElement("section");
    panel.id = "userFilterEditorPanel";

    const header = document.createElement("header");

    const title = document.createElement("h2");
    title.textContent = "EDITAR FILTRO";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "X";

    closeButton.addEventListener("click", () => {
    closeUserFilterOverlay(overlay);
});

    header.append(title, closeButton);

    const form = document.createElement("div");
    form.id = "userFilterEditorForm";

    /* 1. PALABRAS CLAVE */

    const keywordLabel = document.createElement("label");
    keywordLabel.textContent =
        "1. PALABRAS CLAVE EN TÍTULO O DESCRIPCIÓN";

    const keywordInput = document.createElement("input");
    keywordInput.type = "text";
    keywordInput.placeholder = "Escribe una palabra o frase...";
    keywordInput.value = criteria.keyword || "";

    keywordLabel.appendChild(keywordInput);

    /* 2. TIPOS DE ACTUALIZACIÓN */

    const typesTitle = document.createElement("h3");
    typesTitle.textContent = "2. TIPOS DE ACTUALIZACIÓN";

    const typesContainer = document.createElement("div");
    typesContainer.id = "userFilterEditorTypes";

    const availableTypes = [
        ...new Set(
            getUpdatesCards()
                .map(card => card.type)
                .filter(Boolean)
        )
    ];

    const selectedTypes = Array.isArray(criteria.types)
        ? criteria.types
        : [];

    const typeInputs = [];

    availableTypes.forEach(type => {
        const label = document.createElement("label");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = type;
        checkbox.checked = selectedTypes.includes(type);

        typeInputs.push(checkbox);

        label.append(checkbox, document.createTextNode(type));
        typesContainer.appendChild(label);
    });

    if (!availableTypes.length) {
        const emptyTypes = document.createElement("p");
        emptyTypes.textContent =
            "No se encontraron tipos de actualización.";
        typesContainer.appendChild(emptyTypes);
    }

    /* 3. INTERVALO DE FECHAS */

    const datesTitle = document.createElement("h3");
    datesTitle.textContent = "3. INTERVALO DE FECHAS";

    const dateFromLabel = document.createElement("label");
    dateFromLabel.textContent = "Desde:";

    const dateFromInput = document.createElement("input");
    dateFromInput.type = "date";
    dateFromInput.value = criteria.dateFrom || "";

    dateFromLabel.appendChild(dateFromInput);

    const dateToLabel = document.createElement("label");
    dateToLabel.textContent = "Hasta:";

    const dateToInput = document.createElement("input");
    dateToInput.type = "date";
    dateToInput.value = criteria.dateTo || "";

    dateToLabel.appendChild(dateToInput);

    /* 4. IDENTIFICADOR */

    const identifierLabel = document.createElement("label");
    identifierLabel.textContent = "4. IDENTIFICADOR";

    const identifierInput = document.createElement("input");
    identifierInput.type = "text";
    identifierInput.placeholder = "Escribe un identificador...";
    identifierInput.value = criteria.identifier || "";

    identifierLabel.appendChild(identifierInput);

    /* GUARDAR */

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.textContent = "GUARDAR CRITERIOS";

    saveButton.addEventListener("click", async () => {
        if (
            dateFromInput.value &&
            dateToInput.value &&
            dateFromInput.value > dateToInput.value
        ) {
            alert("La fecha inicial no puede ser posterior a la fecha final.");
            return;
        }

        const nextCriteria = {
            keyword: keywordInput.value.trim(),

            types: typeInputs
                .filter(input => input.checked)
                .map(input => input.value),

            dateFrom: dateFromInput.value,

            dateTo: dateToInput.value,

            identifier: identifierInput.value.trim()
        };

        const current = window.currentUserSettings.filters || {};

        const nextItems = filters.map(item =>
            item.id === filterId
                ? {
                    ...item,
                    criteria: nextCriteria
                }
                : item
        );

        try {
            await window.saveUserSetting("filters", {
                items: nextItems
            });

                        closeUserFilterOverlay(overlay);

            setTimeout(() => {
                window.openUserFiltersMenu();
            }, 200);
        } catch (error) {
            alert("No se pudieron guardar los criterios: " + error.message);
        }
    });

    form.append(
        keywordLabel,
        typesTitle,
        typesContainer,
        datesTitle,
        dateFromLabel,
        dateToLabel,
        identifierLabel,
        saveButton
    );

    panel.append(header, form);
    overlay.appendChild(panel);

    overlay.addEventListener("click", event => {
    if (event.target === overlay) {
        closeUserFilterOverlay(overlay);
    }
});

    document.body.appendChild(overlay);
};


/* SELECCIONAR CATEGORÍA */

function selectUserSettingsCategory(category) {
    if (!USER_SETTINGS_CATEGORIES[category]) return;

    const buttons = document.querySelectorAll(
        "#userSettingsCategories [data-category]"
    );

    buttons.forEach(button => {
        const selected = button.dataset.category === category;

        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
    });

    renderUserSettingsCategory(category);
}


/* ABRIR VENTANA */

window.openUserSettingsWindow = function() {
    updateUserSettingsAccess();

    const level = window.getProfileClassificationLevel
        ? window.getProfileClassificationLevel()
        : 1;

    if (!window.currentProfileUser || level < 2) return;

    const overlay = document.getElementById("userSettingsOverlay");
    if (!overlay) return;

    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");

    const selected = document.querySelector(
        "#userSettingsCategories [data-category].active"
    );

    selectUserSettingsCategory(
        selected?.dataset.category || "cards"
    );
};

/* CERRAR VENTANA */

window.closeUserSettingsWindow = function() {
    const overlay = document.getElementById("userSettingsOverlay");
    if (!overlay) return;

    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
};

/* INICIALIZAR CONTROLES */

function setupUserSettingsWindow() {
    const overlay = document.getElementById("userSettingsOverlay");
    const categories = document.getElementById("userSettingsCategories");

    if (!overlay || !categories) return;

    if (overlay.dataset.settingsReady === "true") {
        updateUserSettingsAccess();
        return;
    }

    overlay.dataset.settingsReady = "true";

    categories.querySelectorAll("[data-category]").forEach(button => {
        button.addEventListener("click", () => {
            selectUserSettingsCategory(button.dataset.category);
        });
    });

    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
            window.closeUserSettingsWindow();
        }
    });

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            overlay.classList.contains("open")
        ) {
            window.closeUserSettingsWindow();
        }
    });

    updateUserSettingsAccess();
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        setupUserSettingsWindow,
        { once: true }
    );
} else {
    setupUserSettingsWindow();
}
