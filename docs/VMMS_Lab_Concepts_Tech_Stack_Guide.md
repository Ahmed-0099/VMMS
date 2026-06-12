# VMMS Lab Concepts and Tech Stack Guide

This guide summarizes the concepts from the available labs, including Lab 1 to Lab 7 plus the newly added Lab 9, Lab 10, Lab 11, Lab 14, and Lab 15. It connects those topics with the Vehicle & Maintenance Management System (VMMS) project. Use it as a checklist while building the project so no major lab topic is missed.

## 1. Big Picture From The Labs

Your labs move from basic web page structure to full-stack React application development and project collaboration:

- Lab 1: Web development fundamentals and HTML.
- Lab 2: CSS, box model, Flexbox, and media queries.
- Lab 3: Bootstrap 5 responsive UI design.
- Lab 4: JavaScript fundamentals.
- Lab 5: Advanced JavaScript and JSON.
- Lab 6: Asynchronous JavaScript, Web APIs, DOM, and events.
- Lab 7: jQuery selectors, events, effects, and form interaction.
- Lab 9: ReactJS fundamentals, JSX, components, Vite setup, and Virtual DOM.
- Lab 10: React Bootstrap styling, component composition, React Router, SPA behavior, and `useState`.
- Lab 11: React hooks including `useState`, `useEffect`, `useContext`, `useRef`, and custom hooks.
- Lab 14: MongoDB, MongoDB Atlas, Mongoose, Express connectivity, and CRUD REST APIs.
- Lab 15: Git, GitHub, branching, merging, pull requests, conflicts, forks, and issues.

For VMMS, these concepts should appear in practical form through:

- Login and registration pages.
- Dashboard and sidebar navigation.
- Vehicle, driver, fuel, work order, and compliance forms.
- Responsive tables, cards, and layouts.
- JavaScript validation and interactivity.
- API calls using JSON.
- Dynamic UI updates without full page reloads.
- React components for repeated modules such as cards, tables, forms, and navigation.
- React Router pages for dashboard, vehicles, work orders, fuel logs, and reports.
- React hooks for state, API loading, shared context, and reusable logic.
- Express APIs backed by PostgreSQL and Prisma for saving VMMS records.
- Git and GitHub workflow for version control and collaboration.

## 2. Lab 1: Web Development and HTML

### Main Concepts

- Web development means building, creating, and maintaining websites or web applications.
- Web development includes web designing, web programming, web publishing, and database management.
- Frontend is the part users see and interact with.
- Backend handles server-side logic, databases, authentication, and data processing.
- Full-stack development combines frontend and backend work.
- Static websites have fixed content.
- Dynamic websites change content based on user actions, backend logic, or database data.

### Web Development Workflow

- Planning: define purpose, audience, and required features.
- Designing: create wireframes and mockups.
- Development: build frontend and backend.
- Testing: check bugs, responsiveness, and browser compatibility.
- Deployment: host the application online.
- Maintenance: update and improve the system over time.

### HTML Technical Details

Important HTML structure:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Page Title</title>
</head>
<body>
  <h1>Main Heading</h1>
  <p>Paragraph text</p>
</body>
</html>
```

Important HTML tags from the labs:

- `<!DOCTYPE html>` declares an HTML5 document.
- `<html>` is the root element.
- `<head>` stores page metadata.
- `<title>` sets the browser tab title.
- `<body>` contains visible content.
- `<h1>` to `<h6>` define heading levels.
- `<p>` defines paragraphs.
- `<br>` adds a line break.
- `<b>`, `<i>`, and `<u>` format text.
- `<a href="">` creates links.
- `<img src="" alt="">` adds images.
- `<button>` creates clickable buttons.
- `<div>` groups page sections.
- `<header>`, `<main>`, and `<footer>` create semantic page sections.

Use semantic tags in VMMS instead of putting everything inside plain `div` elements.

### Tables

Tables are used for row and column data.

Important table tags:

- `<table>` creates a table.
- `<tr>` creates a row.
- `<th>` creates a header cell.
- `<td>` creates a data cell.
- `rowspan` allows a cell to span multiple rows.
- `colspan` allows a cell to span multiple columns.

VMMS usage:

- Vehicle list.
- Driver list.
- Fuel logs.
- Work order list.
- Compliance document list.
- Report tables.

### Inline and Block Elements

- Inline elements stay on the same line and use only required width, such as `<span>`, `<a>`, and `<img>`.
- Block elements start on a new line and usually take full width, such as `<div>`, `<p>`, and headings.

VMMS usage:

- Use block elements for sections and page layout.
- Use inline elements for links, small labels, badges, and text highlights.

### Forms

HTML forms collect user input.

Important form tags:

- `<form>` wraps inputs.
- `<label>` describes an input.
- `<input>` collects single-line data.
- `<textarea>` collects multi-line text.
- `<select>` creates dropdowns.
- `<option>` defines dropdown choices.
- `<button>` submits or triggers actions.

Important input types:

- `text`
- `password`
- `email`
- `number`
- `date`
- `radio`
- `checkbox`
- `file`
- `submit`

Important form attributes:

- `required` validates that a field must be filled.
- `placeholder` shows input hint text.
- `name` identifies submitted field data.
- `id` connects inputs with labels.
- `action` defines where form data is submitted.

VMMS usage:

- Login form.
- Registration form.
- Vehicle create/edit form.
- Driver profile form.
- Fuel entry form.
- Fault report form.
- Work order form.
- Compliance document upload form.

## 3. Lab 2: CSS, Box Model, Flexbox, and Media Queries

### CSS Syntax

CSS styles HTML elements.

Basic syntax:

```css
selector {
  property: value;
}
```

Technical details:

- Selector points to the HTML element.
- Declaration block contains one or more declarations.
- Each declaration has a property and value.
- Declarations end with semicolons.
- Declaration blocks use curly braces.

### Ways To Apply CSS

- Inline CSS: written inside an HTML tag using `style`.
- Internal CSS: written inside `<style>` in the `<head>`.
- External CSS: written in a separate `.css` file and linked with `<link>`.

Best practice for VMMS:

- Use external CSS or framework classes for maintainability.
- Avoid inline CSS except for very small experiments.

### Class and ID

- `class` is reusable and can be applied to multiple elements.
- `id` should be unique on a page.
- CSS class selector uses `.className`.
- CSS ID selector uses `#idName`.

VMMS usage:

- Use classes for repeated UI components, such as buttons, cards, form fields, badges, and tables.
- Use IDs only for unique targets when needed.

### Common CSS Properties

- `color`: text color.
- `background-color`: background color.
- `font-family`: font style.
- `font-size`: text size.
- `text-align`: text alignment.
- `width` and `height`: element dimensions.
- `padding`: inner spacing.
- `margin`: outer spacing.
- `border`: border style, width, and color.

### CSS Box Model

Every HTML element is treated as a box.

Box model layers:

- Content: actual text, image, or child element.
- Padding: space between content and border.
- Border: line around padding and content.
- Margin: outer spacing between elements.

VMMS usage:

