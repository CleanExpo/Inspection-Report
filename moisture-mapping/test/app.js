console.log('App.js loaded');

// Initialize form functionality
function initializeForm() {
    console.log('Initializing form...');
    
    const form = document.getElementById('room-info-form');
    if (!form) {
        console.error('Form not found');
        return;
    }
    console.log('Form found');

    // Get form elements
    const roomName = form.querySelector('#room-name');
    const roomWidth = form.querySelector('#room-width');
    const roomLength = form.querySelector('#room-length');
    const roomHeight = form.querySelector('#room-height');
    const floorType = form.querySelector('#floor-type');
    const subfloorType = form.querySelector('#subfloor-type');

    // Add input event listeners
    roomName?.addEventListener('input', e => console.log('Room name input:', e.target.value));
    roomWidth?.addEventListener('input', e => console.log('Width input:', e.target.value));
    roomLength?.addEventListener('input', e => console.log('Length input:', e.target.value));
    roomHeight?.addEventListener('input', e => console.log('Height input:', e.target.value));

    // Handle floor type selection
    if (floorType) {
        floorType.addEventListener('change', function(e) {
            console.log('Floor type selected:', e.target.value);
        });
    }

    // Handle subfloor type selection
    if (subfloorType) {
        subfloorType.addEventListener('change', function(e) {
            console.log('Subfloor type selected:', e.target.value);
        });
    }

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');

        // Log current form values
        const currentValues = {
            roomName: roomName?.value,
            width: roomWidth?.value,
            length: roomLength?.value,
            height: roomHeight?.value,
            floorType: floorType?.value,
            subfloorType: subfloorType?.value
        };
        console.log('Current form values:', currentValues);

        // Update room details
        window.updateRoomDetails(currentValues);
    });

    console.log('Form initialization complete');
}

// Update room details
window.updateRoomDetails = function(data) {
    if (!data) {
        console.log('No room data provided');
        return;
    }
    
    console.log('Room details updated:', data);
    window.roomData = data;
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    initializeForm();
});
