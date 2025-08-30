// The files array below is a backup and can be updated automatically by running update_gallery_files.ps1
// Example: const files = ["example1.md", "example2.md"];
const files = [];
const list = document.getElementById('md-list');
if (files.length === 0) {
    list.innerHTML = '<li><em>No markdown files found in Docs/</em></li>';
} else {
    files.forEach(file => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `viewer.html?file=Docs/${encodeURIComponent(file)}`;
        a.textContent = file;
        li.appendChild(a);
        list.appendChild(li);
    });
}