- Use padding for readable forms and cards.
- Use margin for spacing between sections.
- Use borders for tables, inputs, and panels.
- Avoid cramped dashboard layouts.

### Flexbox

Flexbox helps create responsive layouts.

Important properties:

- `display: flex` activates Flexbox.
- `flex-direction: row` arranges items left to right.
- `flex-direction: row-reverse` arranges items right to left.
- `flex-direction: column` arranges items top to bottom.
- `flex-direction: column-reverse` arranges items bottom to top.
- `justify-content: flex-start` aligns items at start.
- `justify-content: center` centers items.
- `justify-content: flex-end` aligns items at end.
- `justify-content: space-between` adds space between items.
- `justify-content: space-around` adds space around items.
- `justify-content: space-evenly` adds equal spacing everywhere.
- `flex-wrap: nowrap` keeps items on one line.
- `flex-wrap: wrap` allows items to move to the next line.
- `flex-wrap: wrap-reverse` wraps in reverse order.

VMMS usage:

- Dashboard KPI cards.
- Form button rows.
- Sidebar and main content layout.
- Responsive toolbar layouts.

### Media Queries

Media queries apply CSS only under certain conditions.

Examples:

```css
@media (max-width: 600px) {
  body {
    background-color: lightgray;
  }
}
```

Important media query conditions:

- `width`
- `min-width`
- `max-width`
- `min-height`
- `max-height`
- `orientation: landscape`

VMMS usage:

- Make dashboard usable on mobile, tablet, and desktop.
- Collapse sidebar on small screens.
- Stack forms and cards on mobile.
- Make tables scroll or transform on small screens.

## 4. Lab 3: Bootstrap 5 Responsive UI

### Main Concepts

Bootstrap is an open-source frontend framework for building responsive, mobile-first websites quickly.

Bootstrap includes:

- Navigation bars.
- Buttons.
- Alerts.
- Cards.
- Modals.
- Grids.
- Forms.
- Carousel.

Bootstrap 5 features from the lab:

- Mobile-first design.
- Pre-styled components.
- Flexbox and grid system.
- Customizable styles.
- No jQuery dependency in Bootstrap 5.

### CDN Concept

A CDN delivers files from nearby servers.

Benefits:

- Faster loading.
- Easy integration.
- Browser caching.
- Updated resources.

Bootstrap CDN example:

```html
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
  rel="stylesheet">
```

### Bootstrap Grid

Important classes:

- `container`: responsive page container.
- `container-fluid`: full-width responsive container.
- `row`: horizontal group of columns.
- `col-md-4`: column taking 4 of 12 grid spaces on medium screens and larger.

VMMS usage:

- Dashboard grid.
- Vehicle detail layout.
- Login/register layout.
- Reports and cards.

### Bootstrap Navbar

Important classes:

- `navbar`
- `navbar-expand-lg`
- `navbar-light`
- `bg-light`
- `navbar-brand`
- `navbar-toggler`
- `collapse`
- `navbar-nav`
- `nav-item`
- `nav-link`

VMMS usage:

- Top navigation.
- Mobile menu.
- Role-based navigation links.

### Bootstrap Components To Use In VMMS

- Navbar for main navigation.
- Sidebar with custom CSS or Bootstrap layout.
- Cards for dashboard KPIs.
- Tables for vehicles, drivers, fuel logs, work orders, and reports.
- Forms for CRUD pages.
- Buttons for actions.
- Alerts for success/error messages.
- Badges for statuses like Active, In Maintenance, Completed, Expired.
- Modal dialogs for confirmations.

## 5. Lab 4: JavaScript Fundamentals

### Why JavaScript Is Needed

JavaScript makes web pages interactive and dynamic.

Without JavaScript:

- The page must refresh for every change.
- No instant search.
- No live UI updates.
- No client-side form validation.
- No dynamic dashboard behavior.

VMMS usage:

- Validate forms before submit.
- Filter tables.
- Update dashboard counters.
- Show/hide fields based on selected options.
- Handle button clicks.
- Fetch API data.

### Ways To Use JavaScript

- Inline script inside `<script>`.
- External `.js` file using `<script src="script.js"></script>`.
- HTML event attributes like `onclick`.
- Browser console for testing and debugging.

Best practice for VMMS:

- Use external JavaScript files or framework components.
- Avoid too much inline JavaScript.

### Comments

- Use comments to explain code.
- Use comments to temporarily prevent code execution during testing.

### Variables

JavaScript variables store data.

Important declarations:

- `var`: old style, function-scoped, avoid in modern JavaScript.
- `let`: block-scoped and reassignable.
- `const`: block-scoped and cannot be reassigned.

VMMS usage:

- Use `const` by default.
- Use `let` when a value must change.
- Avoid `var`.

### Data Types

Important JavaScript data types:

- String: text data.
- Number: integers and decimals.
- Boolean: `true` or `false`.
- Null: intentional empty value.
- Undefined: declared but not assigned.
- Object: key-value collection.
- Array: ordered list of values.

VMMS examples:

- String: vehicle registration number.
- Number: fuel quantity, odometer reading, cost.
- Boolean: user active status.
- Null: missing optional data.
- Object: vehicle record.
- Array: list of vehicles or work orders.

### String Operations

Concepts from the lab:

- `typeof`
- `.length`
- `.toUpperCase()`
- `.toLowerCase()`
- Template literals using backticks.

VMMS usage:

- Format names and statuses.
- Validate text length.
- Display dynamic messages.

### Number Concepts

Concepts from the lab:

- Integers.
- Decimals.
- Negative numbers.
- Scientific notation.
- `Infinity`.
- `NaN`.

VMMS usage:

- Calculate fuel efficiency.
- Calculate maintenance cost.
- Validate numeric inputs.

### Boolean Concepts

Concepts from the lab:

- `true`
- `false`
- Comparison results.
- Truthy and falsy values.

VMMS usage:

- Check whether a user is logged in.
- Check whether a document is expired.
- Check whether form input is valid.

### Objects

Objects store related values together.

Example:

```js
const vehicle = {
  registrationNo: "ABC-123",
  status: "Active",
  fuelType: "Petrol"
};
```

VMMS usage:

- Vehicle object.
- Driver object.
- Work order object.
- Fuel log object.
- Compliance document object.

### Arrays

Arrays hold multiple values.

Important array methods:

- `push()`: add to end.
- `pop()`: remove from end.
- `unshift()`: add to beginning.
- `shift()`: remove from beginning.
- `concat()`: merge arrays.
- `slice()`: extract without changing original.
- `splice()`: add/remove and modify original.
- `indexOf()`: find item index.
- `includes()`: check if item exists.
- `join()`: convert array to string.
- `reverse()`: reverse order.
- `sort()`: sort array.
- `map()`: transform each item.
- `filter()`: keep matching items.
- `forEach()`: loop through array.
- `reduce()`: reduce array to one result.

VMMS usage:

- `map()` for rendering rows/cards.
- `filter()` for filtering vehicles or work orders.
- `reduce()` for total fuel cost or maintenance cost.
- `forEach()` for processing lists.

