// app.js - a simple SPA for the Spoke & Chain Co-op
// It has: data, pages, a router, and some functions for the buttons and form.

// ---------- DATA ----------
var workshops = [
  { id: 1, title: "Fix a Puncture", level: "beginner", when: "First Saturday, 10am", spaces: 6,
    text: "Take a wheel off, find the hole and patch the tube." },
  { id: 2, title: "Brakes and Gears", level: "intermediate", when: "Second Saturday, 10am", spaces: 6,
    text: "Adjust the cables and brake pads so everything works smoothly." },
  { id: 3, title: "Wheel Truing", level: "advanced", when: "Third Saturday, 10am", spaces: 4,
    text: "Use a truing stand and spoke key to fix a wobbly wheel." },
  { id: 4, title: "Bike Basics for Kids", level: "beginner", when: "Last Sunday, 11am", spaces: 8,
    text: "A relaxed session for ages 8 to 12 about tyres, chains and safety." }
];

var services = [
  { title: "Walk-in Repair", text: "Bring your bike and a volunteer will show you how to fix it." },
  { title: "Secondhand Parts", text: "Tyres, tubes, chains and brake pads at low prices." },
  { title: "Free Safety Check", text: "A 15 minute check of your brakes, gears and tyres." }
];

var hours = [
  ["Tuesday", "5pm - 8pm", "Open repair night"],
  ["Thursday", "5pm - 8pm", "Women and non-binary night"],
  ["Saturday", "10am - 3pm", "Family repair day"],
  ["Sunday", "Closed", "-"]
];

// ---------- STATE ----------
// bookings are saved in localStorage so they are still there after a refresh
var bookings = [];
try {
  bookings = JSON.parse(localStorage.getItem("bookings")) || [];
} catch (e) {
  bookings = [];
}
var currentFilter = "all";
var message = "";

function saveBookings() {
  try {
    localStorage.setItem("bookings", JSON.stringify(bookings));
  } catch (e) {
    console.log("Could not save bookings");
  }
}

// ---------- HELPER FUNCTIONS ----------
// stops the user's text from being run as HTML
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// spaces left = total spaces minus the bookings for that workshop
function spacesLeft(workshop) {
  var taken = 0;
  for (var i = 0; i < bookings.length; i++) {
    if (bookings[i].workshopId === workshop.id) {
      taken++;
    }
  }
  return workshop.spaces - taken;
}

function findWorkshop(id) {
  for (var i = 0; i < workshops.length; i++) {
    if (workshops[i].id === id) {
      return workshops[i];
    }
  }
  return null;
}

// ---------- PAGES ----------
// each function returns the HTML for one page

function homePage() {
  return '<section class="hero">' +
    '<h1 tabindex="-1">Fix your bike. Learn how it works.</h1>' +
    '<p>Volunteer mechanics help you repair your own bike.</p>' +
    '<a class="button" href="#/workshops" data-link>Browse workshops</a>' +
    '<img src="assets/hero-bike.svg" width="640" height="400" alt="Drawing of a bicycle with yellow wheels">' +
    '</section>';
}

function servicesPage() {
  var html = '<h1 tabindex="-1">What We Do</h1><div class="grid">';
  for (var i = 0; i < services.length; i++) {
    html += '<article class="card"><h2>' + services[i].title + '</h2><p>' + services[i].text + '</p></article>';
  }
  return html + '</div>';
}

function hoursPage() {
  var html = '<h1 tabindex="-1">Opening Hours</h1>' +
    '<table><caption>Weekly opening hours</caption>' +
    '<thead><tr><th scope="col">Day</th><th scope="col">Time</th><th scope="col">Session</th></tr></thead><tbody>';
  for (var i = 0; i < hours.length; i++) {
    html += '<tr><th scope="row">' + hours[i][0] + '</th><td>' + hours[i][1] + '</td><td>' + hours[i][2] + '</td></tr>';
  }
  return html + '</tbody></table>';
}

