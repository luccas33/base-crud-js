import { newPaginator } from "../util/paginator.js";

let id = 0;

/**
 * Requireds: list(this), save(dto), remove(dto),
 * listComponent(dto) and formComponent(dto),
 * 
 * Optionals: isValidToSave(dto), isValidToRemove(dto),
 * create(), mainDiv, controlDiv, formDiv, listDiv, 
 * paggerDiv and rowsQtt
 * 
 * Call setData(data[]) in your list() to display data
 * 
 * Call confirmSave() when save concluds successfully
 * 
 * Call confirmRemove() where remove concluds successfully
 */
export function createCrud(crud) {
    crud = crud || {};
    id++;
    crud.formId = 'crudFormId_' + id;
    crud.listId = 'crudListId_' + id;
    crud.paggerId = 'crudPaggerId_' + id;
    crud.data = [];
    crud.displayData = [];

    if (!crud.mainDiv) {
        crud.mainDiv = document.createElement('div');
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
        crud.listDiv = document.createElement('div');
        crud.listDiv.className = 'crud-list';
        crud.mainDiv.append(crud.listDiv);
    }
    crud.listDiv.id = crud.listId;

    crud.renderForm = () => renderForm(crud);
    crud.renderList = () => renderList(crud);
    crud.setData = (data) => loadData(crud, data);
    crud.init = () => crud.list(crud);
    crud.confirmSave = () => confirmSave(crud);
    crud.confirmRemove = () => confirmRemove(crud);
    createPagger(crud);

    return crud;
}

function loadData(crud, data) {
    crud.data = data;
    crud.pagger.setData(data);
    crud.displayData = crud.pagger.pageData;
    if (!crud.selectedDto) {
        if (crud.data && crud.data.length > 0) {
            crud.selectedDto = crud.data[0];
        } else {
            crud.selectedDto = crud.create() || {};
        }
    }
    crud.renderList();
    crud.renderForm();
    let paggerDiv = document.getElementById(crud.paggerId);
    paggerDiv.hidden = crud.pagger.pagesQtt < 2 ? 'hidden' : '';
}

function renderControl(crud) {
    let main = document.createElement('div');
    crud.controlDiv.append(main);
    let btnNew = document.createElement('button');
    main.append(btnNew);
    btnNew.className = 'crud-new-btn';
    btnNew.innerText = 'NEW';

    btnNew.addEventListener('click', () => newClick(crud));

    let btnSave = document.createElement('button');
    main.append(btnSave);
    btnSave.className = 'crud-save-btn';
    btnSave.innerText = 'SAVE';
    btnSave.addEventListener('click', () => saveClick(crud));

    let btnDelete = document.createElement('button');
    main.append(btnDelete);
    btnDelete.className = 'crud-remove-btn';
    btnDelete.innerText = 'REMOVE';

    btnDelete.addEventListener('click', () => removeClick(crud, btnDelete));

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
    if (!crud.listComponent || !(crud.listComponent instanceof Function)) {
        return;
    }
    let data = crud.displayData;
    if (!Array.isArray(data)) {
        data = [data];
    }

    let main = document.getElementById(crud.listId);
    main.innerHTML = '';

    crud.listSelectionClass = 'crud-list-selected';

    data.forEach(el => {
        if (!el) {
            return;
        }
        let elComponent = crud.listComponent(el);
        if (el == crud.selectedDto) {
            main.childNodes.forEach(c => c.classList.remove(crud.listSelectionClass));
            elComponent.classList.add(crud.listSelectionClass);
        }
        elComponent.addEventListener('click', () => listItemClick(crud, el, main, elComponent));
        main.append(elComponent);
    });
}

function listItemClick(crud, dto, listDiv, elementDiv) {
    crud.selectedDto = dto;
    crud.newRegister = false;
    crud.renderForm();
    listDiv.childNodes.forEach(c => c.classList.remove(crud.listSelectionClass));
    elementDiv.classList.add(crud.listSelectionClass);
}

function renderForm(crud) {
    let formDiv = document.getElementById(crud.formId);
    formDiv.innerHTML = '';
    formDiv.append(crud.formComponent(crud.selectedDto));
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

    let labelPage = document.createElement('label');
    main.append(labelPage);
    crud.pagger.addOnPageChange(() => labelPage.innerText = `${crud.pagger.page} / ${crud.pagger.pagesQtt}`);

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
