
export function newPaginator() {
    let paginator = {
        rowsQtt: 10,
        data: [],
        pagesQtt: 1,
        page: 1,
        pageData: [],
        onPageChange: []
    };

    paginator.setData = (list) => {
        if (!list) {
            return;
        }
        paginator.data = list;
        paginator.calcPages();
    }

    paginator.setRowsQuantity = (qtt) => {
        paginator.rowsQtt = qtt;
        paginator.calcPages();
    }

    paginator.addOnPageChange = (runner) => {
        paginator.onPageChange.push(runner);
    }

    paginator.firstPage = () => {
        paginator.navToPage(1);
    }

    paginator.nextPage = () => {
        paginator.navToPage(paginator.page + 1);
    }

    paginator.previousPage = () => {
        paginator.navToPage(paginator.page - 1);
    }

    paginator.lastPage = () => {
        paginator.navToPage(paginator.pagesQtt);
    }

    paginator.navToPage = (pg) => {
        if (paginator.data.length === 0) {
            return;
        }
        pg = pg < 1 ? 1 : pg;
        pg = pg > paginator.pagesQtt ? paginator.pagesQtt : pg;
        paginator.page = pg;
        let startIndex = (pg - 1) * paginator.rowsQtt;
        let endIndex = startIndex + paginator.rowsQtt - 1;
        endIndex = endIndex >= paginator.data.length ? paginator.data.length - 1 : endIndex;
        endIndex = endIndex < 0 ? 0 : endIndex;
        paginator.pageData = paginator.data.slice(startIndex, endIndex + 1);
        paginator.onPageChange.forEach(runner => runner());
    }

    paginator.navToIndex = (index) => {
        index = index < 0 ? 0 : index;
        let pageNumber = Math.trunc(index / paginator.rowsQtt) + 1;
        paginator.navToPage(pageNumber);
    }

    paginator.calcPages = () => {
        paginator.rowsQtt = paginator.rowsQtt < 1 ? 10 : paginator.rowsQtt;
        paginator.pagesQtt = Math.trunc(paginator.data.length / paginator.rowsQtt);
        if (paginator.data.length % paginator.pagesQtt !== 0) {
            paginator.pagesQtt++;
        }
        paginator.firstPage();
    }

    return paginator;
}
