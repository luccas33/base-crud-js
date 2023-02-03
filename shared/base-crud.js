import { newPaginator } from "../util/paginator.js";

let id = 0;

/**
 * Requireds: 
 * list(this) 
 * save(dto, this)
 * remove(dto, this),
 * 
 * Required if you don't provide CRUD's HTML:
 * fields: {dtoProp: 'Label' | { label: string, 
 *                               input(): html, 
 *                               get(input, dto, prop), 
 *                               set(input, dto, prop),
 *                               listCell(dto, prop)?: html,
 *                               className?: string } }
 * 
 * Call setData(data[]) in your list() to display data
 * 
 * Call confirmSave() when save concluds successfully
 * 
 * Call confirmRemove() when remove concluds successfully
 * 
 * Set rowsQtt to control pagination
 * Set title to display title
 * 
 * Optionals components:
 * formComponent(dto): html
 * listHeadComponent(dto): html
 * listItemComponent(dto): html
 * 
 * Optional functions:
 * isValidToSave(dto): bool
 * isValidToRemove(dto): bool
 * create(): dto
 * equals(dto, dto): bool
 * 
 * Optional panels:
 * mainDiv, titleDiv, controlDiv, formDiv, listDiv,
 * headListDiv, bodyListDiv, noDataDiv and paggerDiv
 * 
 */
export function createCrud(crud) {
    crud = crud || {};
    id++;
    crud.formId = 'crudFormId_' + id;
    crud.bodyListId = 'crudBodyListId_' + id;
    crud.paggerId = 'crudPaggerId_' + id;

    crud.formComponent = crud.formComponent || defaultFormComponent;
    crud.listItemComponent = crud.listItemComponent || defaultListItemComponent;

    crud.mainDiv = crud.mainDiv || document.createElement('div');

    if (!crud.titleDiv && crud.title) {
        let title = document.createElement('h2');
        title.innerHTML = crud.title;
        title.className = 'crud-title';
        crud.mainDiv.append(title);
    }

    if (!crud.controlDiv) {
        crud.controlDiv = document.createElement('div');
        crud.controlDiv.className = 'crud-control';
        crud.mainDiv.append(crud.controlDiv);
    }
    renderControl(crud);

    if (!crud.formDiv) {
        crud.formDiv = document.createElement('div');
        crud.formDiv.className = 'crud-form';
        crud.mainDiv.append(crud.formDiv);
    }
    crud.formDiv.id = crud.formId;

    if (!crud.listDiv) {
        crud.listDiv = crud.listDiv || document.createElement('table');
        crud.listDiv.className = 'crud-table';
        crud.mainDiv.append(crud.listDiv);
    }

    crud.headListDiv = crud.headListDiv || defaultListHeadComponent(crud.fields);
    crud.listDiv.append(crud.headListDiv);

    if (!crud.bodyListDiv) {
        crud.bodyListDiv = document.createElement('tbody');
        crud.listDiv.append(crud.bodyListDiv);
    }
    crud.bodyListDiv.id = crud.bodyListId;

    crud.noDataDiv = crud.noDataDiv || defaultNoDataComponent(crud);

    createPagger(crud);

    crud.renderForm = () => renderForm(crud);
    crud.renderList = () => renderList(crud);
    crud.setData = (data) => loadData(crud, data);
    crud.init = () => crud.list(crud);
    crud.confirmSave = () => confirmSave(crud);
    crud.confirmRemove = () => confirmRemove(crud);

    return crud;
}

function loadData(crud, data) {
    data = data || [];
    crud.data = data;
    crud.pagger.setData(data);
    crud.displayData = crud.pagger.pageData;
    if (data.length == 0) {
        crud.displayData = [];
        crud.newClick();
    }
    if (!crud.selectedDto && crud.data.length > 0) {
        crud.selectedDto = crud.data[0];
    }
    crud.renderList();
    crud.renderForm();
    let paggerDiv = document.getElementById(crud.paggerId);
    paggerDiv.hidden = crud.pagger.pagesQtt < 2 ? 'hidden' : '';
    if (crud.selectedDto) {
        let selectedIndex = crud.data.findIndex(dto => {
            return crud.selectedDto == dto ||
                (crud.equals && crud.equals(crud.selectedDto, dto) === true);
        });
        crud.pagger.navToIndex(selectedIndex);
    }
}

