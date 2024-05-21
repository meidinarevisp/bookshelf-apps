document.addEventListener("DOMContentLoaded", function () {
  const inputBookForm = document.getElementById("inputBook");
  const searchBookForm = document.getElementById("searchBook");
  const incompleteBookshelfList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completeBookshelfList = document.getElementById(
    "completeBookshelfList"
  );

  const STORAGE_KEY = "BOOKSHELF_APPS";

  function refreshDataFromBooks() {
    let incompleteBooks = [];
    let completeBooks = [];

    const parsedBooks = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (parsedBooks !== null) {
      incompleteBooks = parsedBooks.filter((book) => !book.isComplete);
      completeBooks = parsedBooks.filter((book) => book.isComplete);
    }

    renderBooks(incompleteBooks, completeBooks);
  }

  function saveDataToStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    refreshDataFromBooks();
  }

  async function addBook(title, author, year, isComplete) {
    const book = {
      id: +new Date(),
      title,
      author,
      year,
      isComplete,
    };

    let books = [];
    const parsedBooks = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (parsedBooks !== null) {
      books = parsedBooks;
    }

    books.push(book);
    saveDataToStorage(books);

    const Toast = Swal.mixin({
      toast: true,
      position: "top",
      iconColor: "green",
      customClass: {
        popup: "colored-toast",
      },
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });

    await Toast.fire({
      icon: "success",
      title: "Book Added Successfully!",
    });

    refreshDataFromBooks();

    const newBookElement = document.querySelector(`[data-id="${book.id}"]`);
    if (newBookElement) {
      newBookElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  function renderBooks(incompleteBooks, completeBooks) {
    incompleteBookshelfList.innerHTML = "";
    completeBookshelfList.innerHTML = "";

    for (const book of incompleteBooks.reverse()) {
      const newBook = makeBookTemplate(book);
      incompleteBookshelfList.appendChild(newBook);
    }

    for (const book of completeBooks.reverse()) {
      const newBook = makeBookTemplate(book);
      completeBookshelfList.appendChild(newBook);
    }
  }

  function editBook(id) {
    const parsedBooks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const bookIndex = parsedBooks.findIndex((book) => book.id === id);

    Swal.fire({
      title: "Edit Buku",
      html:
        '<input id="swal-input1" class="swal2-input" value="' +
        parsedBooks[bookIndex].title +
        '">' +
        '<input id="swal-input2" class="swal2-input" value="' +
        parsedBooks[bookIndex].author +
        '">' +
        '<input id="swal-input3" class="swal2-input" value="' +
        parsedBooks[bookIndex].year +
        '">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "OK",
      cancelButtonText: "Batal",
      preConfirm: () => {
        const title = Swal.getPopup().querySelector("#swal-input1").value;
        const author = Swal.getPopup().querySelector("#swal-input2").value;
        const year = Swal.getPopup().querySelector("#swal-input3").value;

        if (!title || !author || !year) {
          Swal.showValidationMessage(`Silakan lengkapi semua field`);
        }

        return { title: title, author: author, year: year };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        parsedBooks[bookIndex].title = result.value.title;
        parsedBooks[bookIndex].author = result.value.author;
        parsedBooks[bookIndex].year = result.value.year;

        saveDataToStorage(parsedBooks);

        Swal.fire("Berhasil!", "Buku berhasil diedit.", "success");
      }
    });
  }

  function makeBookTemplate({ id, title, author, year, isComplete }) {
    const bookItem = document.createElement("article");
    bookItem.classList.add("book_item");
    bookItem.setAttribute("data-id", id);

    const bookTitle = document.createElement("h3");
    bookTitle.innerText = title;

    const bookAuthor = document.createElement("p");
    bookAuthor.innerText = `Penulis: ${author}`;

    const bookYear = document.createElement("p");
    bookYear.innerText = `Tahun: ${year}`;

    const action = document.createElement("div");
    action.classList.add("action");

    const buttonComplete = document.createElement("button");
    buttonComplete.classList.add(isComplete ? "yellow" : "green");

    const completeIcon = document.createElement("img");
    completeIcon.src = isComplete ? "images/wrong.png" : "images/check.png";
    completeIcon.alt = isComplete ? "Belum selesai dibaca" : "Selesai dibaca";
    completeIcon.width = 20;
    completeIcon.height = 20;

    buttonComplete.appendChild(completeIcon);

    buttonComplete.addEventListener("click", function () {
      toggleBookStatus(id);
    });

    const buttonEdit = document.createElement("button");
    buttonEdit.classList.add("blue");

    const icon = document.createElement("img");
    icon.src = "images/edit.png";
    icon.alt = "Edit";
    icon.width = 20;
    icon.height = 20;

    buttonEdit.appendChild(icon);

    buttonEdit.addEventListener("click", function () {
      editBook(id);
    });

    const buttonDelete = document.createElement("button");
    buttonDelete.classList.add("red");

    const deleteIcon = document.createElement("img");
    deleteIcon.src = "images/trash.png";
    deleteIcon.alt = "Delete";
    deleteIcon.width = 20;
    deleteIcon.height = 20;

    buttonDelete.appendChild(deleteIcon);

    buttonDelete.addEventListener("click", function () {
      Swal.fire({
        title: "Apakah Anda yakin ingin menghapus buku ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      }).then((result) => {
        if (result.isConfirmed) {
          deleteBook(id);
          Swal.fire("Buku berhasil dihapus!", "", "success");
        }
      });
    });

    action.appendChild(buttonComplete);
    action.appendChild(buttonEdit);
    action.appendChild(buttonDelete);

    bookItem.appendChild(bookTitle);
    bookItem.appendChild(bookAuthor);
    bookItem.appendChild(bookYear);
    bookItem.appendChild(action);

    return bookItem;
  }

  function toggleBookStatus(id) {
    const parsedBooks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const bookIndex = parsedBooks.findIndex((book) => book.id === id);

    parsedBooks[bookIndex].isComplete = !parsedBooks[bookIndex].isComplete;
    saveDataToStorage(parsedBooks);
  }

  function deleteBook(id) {
    const parsedBooks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const filteredBooks = parsedBooks.filter((book) => book.id !== id);
    saveDataToStorage(filteredBooks);
  }

  function filterBooksByTitle(searchTitle) {
    const parsedBooks = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (parsedBooks !== null) {
      const filteredBooks = parsedBooks.filter((book) =>
        book.title.toLowerCase().includes(searchTitle)
      );
      const incompleteBooks = filteredBooks.filter((book) => !book.isComplete);
      const completeBooks = filteredBooks.filter((book) => book.isComplete);

      renderBooks(incompleteBooks, completeBooks);

      const firstMatchingBook = document.querySelector(".book_item");
      if (firstMatchingBook) {
        firstMatchingBook.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  inputBookForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("inputBookTitle").value;
    const author = document.getElementById("inputBookAuthor").value;
    const year = document.getElementById("inputBookYear").value;
    const isComplete = document.getElementById("inputBookIsComplete").checked;

    addBook(title, author, year, isComplete);

    inputBookForm.reset();
  });

  searchBookForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const searchTitle = document
      .getElementById("searchBookTitle")
      .value.toLowerCase();
    filterBooksByTitle(searchTitle);
  });

  refreshDataFromBooks();
});
