const main = document.getElementById("main");
const form = document.getElementById("form");
const favJokesToggler = document.getElementById("fav-jokes-toggler");
const randomInput = document.getElementById("random");
const categoriesInput = document.getElementById("categories");
const searchInput = document.getElementById("search");
const categoriesWrapper = document.querySelector(".categories-wrapper");
const searchWrapper = document.querySelector(".search-wrapper");
const inputField = document.getElementById("input-field");
const jokesWrapper = document.querySelector(".jokes-wrapper");
const favsWrapper = document.querySelector(".favs-wrapper");
const randomJokeUrl = "https://api.chucknorris.io/jokes/random";

let categoryJokeUrl = "";
let searchQueryUrl = "";
let emptyCategoryError = document.querySelector(".empty-category");
let emptyTextError = document.querySelector(".empty-text");
let jokesData = [];
let favJokes = JSON.parse(localStorage.getItem("favourite-jokes")) ?
  JSON.parse(localStorage.getItem("favourite-jokes")) : [];

fetchJokesCategories();
renderFavJokes();
attachEventListeners();

function fetchJokesCategories() {
  fetch("https://api.chucknorris.io/jokes/categories")
    .then(response => response.json())
    .then(data => {
      renderJokesCategories(data);
    });
}

function fetchRandomJoke(url = randomJokeUrl) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      jokesWrapper.innerHTML = ``;
      renderSingleJoke(data);
      if (jokesData.indexOf(data) === -1) {
        jokesData.push(data);
      }
    });
}

function fetchCategoryJoke() {
  if (!categoryJokeUrl) {
    if (!emptyCategoryError) {
      emptyCategoryError = document.createElement("div");
      emptyCategoryError.classList.add("empty-category");
      emptyCategoryError.innerHTML = `
        <p>Please choose the category.</p>
      `;
      categoriesWrapper.append(emptyCategoryError);
    }
  } else {
    fetchRandomJoke(categoryJokeUrl);
  }
}

function fetchQueryJoke(url = searchQueryUrl) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      renderMultipleJokes(data);
      jokesData.push(...data.result);
    });
}

function handleSearchSubmit() {
  const regex = new RegExp(/^[A-Za-z -]{3,}$/);
  if (!regex.test(inputField.value)) {
    if (!emptyTextError) {
      emptyTextError = document.createElement("div");
      emptyTextError.classList.add("empty-text");
      emptyTextError.innerHTML = `
        <p>Please enter at least three alphabetic symbols.</p>
      `;
      searchWrapper.append(emptyTextError);
    }
    return;
  }
  if (emptyTextError) {
    emptyTextError.remove();
    emptyTextError = null;
  }
  searchQueryUrl = `https://api.chucknorris.io/jokes/search?query=${inputField.value}`;
  fetchQueryJoke();
  inputField.value = "";
}

// Helper function to count time from `updated_at` till current moment
function substractHours(pastDate) {
  let delta = (new Date().getTime() - new Date(pastDate.replace(/ /g, "T")).getTime()) / 1000;
  delta /= (60 * 60);
  return Math.abs(Math.round(delta));
}

function renderJokesCategories(data) {
  data.forEach((category) => {
    categoriesWrapper.innerHTML += `
      <span class="category-tag" data-name="${category}">${category}</span>
    `;
  });
}

function renderSingleJoke(data) {
  const jokeCard = document.createElement("div");
  jokeCard.classList.add("joke-card");
  jokeCard.dataset.id = data.id;
  let categoryClass = data.categories.length === 0 ? "no-category" : "joke-category";
  let buttonClass = "favourite-heart";
  favJokes.forEach(joke => {
    if (data.id === joke.id) {
      buttonClass = "favourite-heart is-favourite";
    }
  });
  jokeCard.innerHTML = `
    <div class="joke-icon">
     <img src="./assets/message.svg" alt="static-icon">
    </div>
    <p class="joke-id">ID: <a href="https://api.chucknorris.io/jokes/${data.id}" target="_blank">${data.id}</a></p>
    <p class="joke-text">${data.value}</p>
    <div class="card-bottom">
      <p class="last-update">Last update: ${substractHours(data.updated_at)} hours ago</p>
      <p class="${categoryClass}">${data.categories}</p>
    </div>
    <button data-id=${data.id} class="${buttonClass}"></button>
  `;
  const favButton = jokeCard.querySelector("button");
  toggleFavJoke(favButton);
  jokesWrapper.appendChild(jokeCard);
}

