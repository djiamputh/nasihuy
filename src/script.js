let settings = {};
let allApiItems = [];

const categoryIcons = {
    'Downloader': 'folder',
    'Imagecreator': 'image',
    'Openai': 'smart_toy',
    'Random': 'shuffle',
    'Search': 'search',
    'Stalker': 'visibility',
    'Tools': 'build',
    'Orderkuota': 'paid',
    'AI Tools': 'psychology'
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        settings = await loadSettings();
        setupUI();
        await loadAPIData();
        setupEventListeners();
        updateActiveUsers();
        
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage(error);
    } finally {
        // Always hide loading screen
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 1000);
    }
}

async function loadSettings() {
    try {
        const baseUrl = window.location.origin + "/settings"
        const response = await fetch(baseUrl);
        if (!response.ok) throw new Error('Settings not found');
        return await response.json();
    } catch (error) {
        return getDefaultSettings();
    }
}

function getDefaultSettings() {
    return {
        name: "Ralzz API",
        creator: "Ralzz",
        description: "Interactive API documentation with real-time testing",
        categories: [],
        theme: "dark"
    };
}

function setupUI() {
    const titleApi = document.querySelectorAll("#titleApi");
    const descApi = document.getElementById("descApi");
    
    if (titleApi) titleApi.forEach(el => {
    el.textContent = settings.name || "Ralzz API"
    });
    if (descApi) descApi.textContent = settings.description || "Interactive API documentation with real-time testing";
    
    const whatsappLink = document.getElementById('whatsappLink');
    const youtubeLink = document.getElementById('youtubeLink');
    
    if (whatsappLink) whatsappLink.href = settings.linkWhatsapp || '#';
    if (youtubeLink) youtubeLink.href = settings.linkYoutube || '#';
}

function updateActiveUsers() {
    const el = document.getElementById('activeUsers');
    if (el) {
        const users = Math.floor(Math.random() * 5000) + 1000;
        el.textContent = users.toLocaleString();
    }
}

// Save original data
let originalCategories = [];

async function loadAPIData() {
    console.log('Loading API data...');
    
    try {
        if (!settings.categories || settings.categories.length === 0) {
            console.log('No categories found, using default');
            settings.categories = [];
        }
        
        // Save original data
        originalCategories = JSON.parse(JSON.stringify(settings.categories || []));
        console.log('Original categories saved:', originalCategories.length);
        
        // Render initial data
        renderAPIData(originalCategories);
        
    } catch (error) {
        console.error('Error loading API data:', error);
        // Still render with empty data
        renderAPIData([]);
    }
}

