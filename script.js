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
const S_Cache = new Map();

let currentPage = 1;
let isModes = false;
let Querys = "";
let Modes = "";

async function fetchScripts(page = 1) {
    if (S_Cache.has(page)) {
        displayScripts(S_Cache.get(page));
        return;
    }
    try {
        const response = await fetch(`${proxAPI}?page=${page}`);
        if (!response.ok) {
            if (response.status === 429) {
                throw new Error("Too many requests. Please wait a moment and try again.");
            }
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.result || !data.result.scripts.length) throw new Error("No scripts found.");

        S_Cache.set(page, data.result.scripts); // Cache result
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
        if (!response.ok) {
            if (response.status === 429) {
                throw new Error("Too many requests. Please wait a moment and try again.");
            }
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
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
    const maxTitleLength = 60;
    scripts.forEach((script) => {
        let displayTitle = script.title;
        if (displayTitle.length > maxTitleLength) {
            displayTitle = displayTitle.substring(0, maxTitleLength) + "...";
        }

        let imageSrc;
        if (script.game?.imageUrl && script.game.imageUrl.startsWith("http")) {
            imageSrc = script.game.imageUrl;
        } else {
            imageSrc = `https://scriptblox.com${script.game?.imageUrl || ""}`;
        }

        const fallbackImage = "https://files.catbox.moe/gamwb1.jpg";

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${imageSrc}" alt="${displayTitle}" loading="lazy"
                onerror="this.src='${fallbackImage}';">
            <div class="card-content">
                <h2 class="card-title">${displayTitle}</h2>
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
        ? script.game.imageUrl.startsWith("http")
            ? script.game.imageUrl
            : `https://scriptblox.com${script.game.imageUrl}`
        : "https://files.catbox.moe/gamwb1.jpg";

    if (!script.script) {
        window.location.href = `https://scriptblox.com/script/${script.slug}`;
        return;
    }
    
    const maxModalTitleLength = 20;
    const modalDisplayTitle = script.title.length > maxModalTitleLength
        ? script.title.substring(0, maxModalTitleLength) + "..."
        : script.title;
    
    modalTitle.textContent = "Script Details";
    modalDetails.innerHTML = `
        <div class="minimal-details-card">
            <div class="details-header">
                <div class="header-image">
                    <img src="${gameImage}" alt="${gameName}" onerror="this.src='https://files.catbox.moe/gamwb1.jpg';">
                </div>
                <div class="header-info">
                    <h3>${modalDisplayTitle}</h3>
                    <div class="details-tags">
                        <span class="tag ${script.verified ? 'verified' : 'not-verified'}">
                            <i class="fas fa-${script.verified ? 'check-circle' : 'times-circle'}"></i>
                            ${script.verified ? "Verified" : "Not Verified"}
                        </span>
                        <span class="tag ${script.isPatched ? 'patched' : 'active'}">
                            <i class="fas fa-${script.isPatched ? 'ban' : 'check'}"></i>
                            ${script.isPatched ? "Patched" : "Active"}
                        </span>
                        <span class="tag ${script.scriptType === 'paid' ? 'paid' : ''}">
                            <i class="fas fa-${script.scriptType === 'paid' ? 'dollar-sign' : 'code'}"></i>
                            ${script.scriptType.charAt(0).toUpperCase() + script.scriptType.slice(1)}
                        </span>
                        ${script.key ? `
                            <span class="tag key">
                                <i class="fas fa-key"></i>
                                Requires Key
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div class="details-section">
                <h4><i class="fas fa-info-circle"></i> Details</h4>
                <div class="details-info">
                    <div class="info-item">
                        <i class="fas fa-eye"></i>
                        <span>${script.views.toLocaleString()} Views</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Created: ${new Date(script.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-calendar-check"></i>
                        <span>Updated: ${new Date(script.updatedAt).toLocaleDateString()}</span>
                    </div>
                    ${script.key ? `
                        <div class="info-item">
                            <i class="fas fa-key"></i>
                            <a href="${script.keyLink}" target="_blank" rel="noopener noreferrer" style="color: white; text-decoration: underline;">Get Key</a>
                        </div>
                    ` : ''}
                </div>
            </div>

            <div class="script-box">
                <h4><i class="fas fa-code"></i> Script</h4>
                <div class="code-container">
                    <pre>${script.script || "No script available."}</pre>
                    <button class="copy-button">
                        <i class="fas fa-copy"></i>
                        Copy Script
                    </button>
                </div>
            </div>
        </div>
    `;

    const copyButton = modalDetails.querySelector(".copy-button");
    copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText(script.script || "No script available.").then(() => {
            copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy Script';
            }, 2000);
        });
    });

    modal.style.display = "flex";
}

function displayError(message) { 
    scriptsGrid.innerHTML = "";
    error_msg.textContent = message;
}

search.addEventListener("click", () => {
    Querys = searchInput.value.trim();
    Modes = filter.value;
    currentPage = 1;
    isModes = !!Querys;
    isModes ? searchScripts(Querys, Modes, currentPage) : fetchScripts(currentPage);
});

prev.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        if (isModes && Querys) {
            searchScripts(Querys, Modes, currentPage);
        } else {
            fetchScripts(currentPage);
        }
    }
});

next.addEventListener("click", () => {
    currentPage++;
    if (isModes && Querys) {
        searchScripts(Querys, Modes, currentPage);
    } else {
        fetchScripts(currentPage);
    }
});

closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

searchInput.addEventListener("focus", () => {
    searchInput.parentElement.style.transform = "scale(1.02)";
});

searchInput.addEventListener("blur", () => {
    searchInput.parentElement.style.transform = "scale(1)";
});

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        search.click();
    }
});

fetchScripts();