function workshopsPage() {
  var levels = ["all", "beginner", "intermediate", "advanced"];
  var html = '<h1 tabindex="-1">Monthly Workshops</h1><div class="filters" role="group" aria-label="Filter by level">';

  for (var i = 0; i < levels.length; i++) {
    html += '<button type="button" class="filter-btn" id="filter-' + levels[i] + '" ' +
      'aria-pressed="' + (currentFilter === levels[i]) + '" ' +
      'onclick="setFilter(\'' + levels[i] + '\')">' + levels[i] + '</button>';
  }
  html += '</div><div class="grid">';

  for (var j = 0; j < workshops.length; j++) {
    var w = workshops[j];
    if (currentFilter !== "all" && w.level !== currentFilter) {
      continue; // skip workshops that do not match the filter
    }
    var left = spacesLeft(w);
    html += '<article class="card"><h2>' + w.title + '</h2>' +
      '<p class="tag">' + w.level + '</p>' +
      '<p>' + w.text + '</p>' +
      '<p><strong>When:</strong> ' + w.when + '</p>' +
      '<p><strong>Spaces left:</strong> ' + left + ' of ' + w.spaces + '</p>';
    if (left > 0) {
      html += '<a class="button" href="#/book?workshop=' + w.id + '" data-link>Book this workshop</a>';
    } else {
      html += '<p class="full">Fully booked</p>';
    }
    html += '</article>';
  }
  return html + '</div>';
}

function bookPage(params) {
  var chosen = Number(params.get("workshop")); // from the URL, e.g. #/book?workshop=2
  var options = '<option value="">Choose a workshop</option>';
  for (var i = 0; i < workshops.length; i++) {
    var w = workshops[i];
    options += '<option value="' + w.id + '"' + (w.id === chosen ? ' selected' : '') + '>' +
      w.title + ' (' + spacesLeft(w) + ' spaces left)</option>';
  }
  return '<h1 tabindex="-1">Book a Workshop Place</h1>' +
    '<form id="booking-form" onsubmit="return submitBooking(event)" novalidate>' +
    '<p>Fields marked * are required.</p>' +
    '<label for="name">Full name *</label>' +
    '<input type="text" id="name" autocomplete="name">' +
    '<p class="error" id="name-error"></p>' +
    '<label for="email">Email address *</label>' +
    '<input type="email" id="email" autocomplete="email">' +
    '<p class="error" id="email-error"></p>' +
    '<label for="workshop">Workshop *</label>' +
    '<select id="workshop">' + options + '</select>' +
    '<p class="error" id="workshop-error"></p>' +
    '<button type="submit">Reserve my place</button>' +
    '</form>';
}

function bookingsPage() {
  var html = '<h1 tabindex="-1">My Bookings</h1>';
  if (message !== "") {
    html += '<p class="success" role="status">' + escapeHtml(message) + '</p>';
    message = ""; // only show the message once
  }
  if (bookings.length === 0) {
    return html + '<p>You have no bookings yet. <a href="#/workshops" data-link>See the workshops</a>.</p>';
  }
  html += '<ul class="booking-list">';
  for (var i = 0; i < bookings.length; i++) {
    var b = bookings[i];
    var w = findWorkshop(b.workshopId);
    html += '<li class="booking"><div><strong>' + w.title + '</strong><br>' +
      escapeHtml(b.name) + ' (' + escapeHtml(b.email) + ')<br>' + w.when + '</div>' +
      '<button type="button" class="cancel-btn" onclick="cancelBooking(' + b.id + ')">Cancel</button></li>';
  }
  return html + '</ul>';
}

function notFoundPage() {
  return '<h1 tabindex="-1">404 - Page not found</h1>' +
    '<p>Sorry, that page does not exist.</p>' +
    '<a class="button" href="#/" data-link>Go back home</a>';
}

function errorPage(error) {
  return '<h1 tabindex="-1">Something went wrong</h1>' +
    '<p class="error-box">' + escapeHtml(error.message) + '</p>' +
    '<a class="button" href="#/" data-link>Go back home</a>';
}

// this page throws an error on purpose so I can test the error page
function testErrorPage() {
  throw new Error("This is a test error to check the error page works.");
}

