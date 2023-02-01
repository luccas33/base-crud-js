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
        isValidToSave,
        equals,
        title: 'Books CRUD',
        rowsQtt: 10,
        fields: {
            title: 'Title',
            author: 'Author',
            description: 'Description'
        }
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

function equals(book1, book2) {
    return book1 && book2
        && (book1.title == book2.title
            || book1.id == book2.id);
}