### Operators

Arithmetic operators:

- `+`
- `-`
- `*`
- `/`
- `%`
- `**`

Comparison operators:

- `==`
- `===`
- `!=`
- `!==`
- `>`
- `<`
- `>=`
- `<=`

Logical operators:

- `&&`
- `||`
- `!`

VMMS usage:

- Compare due dates.
- Check role permissions.
- Calculate totals.
- Validate conditions.

### Conditional Statements

Important concepts:

- `if`
- `else`
- `switch`

VMMS usage:

- If vehicle document is expired, show red status.
- If work order priority is critical, show high alert.
- Use `switch` for statuses like Open, In Progress, Pending Parts, Completed, Closed.

### Loops

Important loops:

- `for`
- `while`
- `for...of`

VMMS usage:

- Loop through vehicles.
- Loop through fuel logs.
- Loop through notifications.

### Functions

Functions are reusable blocks of code.

Function types from the lab:

- Simple function.
- Function with parameters.
- Function with return value.

VMMS usage:

- Calculate fuel efficiency.
- Format dates.
- Validate forms.
- Calculate total costs.
- Convert statuses into badges.

### Scope

Important scope types:

- Global scope.
- Function scope.
- Block scope.
- Lexical scope and closures.

VMMS usage:

- Keep variables inside the smallest needed scope.
- Avoid global variables for project safety.
- Use closures carefully for event handlers and private state.

### Date and Math Objects

Lab tasks include:

- Calculate days until next birthday.
- Generate random numbers.
- Find max/min.
- Format dates.
- Calculate area with `Math.PI`.

VMMS usage:

- Calculate days until maintenance due.
- Calculate days until license/document expiry.
- Format dates for reports.
- Use `Math.max()` and `Math.min()` for analytics.

## 6. Lab 5: Advanced JavaScript, ES6, Hoisting, and JSON

### ECMAScript

ECMAScript is the official standard that defines modern JavaScript.

VMMS should use modern JavaScript features because they make code cleaner and easier to maintain.

### Arrow Functions

Arrow functions use `=>`.

Example:

```js
const add = (a, b) => a + b;
```

Types from the lab:

- No parameter arrow function.
- Single parameter arrow function.
- Multiple parameter arrow function.
- Multiline arrow function with `return`.
- Arrow function with rest parameters.
- Immediately Invoked Function Expression using arrow syntax.

VMMS usage:

- Event handlers.
- Array methods like `map`, `filter`, and `reduce`.
- API response transformations.
- Utility functions.

### Rest Parameters

Rest parameters allow unlimited arguments as an array.

```js
const logValues = (...values) => {
  console.log(values);
};
```

VMMS usage:

- Utility functions that accept multiple filters.
- Combining multiple messages or validation errors.

### IIFE

An Immediately Invoked Function Expression runs as soon as it is defined.

VMMS usage:

- Initialize settings.
- Run setup code once.

### Array Destructuring

Destructuring extracts array values into variables.

Examples:

```js
const [first, second] = [10, 20];
const [firstItem, ...restItems] = items;
```

Concepts from the lab:

- Basic extraction.
- Skipping items.
- Default values.
- Handling undefined values.
- Destructuring function returns.
- Rest pattern.

VMMS usage:

- Extract API response values.
- Extract date parts.
- Extract first and remaining notifications.
- Write cleaner code when handling arrays.

### Hoisting

Hoisting means declarations are moved to the top before code execution.

Important details:

- `var` declarations are hoisted and initialized as `undefined`.
- Function declarations can be called before their definition.
- `let` and `const` are hoisted but cannot be used before declaration.
- JavaScript hoists declarations, not initializations.

VMMS usage:

- Avoid confusion by declaring variables before use.
- Prefer `let` and `const`.
- Keep functions organized.

### JSON

JSON means JavaScript Object Notation.

It is used to store and exchange data between frontend and backend.

JSON rules:

- Data is stored as key-value pairs.
- Keys must be double-quoted strings.
- Values can be strings, numbers, booleans, arrays, objects, or `null`.
- JSON cannot contain functions.
- JSON cannot contain `undefined`.
- JSON cannot contain comments.

Important methods:

- `JSON.parse()` converts JSON string to JavaScript object.
- `JSON.stringify()` converts JavaScript object to JSON string.

VMMS usage:

- Send vehicle data to backend APIs.
- Receive dashboard data from backend APIs.
- Store settings or API responses.
- Build REST API request/response bodies.

## 7. Lab 6: Asynchronous JavaScript, Web APIs, DOM, and Events

### Synchronous JavaScript

Synchronous code runs step by step. Each line waits for the previous line to finish.

### Asynchronous JavaScript

Asynchronous code allows long-running tasks to happen without blocking the page.

Used for:

- API calls.
- Timers.
- Events.
- Network requests.
- Background operations.

VMMS usage:

- Fetch dashboard data without reloading.
- Submit forms to backend.
- Load vehicle lists.
- Load reports.
- Send notifications.

### setTimeout

`setTimeout()` runs code after a delay.

VMMS usage:

- Show temporary alerts.
- Simulate loading.
- Auto-hide success messages.

### Callback Functions

A callback is a function passed into another function to run later.

VMMS usage:

- Event handlers.
- Older async code.
- Small utility flows.

### Callback Hell

Callback hell happens when callbacks are nested too deeply.

Problem:

- Hard to read.
- Hard to debug.
- Hard to maintain.

Solution:

- Use Promises.
- Use async/await.

### Promises

A Promise represents the eventual success or failure of an async task.

Promise states:

- Pending.
- Fulfilled.
- Rejected.

VMMS usage:

- API calls.
- Sequential operations.
- Error handling.

### Promise Chaining

Promise chaining runs async operations in sequence using `.then()`.

VMMS usage:

- Login user, then fetch profile, then load dashboard.
- Create work order, then send notification.
- Upload document, then save metadata.

### async/await

`async` functions return Promises.

`await` pauses the async function until a Promise resolves.

VMMS usage:

```js
async function loadVehicles() {
  const response = await fetch("/api/vehicles");
  const vehicles = await response.json();
  return vehicles;
}
```

Use `try/catch` for error handling.

### Fetch API

The lab includes a task using:

```js
fetch("https://jsonplaceholder.typicode.com/users/6")
```

VMMS usage:

- `GET /api/vehicles`
- `POST /api/vehicles`
- `PUT /api/work-orders/:id`
- `DELETE /api/drivers/:id`

### DOM

DOM means Document Object Model.

The DOM represents a webpage as a tree of objects that JavaScript can access and modify.

DOM is used for:

- Dynamic updates.
- User interaction.
- Adding/removing elements.
- Styling changes.

### DOM Searching APIs

Important APIs:

- `document.getElementById()`
- `document.getElementsByClassName()`
- `document.getElementsByTagName()`
- `document.querySelector()`
- `document.querySelectorAll()`

VMMS usage:

- Find form fields.
- Find table rows.
- Find buttons.
- Find alert boxes.

