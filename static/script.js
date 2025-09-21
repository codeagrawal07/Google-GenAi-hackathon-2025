document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const documentText = document.getElementById('documentText');
    const fileUpload = document.getElementById('fileUpload');
    const fileName = document.getElementById('fileName');
    const pasteTab = document.getElementById('pasteTab');
    const uploadTab = document.getElementById('uploadTab');
    const pasteContainer = document.getElementById('pasteContainer');
    const uploadContainer = document.getElementById('uploadContainer');
    
    const initialState = document.getElementById('initialState');
    const loadingState = document.getElementById('loadingState');
    const resultState = document.getElementById('resultState');
    const errorState = document.getElementById('errorState');
    
    const analysisContent = document.getElementById('analysisContent');
    const sourcesContainer = document.getElementById('sourcesContainer');
    const sourcesList = document.getElementById('sourcesList');
    const errorMessage = document.getElementById('errorMessage');

    const radioLabels = document.querySelectorAll('.radio-label');

    // --- Tab Management ---
    const switchTab = (tab) => {
        if (tab === 'paste') {
            pasteTab.classList.add('bg-gray-900', 'text-white');
            pasteTab.classList.remove('text-gray-400');
            uploadTab.classList.remove('bg-gray-900', 'text-white');
            uploadTab.classList.add('text-gray-400');
            pasteContainer.classList.remove('hidden');
            uploadContainer.classList.add('hidden');
        } else { // upload
            uploadTab.classList.add('bg-gray-900', 'text-white');
            uploadTab.classList.remove('text-gray-400');
            pasteTab.classList.remove('bg-gray-900', 'text-white');
            pasteTab.classList.add('text-gray-400');
            uploadContainer.classList.remove('hidden');
            pasteContainer.classList.add('hidden');
        }
    };

    // --- UI State Management ---
    const updateUIState = (state) => {
        initialState.classList.add('hidden');
        loadingState.classList.add('hidden');
        resultState.classList.add('hidden');
        errorState.classList.add('hidden');

        switch (state) {
            case 'loading':
                loadingState.classList.remove('hidden');
                break;
            case 'result':
                resultState.classList.remove('hidden');
                break;
            case 'error':
                errorState.classList.remove('hidden');
                break;
            case 'initial':
            default:
                initialState.classList.remove('hidden');
                break;
        }
    };
    
    const updateRadioSelection = () => {
        const selected = document.querySelector('input[name="role"]:checked');
        radioLabels.forEach(label => {
            if (label.htmlFor === selected.id) {
                label.classList.add('bg-indigo-900', 'border-indigo-500', 'ring-2', 'ring-indigo-500');
                label.classList.remove('border-gray-600');
            } else {
                label.classList.remove('bg-indigo-900', 'border-indigo-500', 'ring-2', 'ring-indigo-500');
                label.classList.add('border-gray-600');
            }
        });
    };

    // --- API Call to Backend Server ---
    const callBackendApi = async (text, role) => {
        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, role })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `HTTP error! Status: ${response.status}` }));
                throw new Error(errorData.error);
            }

            return await response.json();



        } catch (error) {
            console.error('Error calling backend API:', error);
            throw error;
        }
    };

const renderInsightCard = (insight) => {
    const riskStyles = {
        'High': {
            tag: 'bg-red-800 text-red-100',
            border: 'border-red-600'
        },
        'Medium': {
            tag: 'bg-yellow-800 text-yellow-100',
            border: 'border-yellow-600'
        },
        'Low': {
            tag: 'bg-blue-800 text-blue-100',
            border: 'border-blue-600'
        },
        'Informational': {
            tag: 'bg-gray-700 text-gray-200',
            border: 'border-gray-600'
        }
    };

    const styles = riskStyles[insight.risk_level] || riskStyles['Informational'];

    return `
        <div class="bg-gray-800 border-l-4 ${styles.border} rounded-r-lg p-6">
            <h3 class="text-xl font-bold text-white">${insight.clause_name}</h3>
            
            <div class="mt-4">
                <span class="inline-block text-xs font-semibold ${styles.tag} px-3 py-1 rounded-full mb-2">${insight.risk_level} Risk</span>
                <blockquote class="bg-gray-900 border-l-4 border-gray-500 p-4 rounded-r-md text-gray-300 italic">
                    "${insight.quote}"
                </blockquote>
            </div>

            <div class="mt-4">
                <h4 class="font-semibold text-indigo-400">AI Insight</h4>
                <p class="text-gray-300 mt-1">${insight.insight}</p>
            </div>
            
            <div class="mt-4 bg-green-900/50 border border-green-700 rounded-lg p-4">
                <h4 class="font-semibold text-green-300">Suggested Change</h4>
                <p class="text-gray-300 mt-1">${insight.suggestion}</p>
            </div>
        </div>
    `;
};


