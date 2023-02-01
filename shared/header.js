
export function createHeader() {
    let header = {};
    header.id = 'headerId';
    let mainDiv = document.createElement('div');
    mainDiv.id = header.id;
    header.mainDiv = mainDiv;
    header.render = () => renderHeader(header);
    header.init = () => init(header);
    return header;
}

function init(header) {
    header.render();
}

function renderHeader(header) {
    let main = document.getElementById(header.id);
    let title = document.createElement('h1');
    title.innerText = 'CRUD Generator';
    main.append(title);
}