### DOM Manipulation APIs

Important APIs:

- `createElement()`
- `appendChild()`
- `removeChild()`
- `innerHTML`
- `innerText`
- `classList.add()`
- `style.property`

VMMS usage:

- Add a notification item.
- Remove a row from a table.
- Update a dashboard counter.
- Change status color.
- Add validation messages.

### Event Binding

Important concept:

- Use `addEventListener()` to respond to user actions.

VMMS usage:

- Click events on buttons.
- Submit events on forms.
- Change events on dropdowns.
- Input events for live validation.

## 8. Lab 7: jQuery Fundamentals

### What jQuery Is

jQuery is a JavaScript library that simplifies common tasks.

It helps with:

- Selecting elements.
- Changing content/styles.
- Handling events.
- Animations and effects.
- AJAX requests.
- Browser compatibility.

### Adding jQuery

Methods:

- Download jQuery from `jquery.com`.
- Include jQuery from a CDN.

CDN example:

```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
```

### Basic Syntax

```js
$(selector).action();
```

Meaning:

- `$` is the jQuery function.
- `selector` selects elements.
- `action()` performs an operation.

### Document Ready

```js
$(document).ready(function () {
  // code here
});
```

Purpose:

- Wait until HTML is fully loaded.
- Prevent errors when selecting elements.

### jQuery Selectors

Selectors from the lab:

- Tag selector: `$("p")`
- Class selector: `$(".highlight")`
- ID selector: `$("#box")`
- Tag plus class selector: `$("p.blue")`
- Tag plus ID selector: `$("div#main")`
- Group selector: `$("p, h1")`
- Universal selector: `$("*")`

### this Keyword

In jQuery events, `this` refers to the element that triggered the event.

Example:

```js
$("p").click(function () {
  $(this).hide();
});
```

### jQuery Events

Mouse events:

- `click`
- `dblclick`
- `mouseenter`
- `mouseleave`

Keyboard events:

- `keypress`
- `keydown`
- `keyup`

Form events:

- `submit`
- `change`
- `focus`
- `blur`
- `select`

### jQuery Effects

Effects mentioned in the lab task:

- `show()`
- `hide()`
- `slideToggle()`
- `slideDown()`
- `slideUp()`

VMMS usage if using jQuery:

- Show/hide FAQ or help sections.
- Toggle sidebar sections.
- Highlight selected rows.
- Add simple form interactions.

Important project note:

- If you build VMMS with React, do not mix jQuery into React components unless your instructor specifically requires jQuery. React manages the UI itself. Still, the jQuery lab concepts are useful because they teach selectors, events, and DOM behavior.

## 9. Lab 9: Fundamentals of ReactJS

### Main Concepts

React.js is an open-source JavaScript library used to build user interfaces, especially dynamic and interactive web applications.

Important React ideas from the lab:

- React focuses on the View layer of an application.
- React applications are built using reusable components.
- React updates only the parts of the UI that change.
- React makes large UI code easier to organize and maintain.
- React is useful when a page has frequent user interactions and dynamic updates.

VMMS usage:

- Use React for dashboard modules, vehicle lists, work order pages, and report screens.
- Break large screens into smaller reusable components.
- Avoid manually updating the DOM for every change.
- Let React re-render the correct UI based on state and data.

### Problem React Solves

Before React, developers often used plain JavaScript or jQuery to manually update HTML elements.

Common problems:

- Manual DOM updates for every small UI change.
- Repeated and messy code.
- Whole sections of a page reloaded even when only one part changed.
- Difficult synchronization between UI and application data.
- Poor performance for large or real-time interfaces.

VMMS example:

- Without React, updating one work order status may require manually finding table rows, changing classes, updating counters, and refreshing parts of the page.
- With React, the status value changes in state and the related row, badge, and dashboard count can update automatically.

### Virtual DOM vs Real DOM

The Real DOM is the browser's actual page structure.

The Virtual DOM is React's lightweight in-memory copy of the UI.

How React updates the UI:

1. State or data changes.
2. React creates a new Virtual DOM.
3. React compares the new Virtual DOM with the previous one.
4. React finds the minimum required changes.
5. React updates only the needed parts of the Real DOM.

VMMS usage:

- Updating a vehicle status should not reload the whole dashboard.
- Typing in a search field should not reset other page inputs.
- Receiving new notification data should update only the notification component.

### React Project Setup With Vite

Lab setup tools:

- VS Code.
- Node.js.
- npm.
- Browser.
- Vite.

Common setup command:

```text
npm create vite@latest
cd project-name
npm install
npm run dev
```

VMMS usage:

- Create the frontend using Vite.
- Keep React source code inside the `src` folder.
- Run the frontend locally during development using `npm run dev`.

### React Folder Structure

Important files and folders:

- `node_modules`: installed npm packages.
- `public`: static files.
- `src`: main React application code.
- `src/assets`: images, icons, and fonts.
- `src/App.jsx`: main app component.
- `src/App.css`: styles for the app component.
- `src/index.css`: global styles.
- `src/main.jsx`: React entry point.
- `index.html`: HTML shell where React is mounted.
- `package.json`: scripts and dependencies.
- `vite.config.js`: Vite configuration.

VMMS recommended frontend structure:

```text
src/
  components/
  pages/
  services/
  hooks/
  context/
  assets/
  App.jsx
  main.jsx
```

### JSX

JSX means JavaScript XML.

It allows HTML-like syntax inside JavaScript.

Example:

```jsx
function App() {
  return (
    <div>
      <h1>VMMS Dashboard</h1>
      <button>View Vehicles</button>
    </div>
  );
}

export default App;
```

Important JSX notes:

- Components return JSX.
- JSX is converted into JavaScript by build tools.
- React components should start with capital letters.
- Use `className` instead of `class` in JSX.

### Components and Component-Based Architecture

A component is a reusable, independent piece of UI.

Benefits:

- Reusability.
- Separation of concerns.
- Easier maintenance.
- Easier debugging.
- Better organization for large apps.

VMMS component examples:

- `Navbar`
- `Sidebar`
- `DashboardCard`
- `VehicleTable`
- `VehicleForm`
- `DriverForm`
- `WorkOrderCard`
- `StatusBadge`
- `ReportChart`

## 10. Lab 10: React Bootstrap, Component Composition, Routing, and State

### Main Concepts

Lab 10 extends React by adding:

- Bootstrap 5 styling in React.
- Component composition.
- Single Page Application behavior.
- React Router DOM.
- `useState` for state management.

VMMS usage:

- Build a responsive UI using Bootstrap 5 classes.
- Split pages into reusable components.
- Use React Router for module navigation.
- Use state for counters, lists, filters, selected records, and form values.

### Bootstrap 5 In React

Bootstrap can be added to React using:

- Bootstrap CDN links inside `index.html`.
- npm installation and import in React.

CDN approach from the lab:

```html
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
  rel="stylesheet">
```

VMMS usage:

