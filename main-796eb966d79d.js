import { createSearchController } from './controller-796eb966d79d.js';
function element(tag, className = '', text = '') {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
}
function button(text, action, className = '') {
    const node = element('button', className, text);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
}
const header = element('header', 'site-header');
const brand = element('a', 'brand', '◎ atlas');
brand.href = './';
header.append(brand, element('span', 'header-note', 'A little curiosity. A whole world.'));
const main = element('main');
const hero = element('section', 'hero');
hero.append(element('p', 'eyebrow', 'THE WORLD, AT YOUR FINGERTIPS'), element('h1', '', 'Every country.\nA new discovery.'), element('p', 'intro', 'Follow your curiosity across borders. Search a country\nand get to know the place behind the name.'));
const form = element('form', 'search-form');
const label = element('label', 'sr-only', 'Search countries by name');
label.htmlFor = 'country-search';
const input = element('input');
input.id = 'country-search';
input.type = 'search';
input.placeholder = 'Where will your curiosity take you?';
input.autocomplete = 'off';
input.spellcheck = false;
const clear = button('Clear', () => {
    input.value = '';
    controller.input('');
    input.focus();
}, 'clear');
form.append(label, element('span', 'search-icon', '⌕'), input, clear);
hero.append(form);
const suggestions = element('div', 'suggestions');
suggestions.append(element('span', '', 'Try somewhere new'));
for (const name of ['Japan', 'Portugal', 'Costa Rica'])
    suggestions.append(button(`${name} ↗`, () => search(name)));
hero.append(suggestions);
const results = element('section', 'results');
results.setAttribute('aria-label', 'Search results');
const status = element('div', 'status');
status.setAttribute('role', 'status');
status.setAttribute('aria-live', 'polite');
const cards = element('div', 'cards');
results.append(status, cards);
const dialog = element('dialog', 'detail');
dialog.addEventListener('click', (event) => {
    if (event.target === dialog)
        dialog.close();
});
const footer = element('footer');
footer.append(element('span', '', 'Made for the endlessly curious.'), element('span', '', 'COUNTRY DATA BY COUNTRIES.DEV ↗'));
main.append(hero, results);
document.body.append(header, main, footer, dialog);
const formatter = new Intl.NumberFormat('en');
function facts(country, detailed = false) {
    const list = element('dl', 'facts');
    const values = [
        ['Capital', country.capital],
        ['Region', country.region],
        ['Population', formatter.format(country.population)],
    ];
    if (detailed)
        values.push(['Area', `${formatter.format(country.area)} km²`], ['Languages', country.languages.join(', ') || 'Not available'], ['Currency', country.currencies.join(', ') || 'Not available'], ['Borders (ISO codes)', country.borders.join(', ') || 'No land borders']);
    for (const [name, value] of values)
        list.append(element('dt', '', name), element('dd', '', value));
    return list;
}
function flag(country) {
    const frame = element('div', 'flag');
    if (country.flag) {
        const img = element('img');
        img.src = country.flag;
        img.alt = `Flag of ${country.name}`;
        img.loading = 'lazy';
        img.addEventListener('error', () => {
            frame.textContent = '◎';
        });
        frame.append(img);
    }
    else
        frame.textContent = '◎';
    return frame;
}
function showDetails(country) {
    dialog.replaceChildren(button('Close ×', () => dialog.close(), 'close-detail'), flag(country), element('p', 'eyebrow', country.region), element('h2', '', country.name), element('p', 'description', country.description), facts(country, true));
    dialog.showModal();
}
function render(state) {
    cards.replaceChildren();
    status.replaceChildren();
    clear.hidden = !input.value;
    results.setAttribute('aria-busy', String(state.status === 'loading'));
    if (state.status === 'idle') {
        status.append(element('div', 'empty-icon', '◎'), element('h2', '', 'A world of possibilities'), element('p', '', 'Start with a country name. See where it takes you.'));
    }
    else if (state.status === 'waiting' || state.status === 'loading') {
        status.append(element('div', 'spinner'), element('p', '', state.status === 'loading'
            ? `Exploring “${state.query}”…`
            : 'Ready when you are…'));
    }
    else if (state.status === 'error') {
        status.append(element('h2', '', 'A small detour'), element('p', '', state.message), button('Try again ↗', () => controller.retry(), 'primary'));
    }
    else if (state.status === 'empty') {
        status.append(element('div', 'empty-icon', '⌕'), element('h2', '', 'No countries found'), element('p', '', `No matches for “${state.query}”. Try a different spelling.`));
    }
    else {
        const heading = element('div', 'results-heading');
        heading.append(element('h2', '', `Your discoveries`), element('span', '', `${state.countries.length} ${state.countries.length === 1 ? 'country' : 'countries'} found`));
        status.append(heading);
        for (const country of state.countries) {
            const card = button('', () => showDetails(country), 'card');
            card.setAttribute('aria-label', `Explore ${country.name}`);
            const content = element('div', 'card-content');
            content.append(element('p', 'eyebrow', country.region), element('h3', '', country.name), facts(country), element('span', 'explore-link', 'Explore country ↗'));
            card.append(flag(country), content);
            cards.append(card);
        }
    }
}
const controller = createSearchController(render);
function search(name) {
    input.value = name;
    controller.input(name);
}
input.addEventListener('input', () => controller.input(input.value));
form.addEventListener('submit', (event) => {
    event.preventDefault();
    controller.input(input.value);
    controller.retry();
});
window.addEventListener('pagehide', () => controller.dispose(), { once: true });
render({ status: 'idle', query: '', countries: [] });
