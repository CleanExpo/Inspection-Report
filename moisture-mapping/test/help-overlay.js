class HelpOverlay {
    constructor() {
        this.createOverlay();
        this.setupTips();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'help-overlay hidden';
        
        // Create help content
        const content = document.createElement('div');
        content.className = 'help-content';
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-help';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => this.hide();
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = 'Sketch Tool Help';
        
        content.appendChild(closeBtn);
        content.appendChild(title);
        
        // Add sections
        const sections = this.createHelpSections();
        sections.forEach(section => content.appendChild(section));
        
        this.overlay.appendChild(content);
        document.body.appendChild(this.overlay);
    }

    createHelpSections() {
        return [
            {
                title: 'Getting Started',
                items: [
                    'Click "Start Voice" to enable voice commands',
                    'Use two fingers to pinch and zoom on tablets',
                    'Double-tap to reset the view',
                    'Click and drag to draw walls'
                ]
            },
            {
                title: 'Voice Commands',
                items: [
                    '"Add wall" - Switch to wall drawing mode',
                    '"Add door" - Switch to door placement mode',
                    '"Add window" - Switch to window placement mode',
                    '"Moisture reading" - Add moisture measurement',
                    '"Measure" - Measure distances',
                    '"Undo" - Undo last action',
                    '"Redo" - Redo last action'
                ]
            },
            {
                title: 'Moisture Readings',
                items: [
                    'Dry (≤15%) - Safe level per IICRC S500',
                    'Moderate (16-30%) - Requires monitoring',
                    'Wet (>30%) - Immediate action required',
                    'Click to add readings in moisture mode',
                    'Use voice command "moisture reading here"'
                ]
            },
            {
                title: 'IICRC Standards',
                items: [
                    'Follow S500 guidelines for moisture levels',
                    'Document all affected areas',
                    'Record equipment placement',
                    'Note material types and conditions'
                ]
            },
            {
                title: 'Tips & Tricks',
                items: [
                    'Use grid for accurate measurements',
                    'Save work regularly',
                    'Take photos for reference',
                    'Add notes for special conditions'
                ]
            }
        ].map(section => {
            const div = document.createElement('div');
            div.className = 'help-section';
            
            const h3 = document.createElement('h3');
            h3.textContent = section.title;
            div.appendChild(h3);
            
            const ul = document.createElement('ul');
            section.items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                ul.appendChild(li);
            });
            div.appendChild(ul);
            
            return div;
        });
    }

    setupTips() {
        this.tips = {
            wall: {
                title: 'Drawing Walls',
                content: 'Click and drag to draw walls. Use voice command "add wall".',
                iicrc: 'Document all affected wall areas per IICRC S500.'
            },
            door: {
                title: 'Adding Doors',
                content: 'Click and drag to place doors. Use voice command "add door".',
                iicrc: 'Note door condition and material type.'
            },
            window: {
                title: 'Adding Windows',
                content: 'Click and drag to place windows. Use voice command "add window".',
                iicrc: 'Check window seals and tracks for moisture.'
            },
            moisture: {
                title: 'Moisture Readings',
                content: 'Click to add moisture readings. Use voice command "moisture reading".',
                iicrc: 'Follow IICRC S500 guidelines for moisture levels:\n• Dry ≤15%\n• Moderate 16-30%\n• Wet >30%'
            },
            measure: {
                title: 'Measurements',
                content: 'Click and drag to measure distances. Use voice command "measure".',
                iicrc: 'Document all measurements for scope of works.'
            }
        };
    }

    showTip(mode) {
        const tip = this.tips[mode];
        if (!tip) return;

        const tipElement = document.createElement('div');
        tipElement.className = 'tool-tip';
        tipElement.innerHTML = `
            <h4>${tip.title}</h4>
            <p>${tip.content}</p>
            <div class="iicrc-tip">
                <strong>IICRC Guideline:</strong>
                <p>${tip.iicrc}</p>
            </div>
        `;

        // Remove any existing tips
        const existingTip = document.querySelector('.tool-tip');
        if (existingTip) existingTip.remove();

        document.body.appendChild(tipElement);
        setTimeout(() => tipElement.classList.add('visible'), 10);
        setTimeout(() => tipElement.classList.remove('visible'), 5000);
    }

    show() {
        this.overlay.classList.remove('hidden');
    }

    hide() {
        this.overlay.classList.add('hidden');
    }

    toggle() {
        this.overlay.classList.toggle('hidden');
    }
}

// Export for use in sketch.js
window.HelpOverlay = HelpOverlay;
