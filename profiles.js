window.profileScriptLoaded = true;

const profileDB = window.supabase.createClient(
    "https://wiwqnlhavvmhnwmoyjtw.supabase.co",
    "sb_publishable_vQHchnFMXr4K5NuWYZD3HA_bXXpyHxZ",
    {
        auth: {
            storageKey: "archivo_clasificado_profile_auth",
            persistSession: true,
            autoRefreshToken: true
        }
    }
);

function profileEmail(username) {
    return username.trim().toLowerCase() +
        "@usuarios.archivoclasificado.invalid";
}

function profileMessage(message) {
    document.getElementById("profileMessage").textContent = message;
}

async function registerProfile() {
    alert("La función registerProfile se está ejecutando");
    const username = document.getElementById("profileUsername").value.trim();
    const username = document.getElementById("profileUsername").value.trim();
    const password = document.getElementById("profilePassword").value;

    if (!username || !password) {
        profileMessage("Completa ambos campos.");
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
                    "apikey": "sb_publishable_vQHchnFMXr4K5NuWYZD3HA_bXXpyHxZ",
                    "Authorization": "Bearer sb_publishable_vQHchnFMXr4K5NuWYZD3HA_bXXpyHxZ"
                },
                body: JSON.stringify({ username, password })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            profileMessage(result.error || "No se pudo crear la cuenta.");
            return;
        }

        profileMessage("Cuenta creada. Ahora puedes iniciar sesión.");

    } catch (error) {
        console.error(error);
        profileMessage("Error de conexión.");
    }
}

async function loginProfile() {
    const username = document.getElementById("profileUsername").value.trim();
    const password = document.getElementById("profilePassword").value;

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

async function loadProfile(user) {
    const { data, error } = await profileDB
        .from("profiles")
        .select("username, avatar_path, created_at")
        .eq("id", user.id)
        .single();

    if (error || !data) {
        profileMessage("No se pudo cargar el perfil.");
        return;
    }

    document.getElementById("profileAuthForm").style.display = "none";
    document.getElementById("userProfileArea").style.display = "flex";
    document.getElementById("userProfileName").textContent = data.username;

    profileMessage("");

    window.currentProfile = data;
    window.currentProfileUser = user;
}

async function logoutProfile() {
    await profileDB.auth.signOut();

    document.getElementById("userProfileArea").style.display = "none";
    document.getElementById("profileAuthForm").style.display = "block";
    document.getElementById("userProfileMenu").classList.remove("open");

    window.currentProfile = null;
    window.currentProfileUser = null;
}

function toggleProfileMenu() {
    document.getElementById("userProfileMenu")
        .classList.toggle("open");
}

function openProfileSection(section) {
    profileMessage("La sección estará disponible en la siguiente etapa.");
}

profileDB.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
        loadProfile(session.user);
    } else if (event === "SIGNED_OUT") {
        document.getElementById("userProfileArea").style.display = "none";
        document.getElementById("profileAuthForm").style.display = "block";
    }
});