function renderMultipleJokes(data) {
  const notFoundMessage = document.createElement("div");
  notFoundMessage.classList.add("not-found");
  jokesWrapper.innerHTML = ``;
  if (data.result.length === 0) {
    notFoundMessage.innerHTML = `
      <p>Joke is not found. Please try another query.</p>
    `;
    jokesWrapper.appendChild(notFoundMessage);
  } else {
    data.result.forEach(joke => {
      renderSingleJoke(joke);
    });
  }
}

function renderFavJokes() {
  if (favsWrapper) {
    favsWrapper.innerHTML = ``;
  }
  favJokes.forEach((joke) => {
    const jokeCard = document.createElement("div");
    jokeCard.classList.add("fav-joke-card");
    jokeCard.dataset.id = joke.id;
    jokeCard.innerHTML = `
      <div class="joke-icon">
        <img src="./assets/message.svg" alt="static-icon">
      </div>
      <p class="joke-id">ID: <a href="https://api.chucknorris.io/jokes/${joke.id}" target="_blank">${joke.id}</a></p>
      <p class="joke-text">${joke.value}</p>
      <p class="last-update">Last update: ${substractHours(joke.updated_at)} hours ago</p>
      <button data-id=${joke.id} class="favourite-heart is-favourite"></button>
    `;
    const favButton = jokeCard.querySelector("button");
    removeFavJoke(favButton);
    favsWrapper.appendChild(jokeCard);
  });
}

function toggleFavJoke(button) {
  button.addEventListener("click", event => {
    let favToRemove;
    let favToAdd;
    jokesData.forEach((joke) => {
      if (joke.id === event.target.dataset.id) {
        if (favJokes.length === 0) {
          favJokes.push(joke);
        } else {
          favJokes.forEach((favJoke, index) => {
            if (joke.id === favJoke.id) {
              favToRemove = index;
            } else if (joke.id !== favJoke.id) {
              favToAdd = joke;
            }
          });
          (favToRemove !== undefined) ? favJokes.splice(favToRemove, 1) : favJokes.push(favToAdd);
        }
        event.target.classList.toggle("is-favourite");
      }
    });
    localStorage.setItem("favourite-jokes", JSON.stringify(favJokes));
    renderFavJokes();
  });
}

function removeFavJoke(button) {
  button.addEventListener("click", event => {
    favJokes.forEach((joke) => {
      if (joke.id === event.target.dataset.id) {
        const jokeCard = document.querySelector(`.jokes-wrapper [data-id="${event.target.dataset.id}"]`);
        if (jokeCard) {
          const jokeCardFavButton = jokeCard.querySelector("button");
          jokeCardFavButton.classList.remove("is-favourite");
        }
        favJokes.splice(favJokes.indexOf(joke), 1);
        localStorage.setItem("favourite-jokes", JSON.stringify(favJokes));
        renderFavJokes();
      }
    });
  });
}

// Function to reset chosen categories, search input field and clear error messages
function resetMainUi(event) {
  if (event.target.value === "random" || event.target.value === "categories") {
    inputField.value = "";
    if (emptyTextError) {
      emptyTextError.remove();
      emptyTextError = null;
    }
  }
  if (event.target.value === "random" || event.target.value === "search") {
    let activeCategory = categoriesWrapper.querySelector(".is-active");
    if (activeCategory) {
      activeCategory.classList.remove("is-active");
      categoryJokeUrl = "";
    }
    if (emptyCategoryError) {
      emptyCategoryError.remove();
      emptyCategoryError = null;
    }
  }
}

function attachEventListeners() {
  randomInput.addEventListener("click", event => resetMainUi(event));

  categoriesInput.addEventListener("click", event => resetMainUi(event));

  searchInput.addEventListener("click", event => resetMainUi(event));

  favJokesToggler.addEventListener("click", () => {
    main.classList.toggle("handle-overflow");
  });

  categoriesWrapper.addEventListener("click", event => {
    event.stopPropagation();
    if (event.target.classList.value === "category-tag") {
      if (emptyCategoryError) {
        emptyCategoryError.remove();
        emptyCategoryError = null;
      }
      categoryJokeUrl = `https://api.chucknorris.io/jokes/random?category=${event.target.dataset.name}`;
      let activeCategory = event.target;
      let cateroryTags = categoriesWrapper.querySelectorAll(".category-tag");
      cateroryTags.forEach(category => {
        if (category === activeCategory) {
          category.classList.add("is-active");
        } else {
          category.classList.remove("is-active");
        }
      });
    }
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const inputs = form.querySelectorAll(".radio-input");
    inputs.forEach(input => {
      if (input.checked) {
        switch (input.value) {
          case "random":
            fetchRandomJoke();
            break;
          case "categories":
            fetchCategoryJoke();
            break;
          case "search":
            handleSearchSubmit();
            break;
        }
      }
    });
  });
}
