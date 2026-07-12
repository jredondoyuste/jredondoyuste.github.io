const DEFAULT_INGREDIENTS = {
    pantry:     ['pasta', 'rice', 'olive oil', 'canned tomatoes', 'lentils', 'chickpeas', 'bread', 'oats'],
    vegetables: ['onion', 'garlic', 'carrot', 'potato', 'spinach', 'broccoli', 'zucchini', 'bell pepper'],
    fruits:     ['lemon', 'apple', 'banana', 'tomato', 'orange'],
    spices:     ['salt', 'pepper', 'cumin', 'paprika', 'oregano', 'turmeric', 'chili flakes', 'cinnamon'],
    dairy:      ['eggs', 'butter', 'milk', 'parmesan', 'yogurt'],
    proteins:   ['chicken', 'tuna', 'bacon', 'tofu'],
};

const STORAGE_KEY = 'pantry-001';

let state = {
    ingredients: {},
    checked: [],
    editMode: false,
};

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const parsed = JSON.parse(saved);
        state.ingredients = parsed.ingredients || JSON.parse(JSON.stringify(DEFAULT_INGREDIENTS));
        state.checked = parsed.checked || [];
    } else {
        state.ingredients = JSON.parse(JSON.stringify(DEFAULT_INGREDIENTS));
        state.checked = [];
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ingredients: state.ingredients,
        checked: state.checked,
    }));
}

function toggleChecked(name) {
    const idx = state.checked.indexOf(name);
    if (idx === -1) {
        state.checked.push(name);
    } else {
        state.checked.splice(idx, 1);
    }
    saveState();
    render();
}

function deleteIngredient(category, name) {
    state.ingredients[category] = state.ingredients[category].filter(i => i !== name);
    state.checked = state.checked.filter(i => i !== name);
    saveState();
    render();
}

function addIngredient(category, inputEl) {
    const trimmed = inputEl.value.trim().toLowerCase();
    if (!trimmed) return;
    if (!state.ingredients[category].includes(trimmed)) {
        state.ingredients[category].push(trimmed);
        saveState();
        render();
    } else {
        inputEl.value = '';
    }
}

function toggleEditMode() {
    state.editMode = !state.editMode;
    render();
}

function findRecipes() {
    if (state.checked.length === 0) return;
    const query = encodeURIComponent(state.checked.join(' '));
    window.open('https://cooking.nytimes.com/search?q=' + query, '_blank');
}

function render() {
    const container = document.getElementById('pantry-container');
    container.innerHTML = '';
    container.className = 'list-container' + (state.editMode ? ' edit-mode' : '');

    for (const [category, items] of Object.entries(state.ingredients)) {
        const section = document.createElement('div');
        section.className = 'list-section';

        const title = document.createElement('div');
        title.className = 'list-section-title';
        title.textContent = category;
        section.appendChild(title);

        const ul = document.createElement('ul');

        for (const item of items) {
            const li = document.createElement('li');
            const isChecked = state.checked.includes(item);
            if (isChecked) li.className = 'checked';

            const span = document.createElement('span');
            span.className = 'list-item pantry-item';
            span.textContent = item;
            if (!state.editMode) {
                span.onclick = () => toggleChecked(item);
            }
            li.appendChild(span);

            if (state.editMode) {
                const del = document.createElement('button');
                del.className = 'delete-btn';
                del.textContent = '×';
                del.onclick = () => deleteIngredient(category, item);
                li.appendChild(del);
            }

            ul.appendChild(li);
        }

        if (state.editMode) {
            const addLi = document.createElement('li');
            addLi.className = 'add-item-row';

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'add item...';
            input.className = 'add-item-input';
            input.onkeydown = (e) => {
                if (e.key === 'Enter') addIngredient(category, input);
            };

            const addBtn = document.createElement('button');
            addBtn.className = 'add-item-btn';
            addBtn.textContent = '+';
            addBtn.onclick = () => addIngredient(category, input);

            addLi.appendChild(input);
            addLi.appendChild(addBtn);
            ul.appendChild(addLi);
        }

        section.appendChild(ul);
        container.appendChild(section);
    }

    const editBtn = document.getElementById('edit-btn');
    editBtn.textContent = state.editMode ? 'done' : 'edit';
    editBtn.classList.toggle('active', state.editMode);

    const recipeBtn = document.getElementById('recipe-btn');
    recipeBtn.disabled = state.checked.length === 0;
    recipeBtn.textContent = state.checked.length > 0
        ? 'find recipes (' + state.checked.length + ') ↗'
        : 'find recipes ↗';
}

loadState();
render();
