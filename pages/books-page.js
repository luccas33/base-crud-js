import { booksService } from "../services/books-service.js";
import { createCrud } from "../shared/base-crud.js";
import { createHeader } from "../shared/header.js";

export function createBooksPage() {
    let page = {};
    page.mainDiv = document.createElement('div');

    let header = createHeader();
    page.mainDiv.append(header.mainDiv);

    let crud = createCrud({
        list,
        create,
        remove,
        save,
        listComponent: listComponent,
        formComponent: bookForm,
        isValidToSave,
        rowsQtt: 10
    });
    page.mainDiv.append(crud.mainDiv);
    crud.mainDiv.className = 'books-crud';

    page.init = () => {
        header.init();
        crud.init();
    };

    return page;
}

function list(crud) {
    booksService.list()
        .then(data => {
            data.sort((o1, o2) => o1.title.localeCompare(o2.title));
            crud.setData(data);
        })
        .catch(err => console.log(err));
}

function save(book, crud) {
    booksService.save(book)
        .then(success => {
            if (success) {
                crud.confirmSave();
            }
        })
        .catch(err => console.log(err));
}

function remove(book, crud) {
    booksService.remove(book)
        .then(success => {
            if (success) {
                crud.confirmRemove();
            }
        })
        .catch(err => console.log(err));
}

function listComponent(book) {
    book = book || {};

    let main = document.createElement('div');

    let titleDiv = document.createElement('div');
    titleDiv.className = 'w40';
    main.append(titleDiv);
    let title = document.createElement('label');
    titleDiv.append(title);
    title.innerText = book.title || '';

    let descDiv = document.createElement('div');
    descDiv.className = 'w60';
    main.append(descDiv);
    let desc = document.createElement('label');
    descDiv.append(desc);
    desc.innerText = book.description || '';

    return main;
}

function bookForm(book) {
    if (!book) {
        book = { title: '', description: '', bar_code: '' };
    }

    let mainDiv = document.createElement('div');

    let divTitle = document.createElement('div');
    mainDiv.append(divTitle);
    divTitle.className = 'form-field-div';
    let lbTitle = document.createElement('label');
    divTitle.append(lbTitle);
    lbTitle.innerText = 'Title';
    let iptTitle = document.createElement('input');
    divTitle.append(iptTitle);
    iptTitle.value = book.title;
    iptTitle.addEventListener('change', () => book.title = iptTitle.value);

    let divDesc = document.createElement('div');
    mainDiv.append(divDesc);
    divDesc.className = 'form-field-div';
    let lbDesc = document.createElement('label');
    divDesc.append(lbDesc);
    lbDesc.innerText = 'Description';
    let iptDesc = document.createElement('input');
    divDesc.append(iptDesc);
    iptDesc.value = book.description;
    iptDesc.addEventListener('change', () => book.description = iptDesc.value);

    return mainDiv;
}

function create() {
    return {
        title: '',
        description: ''
    }
}

function isValidToSave(book) {
    if (!book) {
        return false;
    }
    if (!book.title || !book.title.trim().lenght == 0) {
        alert('Title can\'t be blank');
        return false;
    }
    if (!book.description || !book.description.trim().lenght == 0) {
        alert('Description can\'t be blank');
        return false;
    }
    return true;
}
