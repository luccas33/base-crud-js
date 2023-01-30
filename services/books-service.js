
let id = 0;

function newBook(title, description) {
    id++;
    return {id: '' + id, title, description, bar_code: '' + id}
}

const defaultBooks = [];

for (let i = 1; i <= 30; i++) {
    let bookNumber = i + '';
    bookNumber = (bookNumber.length < 2 ? '0' : '') + bookNumber
    defaultBooks.push(newBook('Book ' + bookNumber, 'Book\'s ' + bookNumber + ' description'));
}

async function list() {
    let booksApi = localStorage.getItem('books');
    if (!booksApi) {
        return defaultBooks;
    }
    return JSON.parse(booksApi);
}

async function save(book) {
    let books = await list();
    if (book.id) {
        books = books.filter(b => b.id != book.id);
    } else {
        let id = 0;
        books.forEach(b => id = b.id > id ? b.id : id);
        id++;
        book.id = id;
    }
    books.push(book);
    localStorage.setItem('books', JSON.stringify(books));
    return true;
}

async function remove(book) {
    let books = await list();
    console.log(books);
    books = books.filter(b => b.id != book.id);
    localStorage.setItem('books', JSON.stringify(books));
    return true;
}

export const booksService = {list, save, remove};