- Use `container`, `row`, and `col-*` for layouts.
- Use `navbar`, `card`, `table`, `form-control`, `btn`, `alert`, and `badge`.
- Use Bootstrap spacing classes such as `m-3`, `p-4`, `gap-2`, and `mb-3`.

React JSX example:

```jsx
function DashboardCard() {
  return (
    <div className="card p-3">
      <h5>Total Vehicles</h5>
      <strong>24</strong>
    </div>
  );
}
```

### Component Composition

Component composition means using one component inside another.

Example:

```jsx
import Header from "./Header";

function App() {
  return (
    <>
      <Header />
      <main className="container py-4">VMMS content here</main>
    </>
  );
}
```

VMMS usage:

- Put shared layout in `Navbar`, `Sidebar`, and `PageHeader`.
- Reuse `StatusBadge` in vehicles, work orders, and compliance documents.
- Reuse form components where the same input pattern appears many times.

### Single Page Application Behavior

A Single Page Application loads one HTML page and updates content using JavaScript without full page reloads.

Traditional website behavior:

- Click link.
- Browser requests a new page.
- Full page reload happens.

SPA behavior:

- Click link.
- URL changes.
- React Router renders a different component.
- Navbar, search input, and layout can stay in place.

VMMS usage:

- Moving from Dashboard to Vehicles should feel instant.
- Sidebar should remain visible while the main content changes.
- Search or filter state can remain available while navigating related pages.

### React Router DOM

React Router DOM handles page navigation in React apps.

Important pieces:

- `BrowserRouter`: wraps the app and enables routing.
- `Routes`: container for route definitions.
- `Route`: maps a path to a component.
- `Link`: navigates without full reload.
- `NavLink`: like `Link`, but useful for active navigation styles.

Install command:

```text
npm install react-router-dom
```

Example VMMS routing:

```jsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import WorkOrders from "./pages/WorkOrders";

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/vehicles" element={<Vehicles />} />
      <Route path="/work-orders" element={<WorkOrders />} />
    </Routes>
  );
}
```

### State Management With useState

State is data that changes over time and affects the UI.

`useState` lets a functional component store and update state.

Example:

```jsx
import { useState } from "react";

function VehicleCounter() {
  const [totalVehicles, setTotalVehicles] = useState(0);

  return (
    <button onClick={() => setTotalVehicles(totalVehicles + 1)}>
      Total Vehicles: {totalVehicles}
    </button>
  );
}
```

VMMS usage:

- Store form input values.
- Store selected vehicle.
- Store filtered table rows.
- Store dashboard counts.
- Add or remove mock records before backend integration.

## 11. Lab 11: React Hooks

### Main Concepts

Hooks allow functional components to use state and other React features.

Before hooks, functional components could mostly receive props and return JSX. Hooks allow them to:

- Hold internal state.
- Handle side effects.
- Share logic between components.
- Access context.
- Store mutable values.

Important hooks from the lab:

- `useState`
- `useEffect`
- `useContext`
- `useRef`
- `useReducer`
- `useMemo`
- `useCallback`
- Custom hooks

### useState

`useState` adds state to functional components.

VMMS usage:

- Track login form values.
- Track selected sidebar item.
- Track search text.
- Track selected status filters.
- Track modal open/close state.

Example:

```jsx
const [statusFilter, setStatusFilter] = useState("All");
```

### useEffect

`useEffect` handles side effects.

Side effects include:

- Fetching data from an API.
- Setting timers.
- Updating `document` or `window`.
- Running logic when a dependency changes.

VMMS usage:

- Load vehicles when the Vehicles page opens.
- Fetch dashboard KPIs when the Dashboard page opens.
- Reload work orders when the selected status filter changes.
- Show temporary success messages.

Example:

```jsx
useEffect(() => {
  loadVehicles();
}, []);
```

Use `try/catch` inside async loading functions for API errors.

### useContext

`useContext` allows deeply nested components to access shared data without passing props through every level.

This solves prop drilling.

VMMS usage:

- Store logged-in user data.
- Store user role and permissions.
- Store theme settings.
- Store organization or branch context.

Example contexts:

- `AuthContext`
- `ThemeContext`
- `NotificationContext`
- `OrganizationContext`

### useRef

`useRef` stores a mutable value that does not cause re-render when changed.

It can also access DOM elements directly.

VMMS usage:

- Focus the first invalid form field.
- Store a previous value.
- Count renders during debugging.
- Keep timer IDs or file input references.

Important note:

- Updating `ref.current` does not re-render the component.
- Use state when the UI must update.
- Use refs when you need a persisted value without UI re-render.

### Custom Hooks

A custom hook combines built-in hooks into reusable logic.

Lab example:

- `useFetch(url)` loads API data and returns it.

VMMS custom hook examples:

- `useVehicles()`
- `useDrivers()`
- `useWorkOrders()`
- `useFuelLogs()`
- `useAuth()`
- `useWindowSize()`

Example purpose:

- Keep API loading logic out of page components.
- Reuse loading, error, and data state across pages.
- Make components cleaner.

### Advanced Hooks To Explore

`useReducer`:

- Useful for complex state logic.
- Good for multi-step forms or filters with many actions.

`useMemo`:

- Caches expensive calculations.
- Useful for report totals and filtered lists.

`useCallback`:

- Caches function references.
- Useful when passing callbacks to optimized child components.

VMMS usage:

- Use `useReducer` for advanced work order form state.
- Use `useMemo` for dashboard totals, fuel totals, or filtered vehicle lists.
- Use `useCallback` for stable event handlers passed to table rows or reusable components.

## 12. Lab 14: Database APIs With Node.js and Express

### Main Concepts

Lab 14 introduces backend database integration using MongoDB, MongoDB Atlas, Node.js, Express.js, and Mongoose. For VMMS, the same backend API concepts will be applied using PostgreSQL with Prisma instead of MongoDB with Mongoose.

Important concepts:

- A database stores, organizes, retrieves, searches, creates, updates, and deletes data.
- SQL databases are relational, such as MySQL and PostgreSQL.
- NoSQL databases are non-relational, such as MongoDB and Firebase.
- MongoDB stores data in JSON-like BSON documents.
- MongoDB has a flexible schema and fits naturally with JavaScript applications.

VMMS usage:

- Store users, vehicles, drivers, fuel logs, work orders, documents, reports, and notifications.
- Use REST APIs so the React frontend can communicate with the backend.
- Store data permanently instead of only keeping it in frontend state.
- Use PostgreSQL and Prisma as the actual VMMS database layer.

### Node.js Server vs Database Server

Node.js server:

- Runs the backend application.
- Handles routes.
- Runs API logic.
- Performs validation.
- Connects frontend requests to the database.

MongoDB database server:

- Stores application data.
- Returns data when queried.
- Saves inserted or updated documents.

Lab 14 flow:

```text
React frontend -> Express API -> Mongoose model -> MongoDB Atlas
```

VMMS selected flow:

```text
React frontend -> Express API -> Prisma Client -> PostgreSQL
```

### MongoDB Atlas

MongoDB Atlas is the cloud-hosted MongoDB service used in the lab.

Main setup steps:

