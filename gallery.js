// The files array below is a backup and can be updated automatically by running update_gallery_files.ps1
// Example: const files = ["Race is racist.md"];
const files = ["Race is racist.md"];
const list = document.getElementById('md-list');

if (files.length > 0) {
    list.innerHTML = '';
    files.forEach(file => {
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
};
