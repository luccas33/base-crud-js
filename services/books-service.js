
let id = 0;
let categoryNumber = -1;

const categories = [];
for (let i = 1; i <= 5; i++) {
    categories.push('Category ' + i);
}

function newBook(title, description, author) {
    id++;
    categoryNumber++;
    if (categoryNumber > 4) {
        categoryNumber = 0;
    }
    return {id: id, 
        title, 
        description, 
        author, 
        category: categories[categoryNumber]};
}

const defaultBooks = [];

for (let i = 1; i <= 30; i++) {
    let bookNumber = i + '';
    bookNumber = (bookNumber.length < 2 ? '0' : '') + bookNumber
    defaultBooks.push(newBook('Book ' + bookNumber, 'Book\'s ' + bookNumber + ' description', 'Author' + bookNumber));
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
    books = books.filter(b => b.id != book.id);
    localStorage.setItem('books', JSON.stringify(books));
    return true;
}

export const booksService = {list, save, remove, categories};