- Create a MongoDB Atlas account.
- Create a free cluster.
- Create a database user.
- Add network access.
- Copy the connection string.
- Store the connection string in `.env`.

Example environment variable:

```text
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/vmms
```

Important project note:

- Never commit real database passwords to GitHub.
- Add `.env` to `.gitignore`.
- Use example values in documentation instead of real secrets.

### Mongoose

Mongoose is an Object Data Modeling library for MongoDB and Node.js.

It helps you:

- Define schemas.
- Create models.
- Validate data shape.
- Query MongoDB using JavaScript methods.
- Structure MongoDB documents more clearly.

Install command:

```text
npm install mongoose
```

Example lab model:

```js
const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    registrationNo: { type: String, required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    status: { type: String, default: "Active" }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
```

### VMMS Prisma Adaptation

Prisma is an ORM that lets the Express backend work with PostgreSQL using a typed schema and generated client.

Install command:

```text
npm install prisma @prisma/client
npx prisma init
```

Example VMMS Prisma model:

```prisma
model Vehicle {
  id             String   @id @default(cuid())
  registrationNo String  @unique
  make           String
  model          String
  status         String   @default("Active")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

VMMS usage:

- Define project entities inside `schema.prisma`.
- Use Prisma Client inside controllers and services.
- Use migrations to update the PostgreSQL database safely.
- Keep database relationships explicit with Prisma relations.

### Express and Database Connection

Important backend packages:

```text
npm init -y
npm install express dotenv prisma @prisma/client
npx prisma init
```

Important backend setup:

- Import Express.
- Import Prisma Client.
- Load `.env` using `dotenv`.
- Use `express.json()` for JSON request bodies.
- Store the PostgreSQL connection string in `.env`.
- Create and run Prisma migrations.
- Start the server using `app.listen()`.

VMMS usage:

- Keep database connection code in a separate config file if the project grows.
- Keep Prisma schema in `prisma/schema.prisma`.
- Keep route handlers inside a `routes` folder.
- Keep controller logic inside a `controllers` folder for cleaner backend code.

### REST Methods With A Database

REST methods from the lab:

| Method | Meaning | VMMS Example |
|---|---|---|
| GET | Retrieve data | Get all vehicles |
| POST | Create new data | Add a new fuel log |
| PUT | Replace or update data | Update vehicle details |
| PATCH | Update part of data | Change work order status |
| DELETE | Delete data | Delete a driver record |

Example VMMS routes:

```text
GET    /api/vehicles
POST   /api/vehicles
PUT    /api/vehicles/:id
DELETE /api/vehicles/:id
```

### Postman Testing

Postman is used to test backend APIs.

VMMS testing checklist:

- Test `GET` list endpoints.
- Test `POST` create endpoints with JSON body.
- Test `PUT` update endpoints.
- Test `PATCH` status update endpoints.
- Test `DELETE` endpoints.
- Confirm proper success and error responses.

## 13. Lab 15: Git and GitHub Version Control

### Main Concepts

Git is a distributed version control system.

GitHub is a cloud hosting service for Git repositories.

Version control is important because it:

- Tracks complete code history.
- Enables collaboration.
- Prevents accidental overwriting.
- Allows rollback to previous versions.
- Keeps a backup of project code.

VMMS usage:

- Track every frontend and backend change.
- Work on features in separate branches.
- Review changes before merging.
- Keep the project backed up on GitHub.

### Basic Git Commands

Configuration:

```text
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --list
```

Repository setup:

```text
git init
git status
git add .
git commit -m "Initial commit"
```

Remote repository:

```text
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
git pull
git clone https://github.com/username/repo-name.git
```

VMMS usage:

- Commit after completing each meaningful feature.
- Use clear commit messages.
- Check `git status` before and after commits.

### Branching and Merging

Branches allow parallel work without directly changing the main branch.

Common commands:

```text
git branch
git checkout -b feature-branch
git push -u origin feature-branch
git checkout main
git pull
git merge feature-branch
git push
git branch -d feature-branch
```

VMMS branch examples:

- `feature/auth`
- `feature/vehicle-management`
- `feature/work-orders`
- `feature/reports`
- `fix/login-validation`

### Pull Requests

Pull requests are used to review and merge changes on GitHub.

Typical flow:

1. Create a branch.
2. Make changes.
3. Commit changes.
4. Push the branch to GitHub.
5. Open a pull request.
6. Review the changes.
7. Merge into main.

VMMS usage:

- Use pull requests for team review.
- Attach screenshots when UI changes are made.
- Mention which VMMS module was changed.
- Keep pull requests focused on one feature where possible.

### Merge Conflicts

Merge conflicts happen when the same lines are changed in different branches.

How to resolve:

1. Open the conflicted file.
2. Find the conflict markers.
3. Choose or combine the correct code.
4. Save the file.
5. Run the project or tests.
6. Commit the resolved conflict.

Commands:

```text
git add .
git commit -m "Resolve merge conflict"
```

### Forking and Issues

Forking creates a copy of another repository.

Issues help track:

- Bugs.
- Feature requests.
- Tasks.
- Project improvements.

VMMS usage:

- Use issues for tasks like "Add vehicle form validation" or "Create work order status API".
- Assign issues to team members.
- Link pull requests to related issues.

## 14. VMMS Project Checklist Based On Labs

### HTML Checklist

- Use `<!DOCTYPE html>`.
- Add proper `<html>`, `<head>`, and `<body>` structure.
- Add `<title>` for each page.
- Use semantic tags: `<header>`, `<main>`, `<footer>`, and `<section>`.
- Use proper heading hierarchy from `<h1>` to `<h3>`.
- Use `<a>` for navigation links.
- Use `<img>` with meaningful `alt`.
- Use forms with labels.
- Use `required` validation where needed.
- Use tables for structured data.

### CSS Checklist

- Use external CSS or framework classes.
- Use classes for reusable styling.
- Use IDs only for unique elements.
- Apply box model properly: content, padding, border, margin.
- Use Flexbox for alignment.
- Use media queries for responsiveness.
- Use hover effects where useful.
- Keep spacing readable.

### Bootstrap Checklist

- Use Bootstrap 5 CDN or install Bootstrap in the frontend app.
- Use `container`, `row`, and `col-*`.
- Use navbar or sidebar navigation.
- Use cards for dashboard statistics.
- Use forms for data entry.
- Use tables for admin data.
- Use alerts for feedback.
- Use badges for statuses.
- Use modals for confirmations if needed.

### JavaScript Checklist

- Use `let` and `const`.
- Avoid `var`.
- Use strings, numbers, booleans, arrays, and objects correctly.
- Use `map`, `filter`, and `reduce` for data processing.
- Use conditions for status logic.
- Use loops for repeated processing.
- Use functions for reusable logic.
- Keep variables in proper scope.
- Use arrow functions for callbacks and array methods.

### JSON and API Checklist

- Use JSON for frontend-backend communication.
- Use `JSON.parse()` when converting JSON string to object.
- Use `JSON.stringify()` when converting object to JSON string.
- Use `fetch()` or Axios for API calls.
- Use `async/await` for readable async logic.
- Use `try/catch` for API error handling.

### DOM and Events Checklist

- Use event listeners for buttons and forms.
- Update UI dynamically after user actions.
- Add and remove elements when needed.
- Update text and classes based on state.
- Avoid full page reloads for simple UI updates.

### jQuery Checklist

Use only if your project is vanilla HTML/CSS/JS or your instructor requires it.

- Use `$(document).ready()`.
- Use selectors correctly.
- Use `this` inside event handlers.
- Use click, mouse, keyboard, and form events.
- Use slide effects for show/hide UI.

### React and Vite Checklist

- Create the frontend using Vite.
- Keep React code inside the `src` folder.
- Use JSX correctly.
- Use `className` instead of `class`.
- Create reusable components for repeated UI.
- Keep components small and focused.
- Use props to pass data into child components.
- Use meaningful component names with capital letters.

### React Router Checklist

- Install `react-router-dom`.
- Wrap the app with `BrowserRouter`.
- Define page routes using `Routes` and `Route`.
- Use `Link` or `NavLink` instead of plain `<a>` for internal navigation.
- Create routes for dashboard, vehicles, drivers, work orders, fuel logs, documents, reports, and settings.
- Keep shared layout components outside changing route content when possible.

### React Hooks Checklist

- Use `useState` for component state.
- Use `useEffect` for API calls and side effects.
- Use `useContext` for shared auth, role, theme, or organization data.
- Use `useRef` for DOM references or values that should not trigger re-render.
- Create custom hooks for repeated data loading logic.
- Explore `useReducer` for complex form or filter state.
- Use `useMemo` for expensive report calculations or filtered lists.
- Use `useCallback` when passing stable functions to child components.

### PostgreSQL, Prisma, Express, and API Checklist

- Use Node.js and Express for the backend API.
- Use `express.json()` to read JSON request bodies.
- Store the PostgreSQL connection string in `.env`.
- Use `dotenv` to load environment variables.
- Use Prisma schema models.
- Use Prisma migrations for database changes.
- Use Prisma Client for database queries.
- Create REST endpoints using `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.
- Test APIs in Postman.
- Return proper JSON success and error responses.
- Never commit real database credentials to GitHub.