// ---------- ROUTES ----------
var routes = {
  "/": { title: "Home", page: homePage },
  "/services": { title: "Services", page: servicesPage },
  "/hours": { title: "Opening Hours", page: hoursPage },
  "/workshops": { title: "Workshops", page: workshopsPage },
  "/book": { title: "Book a Place", page: bookPage },
  "/bookings": { title: "My Bookings", page: bookingsPage },
  "/test-error": { title: "Error Test", page: testErrorPage }
};

// ---------- ROUTER ----------
var app = document.getElementById("app");

// shows the page that matches the current URL
function loadPage(useFade) {
  var hash = location.hash.slice(1) || "/";   // e.g. "/book?workshop=2"
  var parts = hash.split("?");
  var path = parts[0];
  var params = new URLSearchParams(parts[1] || "");

  function showPage() {
    var title = "Page not found";
    try {
      if (routes[path]) {
        app.innerHTML = routes[path].page(params);
        title = routes[path].title;
      } else {
        app.innerHTML = notFoundPage();
      }
    } catch (error) {
      console.error(error);
      app.innerHTML = errorPage(error);
      title = "Error";
    }
    document.title = title + " | Spoke & Chain Co-op";
    app.classList.remove("fade-out");
    updateMenu(path);
    document.getElementById("count").textContent = bookings.length;

    if (useFade) {
      window.scrollTo(0, 0);
      var heading = app.querySelector("h1");
      if (heading) {
        heading.focus(); // so screen readers read the new page
      }
    }
  }

  if (useFade) {
    app.classList.add("fade-out");   // fade the old page out first
    setTimeout(showPage, 200);
  } else {
    showPage();
  }
}

// adds aria-current to the link of the page we are on
function updateMenu(path) {
  var links = document.querySelectorAll("nav a");
  for (var i = 0; i < links.length; i++) {
    var linkPath = links[i].getAttribute("href").slice(1).split("?")[0];
    if (linkPath === path) {
      links[i].setAttribute("aria-current", "page");
    } else {
      links[i].removeAttribute("aria-current");
    }
  }
}

// changes the URL without reloading, then shows the page
function goTo(url) {
  if (url === (location.hash || "#/")) {
    return;
  }
  history.pushState({}, "", url);
  loadPage(true);
}

// click on any link with data-link
document.addEventListener("click", function (event) {
  var link = event.target.closest("a[data-link]");
  if (link) {
    event.preventDefault();
    goTo(link.getAttribute("href"));
  }
});

// back and forward buttons
window.addEventListener("popstate", function () {
  loadPage(true);
});

// ---------- BUTTONS AND FORM ----------
function setFilter(level) {
  currentFilter = level;
  loadPage(false);
  document.getElementById("filter-" + level).focus(); // keep focus on the button
}

function cancelBooking(id) {
  var newList = [];
  for (var i = 0; i < bookings.length; i++) {
    if (bookings[i].id !== id) {
      newList.push(bookings[i]);
    }
  }
  bookings = newList;
  message = "Booking cancelled.";
  saveBookings();
  loadPage(false);
}

function showError(field, text) {
  document.getElementById(field + "-error").textContent = text;
}

function submitBooking(event) {
  event.preventDefault();

  var name = document.getElementById("name").value.trim();
  var email = document.getElementById("email").value.trim();
  var workshop = findWorkshop(Number(document.getElementById("workshop").value));
  var valid = true;

  showError("name", "");
  showError("email", "");
  showError("workshop", "");

  if (name.length < 2) {
    showError("name", "Please enter your full name.");
    valid = false;
  }
  if (email.indexOf("@") < 1 || email.indexOf(".") < 0) {
    showError("email", "Please enter a valid email address.");
    valid = false;
  }
  if (!workshop) {
    showError("workshop", "Please choose a workshop.");
    valid = false;
  } else if (spacesLeft(workshop) <= 0) {
    showError("workshop", "Sorry, this workshop is full.");
    valid = false;
  }

  if (!valid) {
    return false;
  }

  bookings.push({ id: Date.now(), name: name, email: email, workshopId: workshop.id });
  saveBookings();
  message = "Thanks " + name + ", you are booked on " + workshop.title + ".";
  goTo("#/bookings");
  return false;
}

// ---------- START ----------
loadPage(false);
