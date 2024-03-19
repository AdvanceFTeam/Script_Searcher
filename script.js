document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.getElementById('search-form');
  const resultsDiv = document.getElementById('results');
  const loadMoreButton = document.getElementById('load-more');
  const darkModeButton = document.getElementById('dark-mode-toggle');

  let currentPage = 1;

  async function fetchScripts(page) {
    const searchInput = document.getElementById('search-input').value;
    const modeSelect = document.getElementById('mode-select').value;

    try {
      const response = await fetch(`https://scriptblox.com/api/script/search?q=${searchInput}&script%20name=5&mode=${modeSelect}&page=${page}`);
      const data = await response.json();

      resultsDiv.innerHTML = '';

      if (data?.result?.scripts) {
        data.result.scripts.forEach(script => {
          const scriptDiv = createScriptCard(script);
          resultsDiv.appendChild(scriptDiv);
        });

        currentPage = page;

        loadMoreButton.style.display = currentPage < data.result.totalPages ? 'block' : 'none';
      } else {
        resultsDiv.innerHTML = '<p>No scripts found.</p>';
        loadMoreButton.style.display = 'none';
      }
    } catch (error) {
      console.error('Error fetching scripts:', error);
      resultsDiv.innerHTML = '<p>An error occurred while fetching scripts.</p>';
      loadMoreButton.style.display = 'none';
    }
  }

  function createScriptCard(script) {
    const scriptDiv = document.createElement('div');
    scriptDiv.classList.add('script-card');

    const imageSrc = script.game.imageUrl ? `https://scriptblox.com${script.game.imageUrl}` : './404.jpg';
    const keyLink = script.key ? `<a href="${script.keyLink}">Get Key</a>` : 'No';

    scriptDiv.innerHTML = `
        <h3><a href="https://scriptblox.com/script/${script.slug}">${script.title}</a></h3>
        <img src="${imageSrc}" alt="Game Image" onerror="this.src='./404.jpg';" />
        <div class="script-content-container">
            <p>Game: ${script.game.name}</p>
            <p>Script Type: ${script.scriptType}</p>
            <p>Views: ${script.views}</p>
            <p>Created At: ${new Date(script.createdAt).toLocaleString()}</p>
            <p>Updated At: ${new Date(script.updatedAt).toLocaleString()}</p>
            <p>Verified: ${script.verified ? 'Yes' : 'No'}</p>
            <p>Key Required: ${keyLink}</p>
            <div class="script-text-container">
                <p>Script: <span id="script-content">${script.script}</span></p>
                <button class="copy-button">Copy</button>
            </div>
        </div>
    `;

    // you can see what it does 
    const copyButton = scriptDiv.querySelector('.copy-button');
    copyButton.addEventListener('click', handleCopyButtonClick.bind(null, scriptDiv));

    return scriptDiv;
  }


  function handleCopyButtonClick(scriptDiv) {
    const scriptContent = scriptDiv.querySelector('#script-content');
    navigator.clipboard.writeText(scriptContent.textContent)
      .then(() => {
        const copyButton = scriptDiv.querySelector('.copy-button');
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      })
      .catch(err => console.error('Copy failed:', err));
  }

  searchForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    resultsDiv.innerHTML = '';
    loadMoreButton.style.display = 'none';
    await fetchScripts(1);
  });

  loadMoreButton.addEventListener('click', async function() {
    await fetchScripts(currentPage + 1);
  });

  // Dark mode toggle function
  function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    document.querySelectorAll('.container, .header, .search-section, .form-group, .results-section, .footer').forEach(element => {
      element.classList.toggle('dark-mode', isDarkMode);
    });
    darkModeButton.classList.toggle('moon-icon', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
  }

  if (darkModeButton) {
    darkModeButton.addEventListener('click', toggleDarkMode);
  }

  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    toggleDarkMode();
  }
});