### Git and GitHub Checklist

- Configure Git username and email.
- Use `git status` before committing.
- Commit meaningful changes with clear messages.
- Push the project to GitHub.
- Create branches for separate features.
- Use pull requests for review and merging.
- Resolve merge conflicts carefully.
- Use GitHub issues to track bugs, tasks, and feature requests.

## 15. VMMS Features That Match Lab Topics

### Login and Registration

Related lab concepts:

- HTML forms.
- Input types.
- Labels.
- Required validation.
- CSS styling.
- JavaScript validation.
- JSON API requests.
- React state for form values.
- `AuthContext` for logged-in user data.
- Express login/register APIs.
- PostgreSQL `users` table managed with Prisma.
- Git branch for authentication work.

### Dashboard

Related lab concepts:

- Bootstrap grid.
- Cards.
- Flexbox.
- JavaScript data processing.
- Async API calls.
- DOM updates.
- React dashboard components.
- `useEffect` for loading KPIs.
- `useMemo` for calculated totals.
- Charts for maintenance and fuel analytics.
- Prisma queries or backend report endpoints.

### Sidebar and Navigation

Related lab concepts:

- Links.
- Lists.
- Div layout.
- Bootstrap navbar.
- CSS Flexbox.
- Media queries.
- React Router `Link` and `NavLink`.
- Shared layout components.
- Role-based navigation using context.
- SPA navigation without full page reloads.

### Vehicle Management

Related lab concepts:

- Forms for create/update.
- Tables for lists.
- CSS and Bootstrap layout.
- JavaScript arrays and objects.
- API calls with JSON.
- React forms and table components.
- `useState` for form input.
- `useEffect` for loading vehicle data.
- Prisma `Vehicle` model and CRUD routes.
- Postman testing for vehicle endpoints.

### Work Orders

Related lab concepts:

- Conditional statements for statuses.
- Tables for records.
- Forms for updates.
- Async API calls.
- Event handlers.
- React status badge components.
- `PATCH` endpoint for status changes.
- `useMemo` for filtered work order lists.
- Prisma `WorkOrder` model.
- Git branch for maintenance/work order features.

### Fuel Logs

Related lab concepts:

- Number input.
- Date input.
- Arrays and reduce for total cost.
- Functions for calculations.
- JSON submission.
- React form validation.
- Backend API for fuel log creation.
- Prisma `FuelLog` model.
- Report calculation using `reduce` or backend aggregation.

### Compliance Documents

Related lab concepts:

- File input.
- Date input.
- Conditional status colors.
- Alerts and notifications.
- Async upload flow.
- File upload API.
- PostgreSQL metadata for uploaded documents.
- Expiry status calculation.
- `useEffect` for loading expiring documents.

### Reports

Related lab concepts:

- Tables.
- Array methods.
- Date formatting.
- JSON data.
- Bootstrap cards and layout.
- React chart components.
- `useMemo` for frontend report summaries.
- Backend report endpoints.
- Prisma queries or SQL aggregations.
- Export or print-friendly report views if required.

### User Roles and Permissions

Related lab concepts:

- JavaScript conditions.
- React context.
- React Router protected routes.
- JSON Web Token authentication.
- PostgreSQL users and roles data.

### Team Collaboration

Related lab concepts:

- Git commits.
- Feature branches.
- Pull requests.
- Merge conflict resolution.
- GitHub issues for task tracking.

## 16. Recommended Tech Stack For VMMS

### Best Overall Stack

This is the selected stack for the VMMS project. It keeps the React and Express lab concepts, while using PostgreSQL with Prisma for a stronger relational database design.

| Layer | Recommended Technology | Why This Fits Your Labs |
|---|---|---|
| Frontend | React + TypeScript + Bootstrap 5 | Labs now include React fundamentals, Bootstrap in React, component composition, and hooks. TypeScript is optional but helpful for a larger VMMS project. |
| Frontend Build Tool | Vite | Lab 9 uses Vite to create and run React apps quickly. |
| Routing | React Router DOM | Lab 10 covers SPA behavior using `BrowserRouter`, `Routes`, `Route`, and `Link`. |
| State and Hooks | React hooks | Lab 10 and Lab 11 cover `useState`, `useEffect`, `useContext`, `useRef`, and custom hooks. |
| API Calls | Fetch API or Axios | Lab 6 covers `fetch`, async/await, and JSON. Lab 11 uses hooks for API loading. |
| Charts | Chart.js or Recharts | Useful for dashboard KPIs, fuel cost charts, and maintenance analytics. |
| Backend | Node.js + Express.js | Lab 14 uses Express for REST APIs and backend routing. |
| Database | PostgreSQL | VMMS data is relational: users, vehicles, drivers, assignments, work orders, fuel logs, and compliance documents. |
| ORM | Prisma | Prisma provides schema models, migrations, relationships, and a clean generated client for PostgreSQL. |
| Authentication | JWT + bcrypt | JWT supports API login sessions; bcrypt securely hashes passwords. |
| File Uploads | Multer + local storage or S3-compatible storage | Useful for vehicle photos and compliance documents. |
| Testing/API Tool | Postman or Thunder Client | Useful for testing backend APIs. |
| Version Control | Git + GitHub | Lab 15 covers commits, branches, merges, pull requests, forks, and issues. |

