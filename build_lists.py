#!/usr/bin/env python3
"""Generate HTML list pages from markdown files."""

import os
import re
from pathlib import Path

def extract_title_and_description(md_content):
    """Extract title and description from markdown."""
    lines = md_content.strip().split('\n')
    title = ""
    description = ""
    
    # First # is the title
    for i, line in enumerate(lines):
        if line.startswith('# '):
            title = line[2:].strip()
            # Next non-empty line is the description
            for j in range(i + 1, len(lines)):
                if lines[j].strip():
                    description = lines[j].strip()
                    break
            break
    
    return title, description

def markdown_to_html_list(md_content):
    """Convert markdown content to HTML list items and sections.
    
    Supports:
    - ## Subheaders (converted to <h3>)
    - List items (-, *, +)
    - Markdown links [text](url)
    """
    html_items = []
    
    lines = md_content.strip().split('\n')
    skip_until_empty = True
    current_list = []
    
    def flush_current_list():
        """Add current accumulated list items to html_items."""
        nonlocal current_list
        if current_list:
            html_items.append("        <ul>")
            for item in current_list:
                html_items.append(f"            {item}")
            html_items.append("        </ul>")
            current_list = []
    
    for line in lines:
        # Skip main title line (#)
        if line.startswith('# '):
            continue
        
        line_stripped = line.strip()
        
        # Skip until we find an empty line after the description
        if skip_until_empty:
            if line_stripped == '':
                skip_until_empty = False
            continue
        
        # Handle subheaders (##)
        if line_stripped.startswith('## '):
            flush_current_list()
            subheader = line_stripped[3:].strip()
            html_items.append(f"        <h3>{subheader}</h3>")
            continue
        
        # Handle markdown list items (-, *, +)
        if line_stripped and re.match(r'^[-*+]\s', line_stripped):
            item_text = re.sub(r'^[-*+]\s', '', line_stripped)
            # Convert markdown links to HTML
            item_text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', item_text)
            current_list.append(f"<li>{item_text}</li>")
    
    # Flush any remaining list items
    flush_current_list()
    
    return '\n'.join(html_items) if html_items else "            <!-- Add entries here -->"

def generate_html_page(title, description, list_html, list_name):
    """Generate complete HTML page."""
    # Determine depth for relative paths
    depth = 1  # lists/ folder is one level deep
    relative_path = '../'
    
    html_template = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>{title} — jaime redondo-yuste</title>
    <link rel="shortcut icon" href="{relative_path}files/favicon.png">
    <link rel="stylesheet"
        href="https://maxst.icons8.com/vue-static/landings/line-awesome/font-awesome-line-awesome/css/all.min.css">
    <!-- google fonts  -->
    <link href="https://fonts.googleapis.com/css2?family=Exo:wght@100;200;300;400;500;600;700;800;900&family=Saira:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link href="{relative_path}style.css" rel="stylesheet" type="text/css" />
    <script src="{relative_path}js/ringdown.js"></script>
</head>

<body>
    <div class="box">
        <nav class="header">
            <svg class="ringdown" preserveAspectRatio="none"></svg>
            <a href="{relative_path}index.html">[home]</a> 
            <a href="{relative_path}about.html">[about]</a> 
            <a href="{relative_path}research.html">[research]</a>
            <a href="{relative_path}random.html">[random]</a>
        </nav>

        <h2>{title}</h2>
        <p style="padding-top: 0.5em; font-style: italic; color: #666;">{description}</p>

        <div style="margin-top: 1.5em;">
{list_html}
        </div>

        <footer id="footer">
            <div class="links">
                <a href="mailto:jaime.redondo.yuste@nbi.ku.dk" disp-title="Email Me" target="_blank"><i
                    class="fa fa-fw fa-envelope "></i></a>
                <a href="https://www.linkedin.com/in/jredondoyuste" disp-title="LinkedIn" target="_blank"><i
                    class="fab fa-fw fa-linkedin"></i></a>
                <a href="https://curius.app/jaime-redondo-yuste2" disp-title="Curius" target="_blank"><i 
                    class="fa fa-fw fa-chevron-circle-up"></i></a>
                <a href="https://github.com/jredondoyuste" disp-title="GitHub" target="_blank"><i
                    class="fab fa-fw fa-github"></i></a>
                <a href="https://inspirehep.net/authors/1797177"
                    disp-title="Inspire" target="_blank"><i class="fa fa-fw fa-graduation-cap"></i></i></a>
            </div>
            <br>
            &copy; 2026 Jaime Redondo-Yuste 
        </footer>
    </div>
</body>

</html>
'''
    return html_template

def main():
    lists_dir = Path(__file__).parent / "lists"
    
    # Find all markdown files
    md_files = sorted(lists_dir.glob("*.md"))
    
    for md_file in md_files:
        print(f"Processing {md_file.name}...")
        
        with open(md_file, 'r') as f:
            md_content = f.read()
        
        title, description = extract_title_and_description(md_content)
        list_html = markdown_to_html_list(md_content)
        
        html_content = generate_html_page(title, description, list_html, md_file.stem)
        
        # Write HTML file
        html_file = md_file.with_suffix('.html')
        with open(html_file, 'w') as f:
            f.write(html_content)
        
        print(f"  Generated {html_file.name}")

if __name__ == "__main__":
    main()
