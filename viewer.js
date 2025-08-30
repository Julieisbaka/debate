function getMarkdownFileFromURL() {
    const params = new URLSearchParams(window.location.search);
    let file = params.get('file');
    if (!file) return null;
    // Always fetch from Docs folder
    return 'Docs/' + file.replace(/^.*[\\\/]/, '');
}

function generateTOC(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const headers = temp.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (!headers.length) return '';
    let toc = '<strong>Table of Contents</strong><ul style="margin-left:1em;">';
    headers.forEach(header => {
        const id = header.textContent.replace(/\s+/g, '-').replace(/[^\w\-]/g, '').toLowerCase();
        header.id = id;
        toc += `<li style="margin-left:${(parseInt(header.tagName[1])-1)*1.5}em"><a href="#${id}">${header.textContent}</a></li>`;
    });
    toc += '</ul>';
    return { toc, html: temp.innerHTML };
}

async function loadAndRenderMarkdown() {
    const file = getMarkdownFileFromURL();
    const contentDiv = document.getElementById('content');
    const tocDiv = document.getElementById('toc');
    if (!file) {
        contentDiv.innerHTML = '<em>No markdown file specified. Use ?file=Docs/yourfile.md</em>';
        tocDiv.innerHTML = '';
        document.title = 'Markdown Viewer';
        return;
    }
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error('File not found');
        const md = await response.text();
        // Add support for ==underline== and %%highlight%%
        let enhancedMd = md
            .replace(/==([^=]+)==/g, '<u>$1</u>')
            .replace(/%%([^%]+)%%/g, '<mark>$1</mark>');
        let html = marked.parse(enhancedMd);
        // Table of Contents
        const tocResult = generateTOC(html);
        if (tocResult) {
            tocDiv.innerHTML = tocResult.toc;
            html = tocResult.html;
        } else {
            tocDiv.innerHTML = '';
        }
        contentDiv.innerHTML = html;
        // Set tab title to first header, or fallback to file name (without extension)
        const firstHeader = contentDiv.querySelector('h1, h2, h3, h4, h5, h6');
        if (firstHeader) {
            document.title = firstHeader.textContent;
            document.getElementById('main-title').textContent = firstHeader.textContent;
        } else {
            // Get file name without extension
            let fileName = file.split('/').pop().replace(/\.md$/i, '');
            document.title = fileName;
            document.getElementById('main-title').textContent = fileName;
        }
        // Render MathJax
        if (window.MathJax) {
            window.MathJax.typesetPromise();
        }
    } catch (e) {
        contentDiv.innerHTML = `<span style='color:red;'>Error: ${e.message}</span>`;
        tocDiv.innerHTML = '';
        document.title = 'Markdown Viewer';
    }
}
loadAndRenderMarkdown();
