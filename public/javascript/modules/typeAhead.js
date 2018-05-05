import axios from "axios";
import dompurify from "dompurify";

function searchResultsHTML(parks) {
  return parks
    .map(park => {
      return `<a href='/park/${park.slug}' class='search__result'>
      <strong>${park.name}</strong>
      </a>`;
    })
    .join("");
}

function typeAhead(search) {
  if (!search) return; //exit

  //grab search bar and display area for serch results
  const searchInput = search.querySelector("input[name='search']");
  const searchResults = search.querySelector(".search__results");

  searchInput.on("input", function() {
    if (!this.value) {
      searchResults.style.display = "none";
      return; //exit
    }

    searchResults.style.display = "block";
    searchResults.innerHTM = "";

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          searchResults.innerHTML = dompurify.sanitize(
            searchResultsHTML(res.data)
          );
          return;
        }
        //show some text if nothing is returned from the DB
        searchResults.innerHTML = dompurify.sanitize(
          `<div class='search__result'>Sorry, no results for <strong>${
            this.value
          }</strong></div>`
        );
      })
      .catch(err => {
        console.log(err);
      });
  });

  searchInput.on("keyup", e => {
    // if they are not pressing up, down, or enter just ignore it.
    if (![40, 38, 13].includes(e.keyCode)) {
      return;
    }

    const activeClass = "search__result--active";
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll(".search__result");
    let next;

    if (e.keyCode === 40 && current) {
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) {
      next = items[0];
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1];
    } else if (e.keyCode === 38) {
      next = items[items.length - 1];
    } else if (current.href && e.keyCode === 13) {
      window.location = current.href;
      return;
    }
    if (current) {
      current.classList.remove(activeClass);
    }

    next.classList.add(activeClass);
  });
}

export default typeAhead;
