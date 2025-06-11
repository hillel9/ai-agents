document.addEventListener('DOMContentLoaded', () => {
    const openOverlayBtn = document.getElementById('create-with-ai-btn');
    const aiAgentOverlay = document.getElementById('ai-agent-overlay');
    const closeOverlayBtn = document.querySelector('.close-overlay-button');
    const createNewAgentFromMenuBtn = document.getElementById('create-new-agent-from-menu');
    const backToMenuBtn = document.querySelector('.back-button');

    const mainMenuVew = document.getElementById('main-menu-view');
    const agentBuilderView = document.getElementById('agent-builder-view');

    const triggerList = document.getElementById('trigger-list');
    const actionList = document.getElementById('action-list');
    const generalList = document.getElementById('general-list');
    const selectedItemsPanel = document.getElementById('selected-items-panel');
    const triggerModal = document.getElementById('trigger-modal');
    const actionModal = document.getElementById('action-modal');
    const runTestButton = document.getElementById('run-test-button');
    const createAgentButton = document.getElementById('create-agent-button');
    const actionsSection = document.querySelector('.actions-section');
    const generalSection = document.querySelector('.general-section');

    function showMainMenu() {
        mainMenuVew.classList.remove('hidden');
        agentBuilderView.classList.add('hidden');
        aiAgentOverlay.classList.remove('builder-visible');
        aiAgentOverlay.classList.add('menu-visible');
    }

    function showAgentBuilder() {
        mainMenuVew.classList.add('hidden');
        agentBuilderView.classList.remove('hidden');
        aiAgentOverlay.classList.remove('menu-visible');
        aiAgentOverlay.classList.add('builder-visible');
    }

    function openOverlay() {
        aiAgentOverlay.classList.add('is-open');
        showMainMenu();
    }

    function closeOverlay() {
        aiAgentOverlay.classList.remove('is-open');
    }

    if (openOverlayBtn) {
        openOverlayBtn.addEventListener('click', openOverlay);
    }

    if (closeOverlayBtn) {
        closeOverlayBtn.addEventListener('click', closeOverlay);
    }
    
    if (createNewAgentFromMenuBtn) {
        createNewAgentFromMenuBtn.addEventListener('click', showAgentBuilder);
    }
    
    if(backToMenuBtn) {
        backToMenuBtn.addEventListener('click', showMainMenu);
    }

    // Close overlay by clicking on the backdrop
    if (aiAgentOverlay) {
        aiAgentOverlay.addEventListener('click', (e) => {
            if (e.target === aiAgentOverlay) {
                closeOverlay();
            }
        });
    }

    let currentTriggerData = null;
    let currentActionData = null;

    // --- MODAL HANDLING --- 
    function openModal(modal, title, subtitle, contentText, specificContentHTML) {
        const titleEl = modal.querySelector('h2');
        const subtitleEl = modal.querySelector('p:nth-of-type(1)'); // First p for subtitle
        const contentTextEl = modal.querySelector('p:nth-of-type(2)'); // Second p for content text
        const specificContentContainer = modal.querySelector('.modal-content div[id$="-specific-content"]');

        if (titleEl) titleEl.textContent = title;
        if (subtitleEl) subtitleEl.textContent = subtitle;
        if (contentTextEl) contentTextEl.textContent = contentText;
        if (specificContentContainer) {
            specificContentContainer.innerHTML = specificContentHTML || '';
        }
        modal.style.display = 'block';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
        const specificContentContainer = modal.querySelector('.modal-content div[id$="-specific-content"]');
        if (specificContentContainer) specificContentContainer.innerHTML = ''; // Clear specific content
    }

    // Close modals with escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (triggerModal.style.display === 'block') {
                closeModal(triggerModal);
            }
            if (actionModal.style.display === 'block') {
                closeModal(actionModal);
            }
        }
    });

    // Close modals with X button or cancel button
    [triggerModal, actionModal].forEach(modal => {
        modal.querySelector('.close-button').onclick = () => closeModal(modal);
        modal.querySelector('.cancel-button').onclick = () => closeModal(modal);
    });

    // --- TRIGGER SELECTION --- 
    triggerList.addEventListener('click', (e) => {
        const listItem = e.target.closest('li');
        if (!listItem) return;

        // Clear previous selection visuals
        triggerList.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
        listItem.classList.add('selected');
        const radio = listItem.querySelector('input[type="radio"]');
        if(radio) radio.checked = true;

        currentTriggerData = {
            type: listItem.dataset.trigger,
            title: listItem.dataset.modalTitle,
            subtitle: listItem.dataset.modalSubtitle,
            contentText: listItem.dataset.modalContent,
            icon: listItem.querySelector('.icon').textContent,
            text: listItem.innerText.split('\n')[0].replace(listItem.querySelector('.icon').textContent, '').trim(), // Get text without icon
        };

        let specificContentHTML = '';
        if (currentTriggerData.type === 'media-enters-category') {
            specificContentHTML = `
                <label for="category-select">Category:</label>
                <select id="category-select">
                    <option value="financial-tools">Mastering financial tools</option>
                    <option value="marketing-strategies">Marketing Strategies</option>
                    <option value="product-design">Product Design</option>
                </select>
            `;
        }
        // Add other trigger types here if needed

        openModal(triggerModal, currentTriggerData.title, currentTriggerData.subtitle, currentTriggerData.contentText, specificContentHTML);
    });

    // Trigger Modal Done Button
    triggerModal.querySelector('.done-button').onclick = () => {
        if (!currentTriggerData) return;

        const selectedItemsPanelPlaceholder = selectedItemsPanel.querySelector('.placeholder');
        if (selectedItemsPanelPlaceholder) {
            selectedItemsPanelPlaceholder.style.display = 'none';
        }

        let triggerDetails = '';
        if (currentTriggerData.type === 'media-enters-category') {
            const categorySelect = triggerModal.querySelector('#category-select');
            triggerDetails = `Trigger when new videos are added to ${categorySelect.options[categorySelect.selectedIndex].text}`;
        } else {
            triggerDetails = currentTriggerData.contentText;
        }

        const triggerElement = `
            <div class="selected-item trigger-item" data-type="${currentTriggerData.type}">
                <div class="icon">${currentTriggerData.icon}</div>
                <div class="selected-item-text">
                    <h4>${currentTriggerData.text}</h4>
                    <p>${triggerDetails}</p>
                </div>
            </div>
        `;
        // Remove any existing trigger before adding a new one
        const existingTrigger = selectedItemsPanel.querySelector('.trigger-item');
        if (existingTrigger) existingTrigger.remove();

        selectedItemsPanel.insertAdjacentHTML('afterbegin', triggerElement); // Add to top

        actionsSection.classList.remove('disabled');
        generalSection.classList.remove('disabled');
        runTestButton.disabled = false;
        createAgentButton.disabled = false;

        closeModal(triggerModal);
        currentTriggerData = null;
    };

    // --- ACTION SELECTION --- 
    actionList.addEventListener('click', (e) => {
        if (actionsSection.classList.contains('disabled')) return;
        const listItem = e.target.closest('li');
        if (!listItem) return;

        currentActionData = {
            type: listItem.dataset.action,
            title: listItem.dataset.modalTitle,
            subtitle: listItem.dataset.modalSubtitle,
            contentText: listItem.dataset.modalContent,
            icon: listItem.querySelector('.icon').textContent,
            text: listItem.innerText.split('\n')[0].replace(listItem.querySelector('.icon').textContent, '').replace('+', '').trim(),
        };

        let specificContentHTML = '';
        if (currentActionData.type === 'summary-chapters') {
            specificContentHTML = `
                <div class="modal-form-section">
                    <label for="summary-detail-slider">How detailed would you like the summary?</label>
                    <div class="slider-container">
                        <input type="range" id="summary-detail-slider" min="0" max="2" value="1" step="1">
                        <div class="slider-labels">
                            <span>Brief</span>
                            <span>Standard</span>
                            <span>Detailed</span>
                        </div>
                    </div>
                </div>
            `;
        } else if (currentActionData.type === 'captions') {
            specificContentHTML = `
                <div class="modal-form-section">
                    <label for="transcription-service-select">Transcription service</label>
                    <select id="transcription-service-select">
                        <option value="automatic">Automatic captioning (Machine)</option>
                    </select>
                </div>
                <div class="modal-form-section">
                    <label for="source-language-select">Source language</label>
                    <select id="source-language-select">
                        <option value="auto-detect">Auto-detect</option>
                        <option value="en-US">English (US)</option>
                        <option value="es-ES">Spanish</option>
                        <option value="fr-FR">French</option>
                        <option value="de-DE">German</option>
                    </select>
                </div>
            `;
        }

        const modalTitle = currentActionData.type === 'captions' ? 'Add captions' : currentActionData.title;
        openModal(actionModal, modalTitle, currentActionData.subtitle, currentActionData.contentText, specificContentHTML);
    });

    // Action Modal Done Button
    actionModal.querySelector('.done-button').onclick = () => {
        if (!currentActionData) return;

        const selectedItemsPanelPlaceholder = selectedItemsPanel.querySelector('.placeholder');
        if (selectedItemsPanelPlaceholder && selectedItemsPanelPlaceholder.style.display !== 'none') {
            // This case should ideally not happen if a trigger is already selected
            // but as a fallback, hide placeholder if an action is added first.
            selectedItemsPanelPlaceholder.style.display = 'none';
        }
        
        let actionDetails = '';
        if (currentActionData.type === 'summary-chapters') {
            const slider = actionModal.querySelector('#summary-detail-slider');
            const detailLevels = ['Brief', 'Standard', 'Detailed'];
            actionDetails = `Length: ${detailLevels[slider.value]}`;
        } else if (currentActionData.type === 'captions') {
            const serviceSelect = actionModal.querySelector('#transcription-service-select');
            const languageSelect = actionModal.querySelector('#source-language-select');
            const service = serviceSelect.options[serviceSelect.selectedIndex].text;
            const language = languageSelect.options[languageSelect.selectedIndex].text;
            actionDetails = `Service: ${service}, Language: ${language}`;
        } else {
            actionDetails = "Custom instructions"; // Placeholder
        }

        const actionElement = `
            <div class="selected-item action-item" data-type="${currentActionData.type}">
                <div class="icon">${currentActionData.icon}</div>
                <div class="selected-item-text">
                    <h4>${currentActionData.title}</h4>
                    <p>${actionDetails}</p>
                </div>
                <span class="action-settings-icon">⚙️</span>
            </div>
        `;
        selectedItemsPanel.appendChild(document.createRange().createContextualFragment(actionElement));

        // Hide the action from the list in the sidebar
        const actionListItem = actionList.querySelector(`li[data-action="${currentActionData.type}"]`);
        if (actionListItem) {
            actionListItem.style.display = 'none';
        }

        closeModal(actionModal);
        currentActionData = null;
    };
});