function renderAPIData(categories) {
    console.log('Rendering API data:', categories.length, 'categories');
    
    const apiList = document.getElementById('apiList');
    if (!apiList) {
        console.error('apiList element not found!');
        return;
    }
    
    // Clear existing content
    apiList.innerHTML = '';
    
    if (!categories || categories.length === 0) {
        apiList.innerHTML = '<div class="text-center py-12 text-slate-400">No API data available</div>';
        return;
    }
    
    let html = '';
    
    categories.forEach((category, catIndex) => {
        if (!category || !category.items) return;
        
        const icon = categoryIcons[category.name] || 'folder';
        const itemCount = category.items.length || 0;
        
        html += `
        <div class="category-group" data-category="${(category.name || '').toLowerCase()}">
            <div class="mb-2">
                <div class="bg-gray-800 border border-gray-700">
                    <button onclick="toggleCategory(${catIndex})" class="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-700 transition-colors duration-150">
                        <h2 class="font-bold flex items-center">
                            <span class="material-icons text-lg mr-3 text-gray-400">${icon}</span>
                            <span class="truncate max-w-xs text-base text-slate-300">${category.name || 'Unnamed Category'}</span>
                            <span class="ml-2 text-sm text-gray-500">(${itemCount})</span>
                        </h2>
                        <span class="material-icons transition-transform duration-150 text-gray-400" id="category-icon-${catIndex}">expand_more</span>
                    </button>
                    
                    <div id="category-${catIndex}" class="hidden">`;
        
        category.items.forEach((item, endpointIndex) => {
            if (!item) return;
            
            const method = item.method || 'GET';
            const pathParts = (item.path || '').split('?');
            const path = pathParts[0] || '';
            const itemName = item.name || 'Unnamed Endpoint';
            const itemDesc = item.desc || 'No description';
            
            const statusClass = 'status-ready';

            // Bangun URL awal dengan parameter yang sudah ada (value kosong)
            let initialUrl = window.location.origin + (item.path || '');
            
            // Jika ada query string, pastikan semua parameter ada dengan value kosong
            if (item.path && item.path.includes('?')) {
                const [base, query] = item.path.split('?');
                if (query) {
                    const params = new URLSearchParams(query);
                    // Reset semua nilai menjadi string kosong
                    for (const [key] of params) {
                        params.set(key, '');
                    }
                    initialUrl = window.location.origin + base + '?' + params.toString();
                }
            }

            html += `
                        <div class="border-t border-gray-700 api-item" 
                             data-method="${method.toLowerCase()}"
                             data-path="${path}"
                             data-alias="${itemName}"
                             data-description="${itemDesc}"
                             data-category="${(category.name || '').toLowerCase()}">
                            <button onclick="toggleEndpoint(${catIndex}, ${endpointIndex})" class="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-700 transition-colors duration-150 group">
                                <div class="flex items-center min-w-0 flex-1">
                                    <span class="inline-block px-3 py-1 text-xs font-semibold text-white mr-3 flex-shrink-0 method-${method.toLowerCase()}">
                                        ${method}
                                    </span>
                                    <div class="flex flex-col min-w-0 flex-1">
                                        <span class="font-semibold truncate max-w-[90%] font-mono text-base text-slate-300 group-hover:text-white" title="${path}">${path}</span>
                                        <div class="flex items-center mt-1">
                                            <span class="text-sm text-gray-400 truncate max-w-[90%]" title="${itemName}">${itemName}</span>
                                            <span class="ml-2 px-2 py-0.5 text-xs ${statusClass}">${item.status || 'ready'}</span>
                                        </div>
                                    </div>
                                </div>
                                <span class="material-icons transition-transform duration-150 text-gray-500 group-hover:text-gray-400 flex-shrink-0" id="endpoint-icon-${catIndex}-${endpointIndex}">expand_more</span>
                            </button>
                            
                            <div id="endpoint-${catIndex}-${endpointIndex}" class="hidden bg-gray-800 p-4 border-t border-gray-700 expand-transition">
                                <div class="mb-3">
                                    <div class="text-slate-300 text-sm leading-relaxed">${itemDesc}</div>
                                </div>
                                
                                <div>
                                    <form id="form-${catIndex}-${endpointIndex}">
                                        <div class="mb-4 space-y-2" id="params-container-${catIndex}-${endpointIndex}">
                                            <!-- Parameters will be inserted here -->
                                        </div>
                                        
                                        <div class="mb-4">
                                            <div class="text-slate-300 font-bold text-sm mb-2 flex items-center">
                                                <span class="material-icons text-sm mr-1">link</span>
                                                REQUEST URL
                                            </div>
                                            
                                            <div class="flex items-center gap-2">
                                                <div class="flex-1 min-w-0 bg-gray-700 border border-gray-600 px-4 py-3 max-h-20 overflow-x-auto overflow-y-hidden">
                                                    <div class="inline-flex items-center">
                                                        <code
                                                            class="text-sm text-slate-300 whitespace-nowrap font-mono"
                                                            id="url-display-${catIndex}-${endpointIndex}"
                                                        >
                                                            ${initialUrl}
                                                        </code>
                                                        <span class="inline-block"></span>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onclick="copyUrl(${catIndex}, ${endpointIndex})"
                                                    class="shrink-0 bg-gray-700 border border-gray-600 hover:border-gray-500 hover:bg-gray-600 text-slate-300 px-4 py-3 text-sm font-medium transition-colors duration-150"
                                                >
                                                    <i class="fas fa-copy"></i>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div class="flex gap-2">
                                            <button type="button" onclick="executeRequest(event, ${catIndex}, ${endpointIndex}, '${method}', '${path}', 'application/json')" class="btn-gradient text-white px-6 py-2.5 bg-indigo-700 text-sm font-semibold flex items-center gap-2 transition-colors duration-150">
                                                <i class="fas fa-play"></i>
                                                Execute
                                            </button>
                                            <button type="button" onclick="clearResponse(${catIndex}, ${endpointIndex})" class="bg-gray-700 border border-gray-600 hover:border-gray-500 hover:bg-gray-600 text-slate-300 px-6 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors duration-150">
                                                <i class="fas fa-times"></i>
                                                Clear Result
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                <div id="response-${catIndex}-${endpointIndex}" class="hidden mt-4">
                                    <div class="text-slate-300 font-bold text-sm mb-2 flex items-center">
                                        <span class="material-icons text-sm mr-1">code</span>
                                        RESPONSE
                                    </div>
                                    <div class="bg-gray-900 border border-gray-700 overflow-hidden">
                                        <div class="px-4 py-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <span id="response-status-${catIndex}-${endpointIndex}" class="text-sm px-3 py-1 bg-green-500/20 text-green-400 font-medium">200 OK</span>
                                                <span id="response-time-${catIndex}-${endpointIndex}" class="text-sm text-gray-400">0ms</span>
                                            </div>
                                            <button onclick="copyResponse(${catIndex}, ${endpointIndex})" class="copy-btn text-gray-400 hover:text-slate-300 text-sm">
                                                <i class="fas fa-copy"></i>
                                            </button>
                                        </div>
                                        <div class="p-0 max-h-80 overflow-auto">
                                            <div class="response-media-container p-4" id="response-content-${catIndex}-${endpointIndex}"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
        });
        
        html += `</div></div></div>`;
    });
    
    apiList.innerHTML = html;
    
    // Initialize parameters for each endpoint
    setTimeout(() => {
        if (categories && categories.length > 0) {
            categories.forEach((category, catIndex) => {
                if (category && category.items) {
                    category.items.forEach((item, endpointIndex) => {
                        if (item) {
                            initializeEndpointParameters(catIndex, endpointIndex, item);
                        }
                    });
                }
            });
        }
    }, 150);
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    
    if (!searchInput) {
        console.warn('Search input not found');
        return;
    }
    
    searchInput.addEventListener('input', function() {
        handleSearch(this.value);
    });
}

function handleSearch(searchTerm) {
    const searchTermLower = (searchTerm || '').toLowerCase().trim();
    const noResults = document.getElementById('noResults');
    
    if (!searchTermLower) {
        // Return to original data
        console.log('Empty search, showing all');
        renderAPIData(originalCategories);
        if (noResults) noResults.classList.add('hidden');
        return;
    }
    
    console.log('Searching for:', searchTermLower);
    
    // Filter data
    const filteredData = [];
    
    originalCategories.forEach(category => {
        if (!category || !category.items) return;
        
        const filteredItems = [];
        
        category.items.forEach(item => {
            if (!item) return;
            
            const matches = 
                (item.name || '').toLowerCase().includes(searchTermLower) ||
                (item.desc || '').toLowerCase().includes(searchTermLower) ||
                (item.path || '').toLowerCase().includes(searchTermLower) ||
                (item.method || '').toLowerCase().includes(searchTermLower) ||
                (category.name || '').toLowerCase().includes(searchTermLower);
            
            if (matches) {
                filteredItems.push(item);
            }
        });
        
        if (filteredItems.length > 0) {
            filteredData.push({
                ...category,
                items: filteredItems
            });
        }
    });
    
    console.log('Filtered results:', filteredData.length, 'categories');
    
    if (filteredData.length === 0) {
        const apiList = document.getElementById('apiList');
        if (apiList) apiList.innerHTML = '';
        if (noResults) {
            noResults.classList.remove('hidden');
        }
    } else {
        renderAPIData(filteredData);
        if (noResults) noResults.classList.add('hidden');
    }
}

function extractParameters(path) {
    const params = [];
    if (!path) return params;
    
    const queryString = path.split('?')[1];
    
    if (!queryString) return params;
    
    try {
        const urlParams = new URLSearchParams(queryString);
        
        for (const [key, value] of urlParams) {
            // Ambil semua parameter, termasuk yang memiliki value kosong
            params.push({
                name: key,
                required: false,
                type: getParamType(key),
                description: getParamDescription(key),
                defaultValue: value // Simpan nilai default dari URL
            });
        }
    } catch (error) {
        console.error('Error parsing query string:', error);
    }
    
    return params;
}

function getParamType(paramName) {
    const types = {
        'apikey': 'string',
        'url': 'string',
        'question': 'string',
        'query': 'string',
        'prompt': 'string',
        'format': 'string',
        'quality': 'string',
        'size': 'string',
        'limit': 'number'
    };
    return types[paramName] || 'string';
}

function getParamDescription(paramName) {
    const descriptions = {
        'apikey': 'Your API key for authentication',
        'url': 'URL of the content to download/process',
        'question': 'Question or message to ask the AI',
        'query': 'Search query or keywords',
        'prompt': 'Text description for image generation',
        'format': 'Output format (mp4, mp3, jpg, png)',
        'quality': 'Video quality (360p, 720p, 1080p)',
        'size': 'Image dimensions (512x512, 1024x1024)',
        'limit': 'Number of results to return'
    };
    return descriptions[paramName] || 'Optional parameter';
}

function initializeEndpointParameters(catIndex, endpointIndex, item) {
    const paramsContainer = document.getElementById(`params-container-${catIndex}-${endpointIndex}`);
    if (!paramsContainer) return;
    
    const params = extractParameters(item.path);
    
    if (params.length === 0) {
        paramsContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-check-circle text-green-400 text-lg mb-2"></i>
                <p class="text-sm text-gray-400">No parameters required</p>
            </div>
        `;
        return;
    }
    
    let paramsHtml = '';
    params.forEach((param, index) => {
        paramsHtml += `<div>
            <label class="block text-sm font-medium text-slate-300 mb-2">${param.name}</label>
            <input 
                type="text" 
                name="${param.name}" 
                class="w-full px-3 py-2.5 border border-gray-600 text-sm focus:outline-none focus:border-indigo-500 bg-gray-700 text-slate-300 placeholder:text-slate-500"
                placeholder="Input ${param.name}..."
                id="param-${catIndex}-${endpointIndex}-${param.name}"
                autocomplete="off"
                value="${param.defaultValue || ''}"
                oninput="updateRequestUrl(${catIndex}, ${endpointIndex})"
            >
        </div>`;
    });
    
    paramsContainer.innerHTML = paramsHtml;
    
    // Update URL awal dengan parameter yang sudah ada (value kosong)
    setTimeout(() => {
        updateRequestUrl(catIndex, endpointIndex);
    }, 50);
}

function toggleCategory(index) {
    const category = document.getElementById(`category-${index}`);
    const icon = document.getElementById(`category-icon-${index}`);
    if (category && icon) {
        if (category.classList.contains('hidden')) {
            category.classList.remove('hidden');
            icon.textContent = 'expand_less';
        } else {
            category.classList.add('hidden');
            icon.textContent = 'expand_more';
        }
    }
}

function toggleEndpoint(catIndex, endpointIndex) {
    const endpoint = document.getElementById(`endpoint-${catIndex}-${endpointIndex}`);
    const icon = document.getElementById(`endpoint-icon-${catIndex}-${endpointIndex}`);
    if (endpoint && icon) {
        if (endpoint.classList.contains('hidden')) {
            endpoint.classList.remove('hidden');
            icon.textContent = 'expand_less';
        } else {
            endpoint.classList.add('hidden');
            icon.textContent = 'expand_more';
        }
    }
}

function updateRequestUrl(catIndex, endpointIndex) {
    const form = document.getElementById(`form-${catIndex}-${endpointIndex}`);
    if (!form) return { url: '', hasErrors: false };

    const urlDisplay = document.getElementById(`url-display-${catIndex}-${endpointIndex}`);
    if (!urlDisplay) return { url: '', hasErrors: false };

    let hasErrors = false;
    if (!urlDisplay.dataset.baseUrl) {
        const full = urlDisplay.textContent.trim();
        const [base, query] = full.split('?');
        urlDisplay.dataset.baseUrl = base;
        urlDisplay.dataset.defaultQuery = query || '';
    }
    const baseUrl = urlDisplay.dataset.baseUrl;
    const params = new URLSearchParams(urlDisplay.dataset.defaultQuery);

    const inputs = form.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        const name = input.name;
        const value = input.value.trim();

        input.classList.remove('border-red-500');
        
        // SELALU masukkan parameter ke URL, bahkan jika value kosong
        params.set(name, value);
    });

    const finalUrl = baseUrl + '?' + params.toString();
    urlDisplay.textContent = finalUrl;

    return { url: finalUrl, hasErrors: false };
}

async function executeRequest(event, catIndex, endpointIndex, method, path, produces) {
    event.preventDefault();
    
    const { url, hasErrors } = updateRequestUrl(catIndex, endpointIndex);
    
    const responseDiv = document.getElementById(`response-${catIndex}-${endpointIndex}`);
    const responseContent = document.getElementById(`response-content-${catIndex}-${endpointIndex}`);
    const responseStatus = document.getElementById(`response-status-${catIndex}-${endpointIndex}`);
    const responseTime = document.getElementById(`response-time-${catIndex}-${endpointIndex}`);
    
    if (!responseDiv || !responseContent || !responseStatus || !responseTime) {
        showToast('Error: Response elements not found', 'error');
        return;
    }
    
    // Tampilkan response container
    responseDiv.classList.remove('hidden');
    
    // Kosongkan konten sebelumnya dan tampilkan loader
    responseContent.innerHTML = '';
    responseContent.innerHTML = '<div class="loader mx-auto mt-10 mb-10"></div>';
    responseStatus.textContent = 'Loading...';
    responseStatus.className = 'text-sm px-3 py-1 bg-gray-600 text-slate-300 font-medium';
    responseTime.textContent = '';
    
    const startTime = Date.now();
    
    try {
        console.log('Request URL:', url);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Accept': '*/*',
                'User-Agent': 'Ralzz-API-Docs'
            }
        });
        
        const responseTimeMs = Date.now() - startTime;
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Get content type
        const contentType = response.headers.get('content-type') || '';
        
        // Update response info
        responseStatus.textContent = `${response.status} OK`;
        responseStatus.className = 'text-sm px-3 py-1 bg-green-500/20 text-green-400 font-medium';
        responseTime.textContent = `${responseTimeMs}ms`;
        
        // HAPUS LOADER SEBELUM MENAMPILKAN KONTEN
        responseContent.innerHTML = '';
        
        // IMAGE
        if (contentType.startsWith("image/")) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            responseContent.innerHTML = `
                <div class="p-4 flex justify-center">
                    <img
                        src="${blobUrl}"
                        alt="Image Response"
                        class="max-w-full max-h-80 object-contain rounded-md"
                    />
                </div>
            `;

        // AUDIO
        } else if (contentType.includes("audio/")) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            responseContent.innerHTML = `
                <div class="p-6 flex justify-center">
                    <audio
                        controls
                        class="w-full max-w-md"
                    >
                        <source src="${blobUrl}" type="${contentType}">
                    </audio>
                </div>
            `;

        // VIDEO
        } else if (contentType.includes("video/")) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            responseContent.innerHTML = `
                <div class="p-4 flex justify-center">
                    <video
                        controls
                        class="w-full max-w-xl max-h-80 object-contain rounded-md"
                    >
                        <source src="${blobUrl}" type="${contentType}">
                    </video>
                </div>
            `;

        // JSON
        } else if (contentType.includes("application/json")) {
    const data = await response.json();

    if (data && typeof data === "object" && data.error) {
        throw new Error(`API Error: ${data.error}`);
    }

    const pre = document.createElement("pre");
    pre.className = `
block w-full min-w-0
max-h-[420px]
overflow-x-auto overflow-y-auto
whitespace-pre
text-sm px-4 py-3
font-mono leading-relaxed
rounded
text-slate-300
bg-gray-900
`;
    pre.textContent = JSON.stringify(data, null, 2);

    responseContent.className = "p-4 min-w-0";
    responseContent.appendChild(pre);
} else if (contentType.includes("text/")) {
            const text = await response.text();

            const pre = document.createElement("pre");
            pre.className = "block max-w-full overflow-x-auto whitespace-pre-wrap break-words text-sm px-4 pt-3 pb-3 leading-relaxed box-border font-mono text-slate-300 bg-gray-900";
            pre.textContent = text;

            responseContent.className = "p-4";
            responseContent.appendChild(pre);

        // FALLBACK
        } else {
            const text = await response.text();

            const pre = document.createElement("pre");
            pre.className = "block max-w-full overflow-x-auto whitespace-pre-wrap break-words text-sm px-4 pt-3 pb-3 leading-relaxed box-border font-mono text-slate-300 bg-gray-900";
            pre.textContent = text;

            responseContent.className = "p-4";
            responseContent.appendChild(pre);
        }
        
        showToast('Request successful!', 'success');
        
    } catch (error) {
        console.error('API Request Error:', error);
        
        const errorMessage = error.message || 'Unknown error occurred';
        
        // HAPUS LOADER SEBELUM MENAMPILKAN ERROR
        responseContent.innerHTML = '';
        responseContent.innerHTML = `
            <div class="text-center py-10">
                <i class="fas fa-exclamation-triangle text-3xl text-gray-600 mb-4"></i>
                <div class="text-base font-medium text-slate-300 mb-2">Error Occurred</div>
                <div class="text-sm text-gray-400 px-4">${escapeHtml(errorMessage)}</div>
            </div>
        `;
        responseStatus.textContent = 'Error';
        responseStatus.className = 'text-sm px-3 py-1 bg-red-500/20 text-red-400 font-medium';
        responseTime.textContent = '0ms';
        
        showToast(`Request failed: ${errorMessage}`, 'error');
    }
}

function clearResponse(catIndex, endpointIndex) {
    const form = document.getElementById(`form-${catIndex}-${endpointIndex}`);
    const responseDiv = document.getElementById(`response-${catIndex}-${endpointIndex}`);
    
    if (!form || !responseDiv) return;
    
    // Clear inputs
    const inputs = form.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('border-red-500');
    });
    
    // Hide response
    responseDiv.classList.add('hidden');
    
    // Update URL - parameter tetap ada dengan value kosong
    updateRequestUrl(catIndex, endpointIndex);
    
    showToast('Form cleared', 'info');
}

function copyUrl(catIndex, endpointIndex) {
    const urlDisplay = document.getElementById(`url-display-${catIndex}-${endpointIndex}`);
    if (!urlDisplay) return;
    
    const url = urlDisplay.textContent.trim();
    
    navigator.clipboard.writeText(url).then(() => {
        showToast('URL copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy URL:', err);
        showToast('Failed to copy URL', 'error');
    });
}

function copyResponse(catIndex, endpointIndex) {
    const responseContent = document.getElementById(`response-content-${catIndex}-${endpointIndex}`);
    if (!responseContent) return;
    
    const text = responseContent.textContent || responseContent.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('Response copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy response:', err);
        showToast('Failed to copy response', 'error');
    });
}

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) {
        existing.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast animate-fade-in';
    
    const icon = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'info': 'fa-info-circle'
    }[type] || 'fa-info-circle';
    
    const color = {
        'success': '#34d399',
        'error': '#f87171',
        'info': '#60a5fa'
    }[type] || '#60a5fa';
    
    toast.innerHTML = `
        <i class="fas ${icon} text-base" style="color: ${color}"></i>
        <span class="text-slate-300 font-medium">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showErrorMessage(err = undefined) {
    const loadingScreen = document.getElementById('loadingScreen');
    if (!loadingScreen) return;
    
    loadingScreen.innerHTML = `
        <div class="text-center">
            <i class="fas fa-wifi text-4xl text-gray-600 mb-6"></i>
            <p class="text-base text-slate-400 mb-2">${err ? err : "Using demo configuration"}</p>
            <p class="text-sm text-gray-500">Please check your connection</p>
        </div>
    `;
    
    // Reset settings
    settings = getDefaultSettings();
    setupUI();
    
    // Load empty data
    originalCategories = [];
    renderAPIData([]);
    
    // Setup event listeners
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            handleSearch(this.value);
        });
    }
    
    updateActiveUsers();
    
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.style.display = 'none', 300);
    }, 1500);
}

// Global functions
window.toggleCategory = toggleCategory;
window.toggleEndpoint = toggleEndpoint;
window.executeRequest = executeRequest;
window.clearResponse = clearResponse;
window.copyUrl = copyUrl;
window.copyResponse = copyResponse;
window.updateRequestUrl = updateRequestUrl;