const handleAnalyze = async () => {
    const text = documentText.value.trim();
    const selectedRole = document.querySelector('input[name="role"]:checked')?.value;

    if (!text || !selectedRole) {
        errorMessage.textContent = 'Please paste or upload a document and select a role before analyzing.';
        updateUIState('error');
        return;
    }

    updateUIState('loading');
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';

    // Clear previous results
    const summaryContainer = document.getElementById('summaryContainer');
    const insightsContainer = document.getElementById('insightsContainer');
    const insightsCount = document.getElementById('insightsCount');
    summaryContainer.innerHTML = '';
    insightsContainer.innerHTML = '';

    try {
        const result = await callBackendApi(text, selectedRole);

        if (result.error || !result.summary || !result.insights) {
            throw new Error(result.error || 'Invalid response structure from the analysis service.');
        }

        // Render Summary
        summaryContainer.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6">
                <h2 class="text-2xl font-bold text-white mb-2">Summary</h2>
                <p class="text-gray-300">${result.summary}</p>
            </div>
        `;

        // Render Insight Cards
        if (result.insights.length > 0) {
            insightsCount.textContent = result.insights.length;
            result.insights.forEach(insight => {
                insightsContainer.innerHTML += renderInsightCard(insight);
            });
        } else {
            insightsCount.textContent = '0';
            insightsContainer.innerHTML = `<p class="text-gray-400 text-center">No specific insights or risks were found in this document.</p>`;
        }
        
        updateUIState('result');

    } catch (error) {
        errorMessage.textContent = error.message || 'Failed to analyze the document. Please try again.';
        updateUIState('error');
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Document';
    }
};

    
    const handleClear = () => {
        documentText.value = '';
        fileUpload.value = '';
        fileName.textContent = '';
        document.getElementById('role-employee').checked = true;
        updateRadioSelection();
        updateUIState('initial');
        switchTab('paste');
    };

    const handleCopy = () => {
    const summary = document.getElementById('summaryContainer').innerText;
    const insights = document.getElementById('insightsContainer').innerText;
    const textToCopy = `Summary:\n${summary}\n\nAI Insights:\n${insights}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
        copyBtn.innerHTML = '<svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> Copied!';
        setTimeout(() => {
             copyBtn.innerHTML = '<svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25V4.5A2.25 2.25 0 019 2.25h3A2.25 2.25 0 0113.5 4.5v0c0 .212.03.418.084.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V7.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg> Copy';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
};

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) {
            fileName.textContent = '';
            return;
        }

        fileName.textContent = `Selected: ${file.name}`;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            documentText.value = e.target.result;
            switchTab('paste');
        };
        reader.onerror = () => {
            fileName.textContent = 'Error reading file.';
            documentText.value = '';
        };
        reader.readAsText(file);
    };

    // --- Event Listeners ---
    analyzeBtn.addEventListener('click', handleAnalyze);
    clearBtn.addEventListener('click', handleClear);
    copyBtn.addEventListener('click', handleCopy);
    fileUpload.addEventListener('change', handleFileSelect);
    pasteTab.addEventListener('click', () => switchTab('paste'));
    uploadTab.addEventListener('click', () => switchTab('upload'));

    document.querySelectorAll('input[name="role"]').forEach(radio => {
        radio.addEventListener('change', updateRadioSelection);
    });
    
    // --- Initial Setup ---
    updateRadioSelection();
    updateUIState('initial');
    switchTab('paste');
});
