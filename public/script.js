// Entry experience handler
// Waits for the entire HTML to load before running the code inside. Ensures all elements are available for manipulation.
document.addEventListener('DOMContentLoaded', () => {

    // Grabs important HTML elements for the entry experience: the “Enter” button, splash screen, video overlay, and the main app content.
    const enterBtn = document.getElementById('enterBtn');
    const entryScreen = document.getElementById('entryScreen');
    const videoOverlay = document.getElementById('videoOverlay');
    const mainApp = document.getElementById('mainApp');

    // When the user clicks the Enter button, we start the animated intro experience.
    enterBtn.addEventListener('click', () => {

        // Hides the initial entry screen and shows the splash video overlay
        entryScreen.style.display = 'none';
        videoOverlay.style.display = 'block';

        // Grabs the video element, unmutes it, resets its position, and plays it from the start
        const video = document.getElementById('splashVideo');
        video.muted = false;
        video.currentTime = 0;
        video.play();

        // QUICK FADE after video plays for 3 seconds
        setTimeout(() => {
            videoOverlay.style.transition = 'opacity 0.3s ease'; // fade is 0.3s
            videoOverlay.style.opacity = '0';

            // Once the fade-out is complete, removes the overlay from the DOM and reveals the main content of the site
            setTimeout(() => {
                videoOverlay.remove();
                mainApp.style.display = 'block';
            }, 300); // matches fade time above
        }, 3000); // video duration in milliseconds
    });

    // Automatically fetch and display stories as soon as the page loads
    loadEntries();

    //filter dropdown listeners
    //Any time the user changes a filter, the entries are reloaded and re-filtered in real time
    document.getElementById('boroughFilter').addEventListener('change', loadEntries);
    document.getElementById('timeFilter').addEventListener('change', loadEntries);
    document.getElementById('tagFilter').addEventListener('change', loadEntries);
});

// Handle form submission
document.getElementById('entryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const tags = [];
    form.querySelectorAll('input[name="tags"]:checked').forEach(el => {
        tags.push(el.value);
    });

    // Constructs an entry object with all the form values, ready to send to the server
    const entry = {
        title: formData.get('title'),
        story: formData.get('story'),
        borough: formData.get('borough'),
        timeOfDay: formData.get('timeOfDay'),
        tags
    };

    // Sends a POST request to your Express backend with the new entry in JSON format

    try {
        const res = await fetch('/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        });


        // If the server responds successfully, the user is thanked, the form is cleared, and the entries are reloaded. If there’s an error, show an alert and log it

        const data = await res.json();

        if (res.ok) {
            alert('Thanks for your NYC moment!');
            form.reset();
            loadEntries();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (err) {
        console.error('Fetch failed:', err);
        alert('Something went wrong. Try again later.');
    }
});

// Load and display all entries
async function loadEntries() {
    try {

        // Makes a GET request to fetch all saved entries from the backend.
        const res = await fetch('/entries');
        const entries = await res.json();

        // Gets the current selected values from the three filter dropdowns.
        const borough = document.getElementById('boroughFilter').value;
        const time = document.getElementById('timeFilter').value;
        const tag = document.getElementById('tagFilter').value;

        // Clears the current stories so new, filtered ones can be added cleanly
        const container = document.getElementById('storyContainer');
        container.innerHTML = '';

        // Filters the list of entries based on dropdown selection. If a dropdown is blank, it counts as "match all".
        const filtered = entries.filter(entry => {
            const matchesBorough = borough === '' || entry.borough === borough;
            const matchesTime = time === '' || entry.timeOfDay === time;
            const matchesTag = tag === '' || entry.tags.includes(tag);
            return matchesBorough && matchesTime && matchesTag;
        });

        // For each filtered entry, creates a styled div (story card) and adds it to the page. It shows the title, story, borough, time of day, and any tags.
        filtered.forEach(entry => {
            const div = document.createElement('div');
            div.classList.add('entry-card');
            div.innerHTML = `
          <h3>${entry.title}</h3>
          <p>${entry.story}</p>
          <small><strong>${entry.borough}</strong> | ${entry.timeOfDay}</small><br/>
          ${entry.tags.length ? `<small>Tags: ${entry.tags.join(', ')}</small>` : ''}
        `;
            container.appendChild(div);
        });

        // If something goes wrong during the fetch, logs the error for debugging
    } catch (err) {
        console.error('Could not load entries:', err);
    }
}