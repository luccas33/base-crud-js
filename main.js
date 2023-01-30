import { createBooksPage } from "./pages/books-page.js";

let booksPage = createBooksPage();
document.body.append(booksPage.mainDiv);
booksPage.init();
