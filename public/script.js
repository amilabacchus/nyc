// Entry experience handler
document.addEventListener('DOMContentLoaded', () => {
    const enterBtn = document.getElementById('enterBtn');
    const entryScreen = document.getElementById('entryScreen');
    const videoOverlay = document.getElementById('videoOverlay');
    const mainApp = document.getElementById('mainApp');

    enterBtn.addEventListener('click', () => {
        entryScreen.style.display = 'none';
        videoOverlay.style.display = 'block';

        const video = document.getElementById('splashVideo');
        video.muted = false;
        video.currentTime = 0;
        video.play();

        // QUICK FADE after video plays for 3 seconds
        setTimeout(() => {
            videoOverlay.style.transition = 'opacity 0.3s ease'; // fade is 0.3s
            videoOverlay.style.opacity = '0';

            setTimeout(() => {
                videoOverlay.remove();
                mainApp.style.display = 'block';
            }, 300); // matches fade time above
        }, 3000); // video duration in milliseconds
    });

    loadEntries();

    //filter dropdown listeners
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

    const entry = {
        title: formData.get('title'),
        story: formData.get('story'),
        borough: formData.get('borough'),
        timeOfDay: formData.get('timeOfDay'),
        tags
    };

    try {
        const res = await fetch('/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        });

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
        const res = await fetch('/entries');
        const entries = await res.json();

        const borough = document.getElementById('boroughFilter').value;
        const time = document.getElementById('timeFilter').value;
        const tag = document.getElementById('tagFilter').value;

        const container = document.getElementById('storyContainer');
        container.innerHTML = '';

        const filtered = entries.filter(entry => {
            const matchesBorough = borough === '' || entry.borough === borough;
            const matchesTime = time === '' || entry.timeOfDay === time;
            const matchesTag = tag === '' || entry.tags.includes(tag);
            return matchesBorough && matchesTime && matchesTag;
        });

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

    } catch (err) {
        console.error('Could not load entries:', err);
    }
}