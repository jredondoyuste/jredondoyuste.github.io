# Building List Pages

The list pages (soups, concerts, books, restaurants, records, cities) are automatically generated from markdown files.

## How to add/edit list items

1. Edit the corresponding markdown file in `lists/` folder (e.g., `lists/soups.md`)
2. Use the following markdown syntax:

```markdown
# Title
Description of the list.

## Section Name (optional)
- Item 1
- Item 2
- [Item with link](https://example.com)

## Another Section
- More items
```

3. Run the build script to generate HTML:
   ```bash
   python3 build_lists.py
   ```

The HTML files will be automatically updated based on your markdown content.

## Markdown Features Supported

- **Main title**: `# Title`
- **Subheaders**: `## Section Name` (rendered as `<h3>`)
- **List items**: `- Item name` or `* Item name`
- **Links**: `[Link text](https://url.com)`

## File structure

- `lists/*.md` - Source markdown files with your list content
- `lists/*.html` - Generated HTML pages (do not edit directly)
- `build_lists.py` - Python script that generates HTML from markdown

