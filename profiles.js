
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

const settingsTrigger =
    document.getElementById("userSettingsTrigger");

if (settingsTrigger) {
    settingsTrigger.style.display = "none";
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
       document.body.classList.remove("profile-session-active"); document.getElementById("userProfileArea").style.display = "none";

        window.currentProfile = null;
        window.currentProfileUser = null;
        profileHistory = [];
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

    const nextSettings = {
        ...window.currentUserSettings,
        [category]: value
    };

    if (category === "cards") {
    applyUserCardSettings();
}

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

    renderUserSettingsCategory(category);

    return true;
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
                ...settings,
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