function renderControl(crud) {
    let main = document.createElement('div');
    crud.controlDiv.append(main);
    let btnNew = document.createElement('button');
    main.append(btnNew);
    btnNew.className = 'crud-control-btn crud-new-btn';
    btnNew.innerText = 'NEW';

    crud.newClick = () => newClick(crud);
    btnNew.addEventListener('click', crud.newClick);

    let btnSave = document.createElement('button');
    main.append(btnSave);
    btnSave.className = 'crud-control-btn crud-save-btn';
    btnSave.innerText = 'SAVE';
    crud.saveClick = () => saveClick(crud);
    btnSave.addEventListener('click', crud.saveClick);

    let btnDelete = document.createElement('button');
    main.append(btnDelete);
    btnDelete.className = 'crud-control-btn crud-remove-btn';
    btnDelete.innerText = 'REMOVE';
    crud.removeClick = () => removeClick(crud, btnDelete);
    btnDelete.addEventListener('click', crud.removeClick);

    crud.resetBtnRemove = () => {
        btnDelete.innerText = 'REMOVE';
        crud.removeConfirmed = false;
    }

    return main;
}

function newClick(crud) {
    crud.removeConfirmed = false;
    crud.selectedDto = crud.create() || {};
    crud.newRegister = true;
    crud.renderForm();
}

function saveClick(crud) {
    crud.resetBtnRemove();
    if (!crud.isValidToSave || crud.isValidToSave(crud.selectedDto)) {
        crud.save(crud.selectedDto, crud);
    }
}

function confirmSave(crud) {
    crud.newRegister = false;
    crud.list(crud);
}

function removeClick(crud, button) {
    if (crud.newRegister) {
        return;
    }
    if (!crud.removeConfirmed) {
        button.innerText = 'CONFIRM';
        crud.removeConfirmed = true;
        return;
    }
    if (!crud.isValidToRemove || crud.isValidToRemove(crud.selectedDto)) {
        crud.remove(crud.selectedDto, crud);
    }
}

function confirmRemove(crud) {
    crud.resetBtnRemove();
    crud.selectedDto = null;
    crud.list(crud);
}

function renderList(crud) {
    let data = crud.displayData;
    if (!Array.isArray(data)) {
        data = [data];
    }

    let main = document.getElementById(crud.bodyListId);
    main.innerHTML = '';

    if (data.length == 0) {
        main.append(crud.noDataDiv);
    }

    crud.listSelectionClass = 'crud-list-selected';

    data.forEach(el => {
        if (!el) {
            return;
        }
        let elComponent = crud.listItemComponent(el, crud.fields);
        if (el == crud.selectedDto ||
            (crud.equals && crud.equals(el, crud.selectedDto) === true)) {
            main.childNodes.forEach(c => c.classList.remove(crud.listSelectionClass));
            elComponent.classList.add(crud.listSelectionClass);
        }
        elComponent.addEventListener('click', () => listItemClick(crud, el, main, elComponent));
        main.append(elComponent);
    });
}

function listItemClick(crud, dto, bodyListDiv, elementDiv) {
    crud.selectedDto = dto;
    crud.newRegister = false;
    crud.renderForm();
    bodyListDiv.childNodes.forEach(c => c.classList.remove(crud.listSelectionClass));
    elementDiv.classList.add(crud.listSelectionClass);
}

function renderForm(crud) {
    let formDiv = document.getElementById(crud.formId);
    formDiv.innerHTML = '';
    formDiv.append(crud.formComponent(crud.selectedDto, crud.fields));
    crud.resetBtnRemove();
}

