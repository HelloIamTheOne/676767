
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
            secret_key: item.secretKey
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
        .select("secret_key, unlocked_at")
        .eq("user_id", user.id)
        .order("unlocked_at", { ascending: true });

    if (error) {
        console.error("Error cargando historial:", error);
        profileHistory = [];
    } else {
        profileHistory = data || [];
    }

    renderProfileSecrets();
    renderProfileTime();
    renderProfileLevels();
}

window.recordSecretUnlock = async function(secretKey) {
    if (!PROFILE_SECRETS[secretKey]) return;

    const user = window.currentProfileUser;

    if (!user) {
        queuePendingSecretUnlock(secretKey);
        return;
    }

    try {
        const { error } = await profileDB
            .from("secret_unlock_history")
            .insert({
                user_id: user.id,
                secret_key: secretKey
            });

        if (error) throw error;

        await loadProfileHistory();

    } catch (error) {
        console.error("Error registrando secreto:", error);
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
