document.addEventListener('DOMContentLoaded', () => {
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
            triggerDetails = `Category: ${categorySelect.options[categorySelect.selectedIndex].text}`;
        }

        const triggerElement = `
            <div class="selected-item trigger-item" data-type="${currentTriggerData.type}">
                <h4>${currentTriggerData.icon} ${currentTriggerData.subtitle}</h4>
                <p>${currentTriggerData.text}${triggerDetails ? ': ' + triggerDetails : ''}</p>
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
                <div class="radio-group">
                    <label><input type="radio" name="summary-detail" value="brief"> Brief</label>
                    <label><input type="radio" name="summary-detail" value="standard" checked> Standard</label>
                    <label><input type="radio" name="summary-detail" value="detailed"> Detailed</label>
                </div>
            `;
        }
        // Add other action types here

        openModal(actionModal, currentActionData.title, currentActionData.subtitle, currentActionData.contentText, specificContentHTML);
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
            const selectedDetail = actionModal.querySelector('input[name="summary-detail"]:checked');
            actionDetails = `Length: ${selectedDetail.value.charAt(0).toUpperCase() + selectedDetail.value.slice(1)}`;
        }

        const actionElement = `
            <div class="selected-item action-item" data-type="${currentActionData.type}">
                <h4>${currentActionData.icon} ${currentActionData.text}</h4>
                <p>${actionDetails}</p>
                 <span class="action-settings-icon">⚙️</span>
            </div>
        `;
        selectedItemsPanel.appendChild(document.createRange().createContextualFragment(actionElement));

        closeModal(actionModal);
        currentActionData = null;
    };
});
