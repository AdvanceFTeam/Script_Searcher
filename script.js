const proxAPI = "https://scriptblox-api-proxy.vercel.app/api/fetch";
const searchproxAPI = "https://scriptblox-api-proxy.vercel.app/api/search";
const scriptsGrid = document.getElementById("scripts-grid");
const searchInput = document.getElementById("search-input");
const filter = document.getElementById("filter-select");
const search = document.getElementById("search-button");
const prev = document.getElementById("prev-button");
const next = document.getElementById("next-button");
const error_msg = document.getElementById("error-message");
const modal = document.getElementById("script-details-modal");
const modalTitle = document.getElementById("modal-title");
const modalDetails = document.getElementById("modal-details");
const closeModal = document.getElementById("close-modal");

let currentPage = 1;
let isModes = false;
let Querys = "";
let Modes = "";

async function fetchScripts(page = 1) {
    try {
        const response = await fetch(`${proxAPI}?page=${page}`);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        if (!data.result || !data.result.scripts.length) throw new Error("No scripts found.");
        displayScripts(data.result.scripts);
        error_msg.textContent = "";
    } catch (error) {
        displayError(error.message);
    }
}

async function searchScripts(query, mode, page = 1) {
    try {
        const url = new URL(searchproxAPI);
        url.searchParams.append("q", query);
        if (mode) url.searchParams.append("mode", mode);
        url.searchParams.append("page", page);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        if (!data.result || !data.result.scripts.length) throw new Error("No search results found.");
        displayScripts(data.result.scripts);
        error_msg.textContent = "";
    } catch (error) {
        displayError(error.message);
    }
}

function displayScripts(scripts) {
    scriptsGrid.innerHTML = "";
    scripts.forEach((script) => {
        const imageSrc = script.game?.imageUrl
            ? `https://scriptblox.com${script.game.imageUrl}`
            : "https://c4.wallpaperflare.com/wallpaper/673/92/53/404-not-found-anime-girls-glowing-eyes-wallpaper-thumb.jpg";
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${imageSrc}" alt="${script.title}" onerror="this.src='https://c4.wallpaperflare.com/wallpaper/673/92/53/404-not-found-anime-girls-glowing-eyes-wallpaper-thumb.jpg';">
            <div class="card-content">
                <h2 class="card-title">${script.title}</h2>
                <p class="card-game">Game: ${script.game?.name || "Universal"}</p>
            </div>
        `;
        card.addEventListener("click", () => displayDetails(script));
        scriptsGrid.appendChild(card);
    });
}

function displayDetails(script) {
    const gameName = script.game?.name || "Universal";
    const gameImage = script.game?.imageUrl
        ? `https://scriptblox.com${script.game.imageUrl}`
        : "https://c4.wallpaperflare.com/wallpaper/673/92/53/404-not-found-anime-girls-glowing-eyes-wallpaper-thumb.jpg";
    const keyLink = script.key
        ? `<a href="${script.keyLink}" target="_blank" rel="noopener noreferrer" class="key-link">Get Key</a>`
        : "No Key Required";

    if (!script.script) {
        // Redirects to the original post if no script is found 
        window.location.href = `https://scriptblox.com/script/${script.slug}`;
        return;
    }

    modalTitle.textContent = "Details";
    modalDetails.innerHTML = `
        <div class="minimal-details-card">
            <div class="details-header">
                <div class="header-image">
                    <img src="${gameImage}" alt="${gameName}" onerror="this.src='https://c4.wallpaperflare.com/wallpaper/673/92/53/404-not-found-anime-girls-glowing-eyes-wallpaper-thumb.jpg';">
                </div>
                <div class="header-info">
                    <h3>${script.title}</h3>
                    <p class="tag">${script.scriptType.charAt(0).toUpperCase() + script.scriptType.slice(1)}</p>
                    <p class="tag ${script.verified ? 'verified' : 'not-verified'}">
                        ${script.verified ? "Verified" : "Not Verified"}
                    </p>
                </div>
            </div>
            <div class="details-tags">
                <span class="tag">${gameName}</span>
                <span class="tag">${script.visibility}</span>
                <span class="tag ${script.isPatched ? 'patched' : 'active'}">
                    ${script.isPatched ? "Patched" : "Active"}
                </span>
            </div>
            <div class="details-section">
                <h4>Details</h4>
                <p><i class="fas fa-eye"></i> Views: ${script.views}</p>
                <p><i class="fas fa-calendar-alt"></i> Created At: ${new Date(script.createdAt).toLocaleString()}</p>
                <p><i class="fas fa-calendar-check"></i> Updated At: ${new Date(script.updatedAt).toLocaleString()}</p>
                <p><i class="fas fa-key"></i> Requires Key: ${keyLink}</p>
            </div>
            <div class="script-box">
                <h4>Script</h4>
                <div class="code-container">
                    <pre>${script.script || "No script available."}</pre>
                    <button class="copy-button">Copy Script</button>
                </div>
            </div>
        </div>
    `;

    const copyButton = modalDetails.querySelector(".copy-button");
    copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText(script.script || "No script available.").then(() => {
            alert("Script copied to clipboard!");
        });
    });

    modal.style.display = "flex";
}

function CClick(slug) {
    window.open(`https://scriptblox-api-proxy.vercel.app/script/${slug}`, "_blank");
}

function displayError(message) { 
    scriptsGrid.innerHTML = "";
    error_msg.textContent = message;
}

search.addEventListener("click", () => {
    Querys = searchInput.value.trim();
    Modes = filter.value;
    currentPage = 1;
    isModes = true;
    searchScripts(Querys, Modes, currentPage);
});

search.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (!query) {
        fetchHomePageScripts();
    } else {
        fetchSearchResults(query);
    }
});


prev.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        isModes ? searchScripts(Querys, Modes, currentPage) : fetchScripts(currentPage);
    }
});

next.addEventListener("click", () => {
    currentPage++;
    isModes ? searchScripts(Querys, Modes, currentPage) : fetchScripts(currentPage);
});

closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

fetchScripts();
