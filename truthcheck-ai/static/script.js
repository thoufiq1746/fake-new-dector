const demoData = {
    reliable: "NASA's James Webb Space Telescope has captured new high-detail infrared images of Jupiter, displaying its faint rings and aurorae in vivid detail. Scientists at the agency confirmed the observations were processed using standard scientific image enhancement techniques.",
    misleading: "Eating chocolate every single morning speeds up your metabolism and guarantees rapid weight loss, according to a recent study conducted on adult participants.",
    fake: "Scientists officially discover a miracle permanent cure for all types of aging and illness using a secret deep-sea plant extract available for public purchase next week."
};

function loadDemo(type) {
    if (demoData[type]) {
        document.getElementById('newsInput').value = demoData[type];
    }
}

document.getElementById('analyzeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const text = document.getElementById('newsInput').value.trim();
    if (!text) return;

    hideError();
    showLoading();

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to analyze text.');
        }

        renderResult(data);
    } catch (err) {
        showError(err.message);
    } finally {
        hideLoading();
    }
});

function renderResult(data) {
    const resultSection = document.getElementById('resultSection');
    const badge = document.getElementById('classificationBadge');
    
    // Status Badge & Color Class
    let statusText = "🟢 LIKELY RELIABLE";
    let statusClass = "status-RELIABLE";

    if (data.classification === "POSSIBLY_MISLEADING") {
        statusText = "🟡 POSSIBLY MISLEADING";
        statusClass = "status-MISLEADING";
    } else if (data.classification === "LIKELY_FAKE") {
        statusText = "🔴 LIKELY FAKE";
        statusClass = "status-FAKE";
    }

    badge.className = `badge-status ${statusClass}`;
    badge.innerText = statusText;

    // Score & Confidence
    document.getElementById('scoreValue').innerText = data.score;
    document.getElementById('confidenceValue').innerText = data.confidence;
    document.getElementById('summaryText').innerText = `"${data.summary}"`;

    // Render Claims
    const claimsContainer = document.getElementById('claimsList');
    claimsContainer.innerHTML = '';
    (data.claims || []).forEach(c => {
        const div = document.createElement('div');
        div.className = 'claim-item';
        div.innerHTML = `
            <div class="claim-header">
                <span>"${escapeHtml(c.claim)}"</span>
                <span class="claim-status status-${c.status}">${c.status.replace('_', ' ')}</span>
            </div>
            <p style="font-size:0.85rem; color:#475569;">${escapeHtml(c.explanation)}</p>
        `;
        claimsContainer.appendChild(div);
    });

    // Render Reasons
    const reasonsContainer = document.getElementById('reasonsList');
    reasonsContainer.innerHTML = '';
    (data.reasons || []).forEach(r => {
        const li = document.createElement('li');
        li.innerText = r;
        reasonsContainer.appendChild(li);
    });

    // Render Evidence
    const evidenceContainer = document.getElementById('evidenceList');
    evidenceContainer.innerHTML = '';
    if (data.evidence && data.evidence.length > 0) {
        data.evidence.forEach(e => {
            const div = document.createElement('div');
            div.className = 'evidence-item';
            div.innerHTML = `
                <div class="evidence-source">${escapeHtml(e.source || 'General Knowledge Context')}</div>
                <p style="font-size:0.85rem; color:#475569;">${escapeHtml(e.summary)}</p>
            `;
            evidenceContainer.appendChild(div);
        });
    } else {
        evidenceContainer.innerHTML = '<p style="font-size:0.9rem; color:#64748b;">Insufficient direct evidence sources found.</p>';
    }

    resultSection.classList.remove('hidden');
}

function showLoading() {
    document.getElementById('loadingSection').classList.remove('hidden');
    document.getElementById('resultSection').classList.add('hidden');
    
    // Animate progress steps
    const steps = ['step1', 'step2', 'step3', 'step4'];
    let idx = 0;
    steps.forEach(s => document.getElementById(s).classList.remove('active'));
    document.getElementById(steps[0]).classList.add('active');

    window.loadingInterval = setInterval(() => {
        if (idx < steps.length - 1) {
            document.getElementById(steps[idx]).classList.remove('active');
            idx++;
            document.getElementById(steps[idx]).classList.add('active');
        }
    }, 800);
}

function hideLoading() {
    clearInterval(window.loadingInterval);
    document.getElementById('loadingSection').classList.add('hidden');
}

function showError(msg) {
    const alert = document.getElementById('errorAlert');
    alert.innerText = msg;
    alert.classList.remove('hidden');
}

function hideError() {
    document.getElementById('errorAlert').classList.add('hidden');
}

function resetForm() {
    document.getElementById('newsInput').value = '';
    document.getElementById('resultSection').classList.add('hidden');
    hideError();
}

function escapeHtml(text) {
    return text ? text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';
}
