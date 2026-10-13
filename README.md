# Spoke & Chain Co-op - SPA Simulation

A single page application made with plain HTML, CSS and JavaScript (no frameworks).
Pages load into one container without reloading, and the URL and browser history change as you move around.

## How to run
Open `index.html` in a browser. No server is needed.

## Folder structure
```
spa-project/
  index.html      main container
  css/style.css   styles and transitions
  js/app.js       data, pages, router and form code
  assets/         images
```

## Routes
`#/` Home, `#/services`, `#/hours`, `#/workshops`, `#/book?workshop=2`, `#/bookings`,
`#/test-error` (throws an error on purpose). Any other URL shows the 404 page.
