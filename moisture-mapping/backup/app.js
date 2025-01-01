// Device detection
const isTouchDevice = 'ontouchstart' in window;
const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
const isMobile = window.innerWidth < 768;

// Initialize form functionality
function initializeForm() {
    const form = document.getElementById('room-info-form');
    const floorType = document.getElementById('floor-type');
    const subfloorType = document.getElementById('subfloor-type');
    const customFloorType = document.getElementById('custom-floor-type');
    const customSubfloorType = document.getElementById('custom-subfloor-type');

    if (!form || !floorType || !subfloorType || !customFloorType || !customSubfloorType) {
        console.error('Required form elements not found');
        return;
    }

    // Initialize custom input fields
    customFloorType.style.display = 'none';
    customSubfloorType.style.display = 'none';

    // Enhance form inputs for touch devices
    if (isTouchDevice) {
        enhanceInputsForTouch();
    }

    // Show/hide error messages
    function toggleError(element, show, message = '') {
        const errorDiv = element.parentElement.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = show ? 'block' : 'none';
            element.classList.toggle('error', show);
            element.classList.toggle('valid', !show);
            
            // Scroll to error on mobile
            if (show && isMobile) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    // Handle dimension validation with device-specific UX
    const dimensions = ['room-width', 'room-length', 'room-height'];
    dimensions.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            // Use input event for desktop, change event for mobile
            const eventType = isTouchDevice ? 'change' : 'input';
            input.addEventListener(eventType, function(e) {
                const value = parseFloat(e.target.value);
                const isValid = !isNaN(value) && value >= 0.1 && value <= (id === 'room-height' ? 10 : 50);
                toggleError(input, !isValid, `Invalid ${id.split('-')[1]} measurement`);
                if (isValid && window.roomData) {
                    window.roomData.dimensions[id.split('-')[1]] = value;
                    updateRoomMeasurements();
                }
            });

            // Add blur handler for touch devices
            if (isTouchDevice) {
                input.addEventListener('blur', function() {
                    if (!this.value) {
                        toggleError(input, true, 'This field is required');
                    }
                });
            }
        }
    });

    // Handle select changes with device-specific feedback
    function handleSelectChange(select, customInput) {
        select.addEventListener('change', function(e) {
            toggleError(select, !e.target.value);
            customInput.style.display = e.target.value === 'other' ? 'block' : 'none';
            if (e.target.value !== 'other') {
                customInput.querySelector('input').value = '';
            } else if (isTouchDevice) {
                // Focus custom input on mobile after slight delay
                setTimeout(() => {
                    customInput.querySelector('input').focus();
                }, 300);
            }
        });
    }

    handleSelectChange(floorType, customFloorType);
    handleSelectChange(subfloorType, customSubfloorType);

    // Handle form submission with device-specific validation
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Clear any previous errors
        form.querySelectorAll('.error-message').forEach(msg => {
            msg.style.display = 'none';
        });

        const formData = {
            roomName: form.querySelector('#room-name').value.trim(),
            dimensions: {
                width: parseFloat(form.querySelector('#room-width').value),
                length: parseFloat(form.querySelector('#room-length').value),
                height: parseFloat(form.querySelector('#room-height').value)
            },
            floorType: floorType.value === 'other' 
                ? customFloorType.querySelector('input').value.trim() 
                : floorType.value,
            subfloorType: subfloorType.value === 'other'
                ? customSubfloorType.querySelector('input').value.trim()
                : subfloorType.value
        };

        // Validate all fields
        let isValid = true;
        let firstError = null;

        if (!formData.roomName) {
            isValid = false;
            const element = form.querySelector('#room-name');
            toggleError(element, true, 'Room name is required');
            firstError = firstError || element;
        }

        dimensions.forEach(id => {
            const input = form.querySelector(`#${id}`);
            const value = parseFloat(input.value);
            const isValidDimension = !isNaN(value) && value >= 0.1 && 
                value <= (id === 'room-height' ? 10 : 50);
            
            if (!isValidDimension) {
                isValid = false;
                toggleError(input, true, `Invalid ${id.split('-')[1]} measurement`);
                firstError = firstError || input;
            }
        });

        if (!formData.floorType) {
            isValid = false;
            toggleError(floorType, true, 'Floor type is required');
            firstError = firstError || floorType;
        }

        if (!formData.subfloorType) {
            isValid = false;
            toggleError(subfloorType, true, 'Subfloor type is required');
            firstError = firstError || subfloorType;
        }

        if (!isValid) {
            if (firstError && isTouchDevice) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        updateRoomDetails(formData);
        updateMoistureStats();
        updateRoomMeasurements();

        // Show success feedback
        showFeedback('Room information updated successfully', 'success');
    });
}

// Enhance inputs for touch devices
function enhanceInputsForTouch() {
    // Add active states for touch
    document.querySelectorAll('input, select, button').forEach(element => {
        element.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        });
        
        ['touchend', 'touchcancel'].forEach(event => {
            element.addEventListener(event, function() {
                this.classList.remove('touch-active');
            });
        });
    });

    // Improve select handling
    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('touchend', function(e) {
            // Prevent double-tap zoom on iOS
            e.preventDefault();
        });
    });
}

// Show feedback message
function showFeedback(message, type = 'info') {
    const feedback = document.createElement('div');
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;
    
    document.querySelector('.moisture-mapping').insertAdjacentElement('afterbegin', feedback);
    
    // Auto-dismiss after delay
    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => feedback.remove(), 300);
    }, 3000);
}

// ... (keep other existing functions)

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    initializeSketchTools();
    initializeCanvasControls();
    initializeDataManagement();
    initializeEquipment();

    // Add device-specific initialization
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
        if (isMobile) {
            document.body.classList.add('mobile');
        } else if (isTablet) {
            document.body.classList.add('tablet');
        }
    }
});

// Make functions available globally
window.updateRoomDetails = updateRoomDetails;
window.updateMoistureStats = updateMoistureStats;
window.updateRoomMeasurements = updateRoomMeasurements;
window.updateEquipmentInfo = updateEquipmentInfo;
