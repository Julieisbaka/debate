// Highlight color button logic
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.highlight-btn');
    const stored = localStorage.getItem('highlightColor') || 'yellow';
    buttons.forEach(btn => {
        if (btn.dataset.color === stored) btn.classList.add('selected');
        btn.addEventListener('click', function() {
            buttons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            localStorage.setItem('highlightColor', btn.dataset.color);
            // Re-render highlights if content is loaded
            updateHighlightColors();
        });
    });
});

function updateHighlightColors() {
    const color = localStorage.getItem('highlightColor') || 'yellow';
    document.querySelectorAll('#content mark').forEach(mark => {
        mark.setAttribute('data-color', color);
    });
}
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
            .replace(/%%([^%]+)%%/g, '<u>$1</u>')
            .replace(/==([^=]+)==/g, function(_, text) {
                const color = localStorage.getItem('highlightColor') || 'yellow';
                return `<mark data-color="${color}">${text}</mark>`;
            });


        // Enhanced: Merge underline and bold in all adjacent/nested cases, preserving all styling
        // Handles: <u><b>foo</b></u> <u><b>bar</b></u>, <u><b>foo</b></u> <b>bar</b>, <b>foo</b> <u><b>bar</b></u>, etc.
        // Merge any adjacent underline/bold combos separated only by a space
        // 1. <u><b>foo</b></u> <u><b>bar</b></u> => <u><b>foo bar</b></u>
        enhancedMd = enhancedMd.replace(/<u><b>(.*?)<\/b><\/u>\s+<u><b>(.*?)<\/b><\/u>/g, function(_, a, b) {
            return '<u><b>' + a + ' ' + b + '</b></u>';
        });
        // 2. <u><b>foo</b></u> <b>bar</b> => <u><b>foo bar</b></u>
        enhancedMd = enhancedMd.replace(/<u><b>(.*?)<\/b><\/u>\s+<b>(.*?)<\/b>/g, function(_, a, b) {
            return '<u><b>' + a + ' ' + b + '</b></u>';
        });
        // 3. <b>foo</b> <u><b>bar</b></u> => <u><b>foo bar</b></u>
        enhancedMd = enhancedMd.replace(/<b>(.*?)<\/b>\s+<u><b>(.*?)<\/b><\/u>/g, function(_, a, b) {
            return '<u><b>' + a + ' ' + b + '</b></u>';
        });
        // 4. <u>foo</u> <b>bar</b> => <u><b>foo bar</b></u>
        enhancedMd = enhancedMd.replace(/<u>(.*?)<\/u>\s+<b>(.*?)<\/b>/g, function(_, a, b) {
            return '<u><b>' + a + ' ' + b + '</b></u>';
        });
        // 5. <b>foo</b> <u>bar</u> => <b><u>foo bar</u></b>
        enhancedMd = enhancedMd.replace(/<b>(.*?)<\/b>\s+<u>(.*?)<\/u>/g, function(_, a, b) {
            return '<b><u>' + a + ' ' + b + '</u></b>';
        });
        // 6. <u>foo</u> <u>bar</u> => <u>foo bar</u>
        enhancedMd = enhancedMd.replace(/<u>(.*?)<\/u>\s+<u>(.*?)<\/u>/g, function(_, a, b) {
            return '<u>' + a + ' ' + b + '</u>';
        });
        // 7. <b>foo</b> <b>bar</b> => <b>foo bar</b>
        enhancedMd = enhancedMd.replace(/<b>(.*?)<\/b>\s+<b>(.*?)<\/b>/g, function(_, a, b) {
            return '<b>' + a + ' ' + b + '</b>';
        });

        // --- Robust merging logic for highlight, underline, and bold blocks ---
        // Iteratively merge all adjacent highlight, underline, and bold blocks separated by spaces
        let prev;
        do {
            prev = enhancedMd;
            // Use [^\w<>]+ to match any non-alphanumeric (and not tag) separator
            // mark-mark (with any attributes)
            enhancedMd = enhancedMd.replace(/<mark([^>]*)>(.*?)<\/mark>[^\w<>]+<mark([^>]*)>(.*?)<\/mark>/g, function(_, attr1, a, attr2, b) {
                // Prefer the first mark's attributes
                return `<mark${attr1}>${a} ${b}</mark>`;
            });
            // u-u
            enhancedMd = enhancedMd.replace(/<u>(.*?)<\/u>[^\w<>]+<u>(.*?)<\/u>/g, function(_, a, b) {
                return '<u>' + a + ' ' + b + '</u>';
            });
            // b-b
            enhancedMd = enhancedMd.replace(/<b>(.*?)<\/b>[^\w<>]+<b>(.*?)<\/b>/g, function(_, a, b) {
                return '<b>' + a + ' ' + b + '</b>';
            });
            // mark-b (mark with any attributes)
            enhancedMd = enhancedMd.replace(/<mark([^>]*)>(.*?)<\/mark>[^\w<>]+<b>(.*?)<\/b>/g, function(_, attr, a, b) {
                return `<mark${attr}><b>${a} ${b}</b></mark>`;
            });
            // b-mark (mark with any attributes)
            enhancedMd = enhancedMd.replace(/<b>(.*?)<\/b>[^\w<>]+<mark([^>]*)>(.*?)<\/mark>/g, function(_, a, attr, b) {
                return `<mark${attr}><b>${a} ${b}</b></mark>`;
            });
            // mark-u (mark with any attributes)
            enhancedMd = enhancedMd.replace(/<mark([^>]*)>(.*?)<\/mark>[^\w<>]+<u>(.*?)<\/u>/g, function(_, attr, a, b) {
                return `<mark${attr}><u>${a} ${b}</u></mark>`;
            });
            // u-mark (mark with any attributes)
            enhancedMd = enhancedMd.replace(/<u>(.*?)<\/u>[^\w<>]+<mark([^>]*)>(.*?)<\/mark>/g, function(_, a, attr, b) {
                return `<mark${attr}><u>${a} ${b}</u></mark>`;
            });
            // u-b
            enhancedMd = enhancedMd.replace(/<u>(.*?)<\/u>[^\w<>]+<b>(.*?)<\/b>/g, function(_, a, b) {
                return '<u><b>' + a + ' ' + b + '</b></u>';
            });
            // b-u
            enhancedMd = enhancedMd.replace(/<b>(.*?)<\/b>[^\w<>]+<u>(.*?)<\/u>/g, function(_, a, b) {
                return '<b><u>' + a + ' ' + b + '</u></b>';
            });
            // mark-b-mark-b (mark with any attributes)
            enhancedMd = enhancedMd.replace(/<mark([^>]*)><b>(.*?)<\/b><\/mark>[^\w<>]+<mark([^>]*)><b>(.*?)<\/b><\/mark>/g, function(_, attr1, a, attr2, b) {
                return `<mark${attr1}><b>${a} ${b}</b></mark>`;
            });
            // mark-b-b (mark with any attributes)
            enhancedMd = enhancedMd.replace(/<mark([^>]*)><b>(.*?)<\/b><\/mark>[^\w<>]+<b>(.*?)<\/b>/g, function(_, attr, a, b) {
                return `<mark${attr}><b>${a} ${b}</b></mark>`;
            });
            // b-mark-b (mark with any attributes)
            enhancedMd = enhancedMd.replace(/<b>(.*?)<\/b>[^\w<>]+<mark([^>]*)><b>(.*?)<\/b><\/mark>/g, function(_, a, attr, b) {
                return `<mark${attr}><b>${a} ${b}</b></mark>`;
            });
            // u-b-u-b
            enhancedMd = enhancedMd.replace(/<u><b>(.*?)<\/b><\/u>[^\w<>]+<u><b>(.*?)<\/b><\/u>/g, function(_, a, b) {
                return '<u><b>' + a + ' ' + b + '</b></u>';
            });
            // u-b-b
            enhancedMd = enhancedMd.replace(/<u><b>(.*?)<\/b><\/u>[^\w<>]+<b>(.*?)<\/b>/g, function(_, a, b) {
                return '<u><b>' + a + ' ' + b + '</b></u>';
            });
            // b-u-b
            enhancedMd = enhancedMd.replace(/<b>(.*?)<\/b>[^\w<>]+<u><b>(.*?)<\/b><\/u>/g, function(_, a, b) {
                return '<u><b>' + a + ' ' + b + '</b></u>';
            });
        } while (enhancedMd !== prev);

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
    updateHighlightColors();
        // Set tab title and main title to file name (without extension)
        let fileName = file.split('/').pop().replace(/\.md$/i, '');
        document.title = fileName;
        document.getElementById('main-title').textContent = fileName;
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