function createPagger(crud) {
    crud.pagger = newPaginator();
    if (crud.rowsQtt) {
        crud.pagger.setRowsQuantity(crud.rowsQtt);
    }

    if (!crud.paggerDiv) {
        crud.paggerDiv = document.createElement('div');
        crud.mainDiv.append(crud.paggerDiv);
    }
    crud.paggerDiv.className = 'crud-nav';

    let main = document.createElement('div');
    main.id = crud.paggerId;
    crud.paggerDiv.append(main);

    let btnFirst = document.createElement('button');
    main.append(btnFirst);
    btnFirst.addEventListener('click', () => crud.pagger.firstPage());
    btnFirst.innerText = ' < < ';
    btnFirst.className = 'crud-nav-first-btn';

    let btnPrevius = document.createElement('button');
    main.append(btnPrevius);
    btnPrevius.addEventListener('click', () => crud.pagger.previousPage());
    btnPrevius.innerText = ' < ';
    btnPrevius.className = 'crud-nav-previous-btn';

    let inputPage = document.createElement('input');
    inputPage.type = 'number';
    main.append(inputPage);
    crud.pagger.addOnPageChange(() => inputPage.value = crud.pagger.page);
    inputPage.addEventListener('change', () => {
        let pgn = Number.parseInt(inputPage.value);
        if (pgn > 0) {
            crud.pagger.navToPage(pgn);
        }
    });

    let labelPage = document.createElement('label');
    main.append(labelPage);
    crud.pagger.addOnPageChange(() => labelPage.innerText = `/ ${crud.pagger.pagesQtt}`);

    let btnNext = document.createElement('button');
    main.append(btnNext);
    btnNext.addEventListener('click', () => crud.pagger.nextPage());
    btnNext.innerText = ' > ';
    btnNext.className = 'crud-nav-next-btn';

    let btnLast = document.createElement('button');
    main.append(btnLast);
    btnLast.addEventListener('click', () => crud.pagger.lastPage());
    btnLast.innerText = ' > > ';
    btnLast.className = 'crud-nav-last-btn';

    crud.pagger.addOnPageChange(() => {
        crud.displayData = crud.pagger.pageData;
        crud.renderList();
    });
}

function defaultFormComponent(dto, fields) {
    dto = dto || {};
    fields = fields || dto;

    let main = document.createElement('div');
    main.className = 'crud-form';

    Object.keys(fields).forEach(prop => {
        let info = getFormInputInfo(fields, prop);

        let div = document.createElement('div');
        main.append(div);
        div.className = info.className;

        let label = document.createElement('label');
        div.append(label);
        label.innerText = info.label;

        let input = info.input();
        div.append(input);
        input.id = 'crud-input-' + prop;
        label.htmlFor = input.id;

        try {
            info.set(input, dto, prop);
        } catch(err) {
            console.log('Error setting value of ' + prop + ': ', err);
        }
        input.addEventListener('change', () => info.get(input, dto, prop));
    });

    return main;
}

function getFormInputInfo(fields, prop) {
    let info = fields[prop];
    info = info || {};
    if (typeof info == 'string') {
        info = { label: info };
    }
    info.label = info.label || prop;
    if (!info.input || !(info.input instanceof Function)) {
        info.input = () => document.createElement('input');
    }
    if (!info.get || !(info.set instanceof Function)) {
        info.get = (input, dto, prop) => dto[prop] = input.value;
    }
    if (!info.set || !(info.set instanceof Function)) {
        info.set = (input, dto, prop) => input.value = dto[prop];
    }
    info.className = info.className || '';
    info.className += ' crud-form-prop crud-form-' + prop;
    return info;
}

function defaultListHeadComponent(fields) {
    fields = fields || {};

    let thead = document.createElement('thead');

    Object.keys(fields).forEach(prop => {
        let value = fields[prop] || prop;
        if (typeof value != 'string') {
            value = value.label;
        }

        let th = document.createElement('th');
        th.className = 'crud-th crud-th-' + prop;
        thead.append(th);

        let label = document.createElement('label');
        label.innerText = value;
        th.append(label);
    });

    return thead;
}

function defaultListItemComponent(dto, fields) {
    dto = dto || {};
    fields = fields || dto;

    let main = document.createElement('tr');

    Object.keys(fields).forEach(prop => {
        let info = getListCellInfo(fields, prop);

        let td = document.createElement('td');
        td.className = 'crud-td crud-td-' + prop;
        main.append(td);

        let label = document.createElement('label');
        label.innerText = dto[prop] || '';
        td.append(info.listCell(dto, prop));
    });

    return main;
}

function getListCellInfo(fields, prop) {
    let info = fields[prop];
    if (!info || typeof info == 'string') {
        info = {};
    }
    if (!info.listCell || !(info.listCell instanceof Function)) {
        info.listCell = (dto, prop) => {
            let lb = document.createElement('label');
            lb.innerText = dto[prop] || '';
            return lb;
        };
    }
    return info;
}

function defaultNoDataComponent(crud) {
    let tr = document.createElement('tr');
    let td = document.createElement('td');
    tr.append(td);
    td.colSpan = Object.keys(crud.fields).length;
    let h3 = document.createElement('h3');
    h3.innerHTML = 'NO DATA!';
    td.append(h3);
    return tr;
}