### Frontend Recommendation

Use:

- React.
- TypeScript.
- Bootstrap 5.
- React Router.
- React hooks.
- Custom hooks for API loading.
- Fetch API or Axios.
- Chart.js or Recharts.

Why:

- Bootstrap 5 directly matches Lab 3.
- JavaScript, JSON, and async/await directly match Labs 4 to 6.
- React, JSX, components, Vite, routing, state, and hooks directly match Labs 9 to 11.
- React is better than plain DOM manipulation for a large dashboard project.
- TypeScript helps avoid mistakes in a bigger project.

If you want the closest stack to labs with minimum complexity:

- HTML.
- CSS.
- Bootstrap 5.
- Vanilla JavaScript.
- Optional jQuery only where required.

But for a full VMMS, React is the better long-term choice.

### Backend Recommendation

Use:

- Node.js.
- Express.js.
- REST APIs.
- PostgreSQL.
- Prisma ORM.
- dotenv.
- JWT authentication.
- bcrypt password hashing.

Why:

- Labs already build JavaScript knowledge.
- Lab 5 teaches JSON, which is the format your APIs will send and receive.
- Lab 6 teaches async/await and fetch, which are essential for frontend-backend communication.
- Lab 14 teaches the backend API and database persistence pattern. VMMS will apply that same CRUD idea with PostgreSQL and Prisma.
- Express is beginner-friendly and suitable for university projects.

Important backend modules for VMMS:

- Auth module.
- User and role module.
- Vehicle module.
- Driver module.
- Maintenance schedule module.
- Work order module.
- Fuel log module.
- Compliance document module.
- Notification module.
- Reports module.

### Database Recommendation

Use PostgreSQL with Prisma for VMMS.

Why:

- VMMS has strongly related data, so a relational database is a good fit.
- One organization can have many users, vehicles, drivers, work orders, fuel logs, and documents.
- One vehicle can have many assignments, work orders, fuel logs, and compliance documents.
- Prisma makes relationships, migrations, and database queries easier to manage.
- PostgreSQL is reliable, widely used, and strong for reporting and analytics.

Core tables:

- `users`
- `roles`
- `vehicles`
- `drivers`
- `vehicle_assignments`
- `maintenance_schedules`
- `work_orders`
- `fuel_logs`
- `compliance_documents`
- `notifications`
- `audit_logs`

Important database details:

- Use Prisma models for every table.
- Use primary keys for every table.
- Use foreign keys and Prisma relations where records are connected.
- Use timestamps: `created_at`, `updated_at`.
- Use indexes on common search/filter fields.
- Use enum-like values for statuses where possible.
- Keep audit logs for important actions.
- Validate data in both frontend and backend.

Lab 14 teaches MongoDB/Mongoose, but the database concepts transfer well: define data models, connect the backend to the database, create CRUD APIs, and test them in Postman. VMMS will implement those same concepts with PostgreSQL and Prisma.

## 17. Suggested VMMS Page Structure

Recommended frontend pages:

- `/login`
- `/register`
- `/dashboard`
- `/profile`
- `/users`
- `/vehicles`
- `/vehicles/:id`
- `/drivers`
- `/drivers/:id`
- `/maintenance-schedules`
- `/work-orders`
- `/work-orders/:id`
- `/fuel-logs`
- `/compliance-documents`
- `/reports`
- `/settings`

Recommended layout:

- Header or top navbar.
- Sidebar for main modules.
- Main content area.
- Footer if required.
- Responsive mobile menu.

## 18. Suggested VMMS API Structure

Recommended REST endpoints:

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/me

GET    /api/vehicles
POST   /api/vehicles
GET    /api/vehicles/:id
PUT    /api/vehicles/:id
DELETE /api/vehicles/:id

GET    /api/drivers
POST   /api/drivers
GET    /api/drivers/:id
PUT    /api/drivers/:id
DELETE /api/drivers/:id

GET    /api/maintenance-schedules
POST   /api/maintenance-schedules
PUT    /api/maintenance-schedules/:id
DELETE /api/maintenance-schedules/:id

GET    /api/work-orders
POST   /api/work-orders
GET    /api/work-orders/:id
PUT    /api/work-orders/:id/status
DELETE /api/work-orders/:id

GET    /api/fuel-logs
POST   /api/fuel-logs
GET    /api/fuel-logs/:id
PUT    /api/fuel-logs/:id
DELETE /api/fuel-logs/:id

GET    /api/compliance-documents
POST   /api/compliance-documents
PATCH  /api/compliance-documents/:id/status
DELETE /api/compliance-documents/:id

GET    /api/reports/dashboard
GET    /api/reports/fuel
GET    /api/reports/maintenance
```

## 19. What Not To Miss During The Project

- Use semantic HTML.
- Use labels with all form fields.
- Use required validation for important inputs.
- Use Bootstrap grid for responsive pages.
- Use cards for dashboard KPIs.
- Use tables for management records.
- Use media queries where Bootstrap alone is not enough.
- Use JavaScript functions for calculations.
- Use arrays and objects to manage frontend data.
- Use JSON for API data.
- Use async/await for API calls.
- Use event listeners for user interactions.
- Use React components for repeated UI.
- Use React Router for SPA navigation.
- Use hooks for state, side effects, context, refs, and reusable logic.
- Use role-based UI visibility.
- Use proper status colors for records.
- Use PostgreSQL tables and Prisma models correctly.
- Keep `.env` private and out of GitHub.
- Keep backend validation separate from frontend validation.
- Do not rely only on client-side validation.
- Do not mix jQuery into React unless required.
- Test backend APIs in Postman.
- Use Git branches and pull requests for team work.
- Write clear commit messages.
- Test on desktop, tablet, and mobile screen sizes.

## 20. Final Recommendation

For VMMS, the best balanced stack is:

```text
Frontend: React + TypeScript + Bootstrap 5
Backend: Node.js + Express.js
Database: PostgreSQL
ORM: Prisma
Authentication: JWT + bcrypt
API Format: JSON over REST
Charts: Chart.js or Recharts
Version Control: Git + GitHub
```

This stack is modern enough for a serious 6th semester project, and it still connects to your updated lab topics: HTML, CSS, Bootstrap, JavaScript, JSON, async/await, DOM concepts, forms, React, React Router, hooks, Express APIs, database CRUD operations, and Git/GitHub workflow.

Lab 14 uses MongoDB and Mongoose in the handout, but VMMS will use PostgreSQL and Prisma for the final project because the system has relational data and needs clean relationships for users, vehicles, drivers, work orders, fuel logs, and compliance documents.
