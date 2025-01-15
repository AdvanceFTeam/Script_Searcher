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
    } try {
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
    scripts.forEach((script) => {
        let imageSrc;

        if (script.game?.imageUrl.startsWith("http")) {
            imageSrc = script.game.imageUrl;
        } else {
            imageSrc = `https://scriptblox.com${script.game?.imageUrl || ""}`;
        }

        const fallbackImage = "https://files.catbox.moe/gamwb1.jpg";

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${imageSrc}" alt="${script.title}" loading="lazy"
                onerror="this.src='${fallbackImage}';">
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
        : "https://files.catbox.moe/gamwb1.jpg";
    const keyLink = script.key
        ? `<a href="${script.keyLink}" target="_blank" rel="noopener noreferrer" class="key-link">Get Key</a>`
        : "No Key Required";

    if (!script.script) {
        window.location.href = `https://scriptblox.com/script/${script.slug}`;
        return;
    }

    modalTitle.textContent = "Details";
    modalDetails.innerHTML = `
        <div class="minimal-details-card">
            <div class="details-header">
                <div class="header-image">
                    <img src="${gameImage}" alt="${gameName}" onerror="this.src='https://files.catbox.moe/gamwb1.jpg';">
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

// function CClick(slug) {
//     window.open(`https://scriptblox-api-proxy.vercel.app/script/${slug}`, "_blank");
// }

function displayError(message) { 
    scriptsGrid.innerHTML = "";
    error_msg.textContent = message;
}

search.addEventListener("click", () => {
    Querys = searchInput.value.trim();
    Modes = filter.value;
    currentPage = 1;
    isModes = !!Querys;
    // searchScripts(Querys, Modes, currentPage);
    isModes ? searchScripts(Querys, Modes, currentPage) : fetchScripts(currentPage);
});

// search.addEventListener("click", () => {
//     const query = searchInput.value.trim();
//     if (!query) {
//         fetchScripts();
//     } else {
//         searchScripts(query, Modes, currentPage); // 1 (uh..)
//     }
// });


// let debounceTimeout;

// searchInput.addEventListener("input", () => {
//     clearTimeout(debounceTimeout);
//     debounceTimeout = setTimeout(() => {
//         const query = searchInput.value.trim();
//         if (query) {
//             searchScripts(query, filter.value, 1);
//         } else {
//             fetchScripts();
//         }
//     }, 300); 
// });

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

fetchScripts();
