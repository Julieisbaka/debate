// The files array below is a backup and can be updated automatically by running update_gallery_files.ps1
// Example: const files = ["Race is racist.md"];
const files = [];
const list = document.getElementById('md-list');

// Try to dynamically fetch markdown files from Docs/ (works if server allows directory listing)
async function loadMarkdownFiles() {
    try {
        // Try to fetch directory listing (works with some static servers)
        const resp = await fetch('Docs/');
        if (resp.ok) {
            const text = await resp.text();
            // Try to parse links to .md files
            const temp = document.createElement('div');
            temp.innerHTML = text;
            const links = Array.from(temp.querySelectorAll('a'));
            const mdFiles = links.map(a => a.getAttribute('href')).filter(f => f && f.endsWith('.md'));
            if (mdFiles.length > 0) {
                renderList(mdFiles);
                return;
            }
        }
    } catch (e) {}
    // Fallback to static array
    if (typeof files !== 'undefined' && files.length > 0) {
        renderList(files);
    } else {
        list.innerHTML = '<li><em>No markdown files found in Docs/</em></li>';
    }
}

function renderList(mdFiles) {
    list.innerHTML = '';
    mdFiles.forEach(file => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        // Only use the filename in the URL param
        const fileName = decodeURIComponent(file.replace(/^.*[\\\/]/, ''));
        a.href = `viewer.html?file=${encodeURIComponent(fileName)}`;
        // Remove .md extension for display
        let displayName = fileName;
        if (displayName.toLowerCase().endsWith('.md')) {
            displayName = displayName.slice(0, -3);
        }
        a.textContent = displayName;
        li.appendChild(a);
        list.appendChild(li);
    });
}

loadMarkdownFiles();
