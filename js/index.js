import { getResponse, api_url, getCapitalized } from "./../js/functions.js";

let url_search = window.location.search;
let urlParams = new URLSearchParams(url_search);
let url_section = urlParams.get("section");
let url_section_id = urlParams.get("id");
let url_page = urlParams.get("page");
let url_current = `/?section=${url_section}`;

// change the html page's title
let title = document.getElementById("title");
title.innerHTML =
  "StarWars World" + (url_section ? " - " + getCapitalized(url_section) : "");
//get main menu
async function getMainMenu(url = api_url) {
  let entities = await getResponse(url);
  let htmlSegment = "";
  let html = "";
  htmlSegment += `<a class="navbar-brand" href='/'>Home</a>`;
  Object.keys(entities).forEach((entity) => {
    let entity_link = entities[entity].substr(api_url.length).split("/")[0];
    htmlSegment += `<a class="navbar-brand" href='?section=${entity_link}'>${getCapitalized(
      entity
    )}</a>`;
  });
  let navbar = document.querySelector(".navbar");
  html +=
    '<div class="container-fluid containerMainMenue">' + htmlSegment + "</div>";
  return (navbar.innerHTML += html);
}
// only for the main page
async function getMainPage(url = api_url) {
  let entities = await getResponse(url);
  let htmlSegment = "";

  Object.keys(entities).forEach((entity) => {
    let entity_link = entities[entity].substr(api_url.length).split("/")[0];
    htmlSegment += `<a class='btn btn-dark btn-lg' href='?section=${entity_link}' role='button'>${getCapitalized(
      entity
    )}</a>`;
  });
  return `<div class="d-grid gap-3 col-3 mx-auto">` + htmlSegment + `</div>`;
}
// only for child pages people, cars, planets, etc.
async function getChaildPage(url) {
  let entities = await getResponse(url);
  let htmlSegment = "";
  let i = 0;
  for (let card in entities.results) {
    i++;
    htmlSegment += await getChaildCard(entities.results[card], i);
  }
  htmlSegment += getPagination(entities.previous, entities.next);

  return htmlSegment;
}
// generates each child page card separately
async function getChaildCard(data, i) {
  let htmlSegment = "";
  let htmlSegment1 = "";
  let htmlSegment2 = "";
  let num = 0;
  htmlSegment += `<div class="col"><div class="card w-auto mw-100"><div class="card-top card-body">`;
  for (let elem in data) {
    let elem_key = elem;
    let elem_value = "";
    //checking that data is not empty or null
    if (data[elem] !== null && data[elem].length !== 0) {
      // if data is string
      if (typeof data[elem] === "string") {
        if (data[elem].includes(api_url)) {
          elem_value = await getNamesFromUrl(data[elem]);
        } else {
          elem_value = data[elem];
        }
      } else if (typeof data[elem] === "number") {
        // if data is number
        num = data[elem];
        elem_value = num.toString();
        // if data is other
      } else {
        elem_value = await getNamyNamesFromUrl(data[elem]);
      }
      // getting names of titles for card header
      if (elem_key === "name" || elem_key === "title") {
        let nameOrTitle = elem_value;
        htmlSegment += `<h5 class="card-title">${nameOrTitle}</h5><p class="card-text">`;
      } else if (elem_value.indexOf("href") < 0) {
        htmlSegment1 += `<b>${getCapitalized(elem_key)}</b>: ${elem_value}<br>`;
      } else {
        htmlSegment2 += `<b>${getCapitalized(elem_key)}</b>: ${elem_value}<br>`;
      }
    }
  }
  htmlSegment +=
    htmlSegment1 +
    `</p>
    </div>
    <ul class="list-group list-group-flush collapse" id="collapseButton${i}">
      <li class="list-group-item">` +
    htmlSegment2 +
    `</li>
    </ul>
    <div class="card-body">`;
  htmlSegment += `<a class="btn btn-light collapsed" data-bs-toggle="collapse" href="#collapseButton${i}" role="button" aria-expanded="false" aria-controls="collapseButton${i}">
      </a>`;
  htmlSegment += `</div></div></div>`;
  return htmlSegment;
}
//getting real names from URLs
async function getNamyNamesFromUrl(urls) {
  let htmlSegment = "";
  for (let url in urls) {
    htmlSegment += (await getNamesFromUrl(urls[url])) + ", ";
  }

  return htmlSegment.slice(0, -2) + (urls.length > 1 ? "." : "");
}

async function getNamesFromUrl(url) {
  let name_url = url.split(api_url)[1].split("/");

  let use_real_names = true;
  if (use_real_names) {
    let card = await getResponse(api_url + name_url[0] + "/" + name_url[1]);
    let card_name_or_title = card.title ? card.title : card.name;
    let card_url = "/?section=" + name_url[0] + "&id=" + name_url[1];
    return `<a class="link-secondary" href=${card_url}>${card_name_or_title}</a>`;
  } else {
    let card_name_or_title = url;
    let card_url = "/?section=" + name_url[0] + "&id=" + name_url[1];
    return `<a class="link-secondary" href=${card_url}>${card_name_or_title}</a>`;
  }
}
//get data with a specific id
async function getCardPage(section, id) {
  let url = api_url + section + "/" + id;
  let entities = await getResponse(url);
  let htmlSegment = "";
  htmlSegment = await getChaildCard(entities);
  return htmlSegment;
}
//this function is for pagination
function getPagination(urlPrevious, urlNext) {
  let htmlPrevius = urlPrevious
    ? `<a class="btn btn-outline-dark" role="button" href='${url_current}&${urlPrevious.substr(
        `${api_url + url_section}`.length + 2
      )}'><< Previous</a>`
    : "Previous";
  let htmlNext = urlNext
    ? `<a class="btn btn-outline-dark" role="button" href='${url_current}&${urlNext.substr(
        `${api_url + url_section}`.length + 2
      )}'>Next >></a>`
    : "Next";
  let pagination = `<div class='previus'>${htmlPrevius}</div><div class='page'>{ Page ${
    url_page ? url_page : 1
  } }</div><div class='next'>${htmlNext}</div>`;
  return `<div id='pagination'>${pagination}</div>`;
}
//primary function which creates the main menu and returns data for the page depending on the URL.
async function getStarWarsEntities(url_section) {
  let request_url =
    api_url +
    (url_section ? url_section : "") +
    (url_page ? `?page=${url_page}` : "");
  let htmlSegment = "";
  getMainMenu();
  if (url_section) {
    if (url_section_id) {
      htmlSegment =
        '<div class="row row-cols-1 row-cols-md-1 g-4">' +
        (await getCardPage(url_section, url_section_id)) +
        "</div>";
    } else if (url_section === "films") {
      htmlSegment =
        '<div class="row row-cols-1 row-cols-md-1 g-4">' +
        (await getChaildPage(request_url)) +
        "</div>";
    } else {
      htmlSegment =
        '<div class="row row-cols-1 row-cols-md-3 g-4">' +
        (await getChaildPage(request_url)) +
        "</div>";
    }
  } else {
    htmlSegment = await getMainPage();
  }

  let container = document.getElementById("container");
  container.innerHTML = htmlSegment;
}

getStarWarsEntities(url_section);
