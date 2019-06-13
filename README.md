# Svelte Router

## What is Svelte Router?

Svelte Router adds routing to your Svelte apps. It's specially designed for Single Page Applications (SPA). If you need Server Side Rendering then consider using Sapper.

- Define your routes in a single interface
- Layouts global, per page or nested.
- Nested routes
- Named params

To install Svelte Router on your svelte app:

with npm

```bash
npm i svelte-router-spa
```

with Yarn

```bash
yarn add svelte-router-spa
```

## Usage

Start your development server in SPA mode. Edit your package.json and change:

```
"start:dev": "sirv public -s --dev"
```

Add a routes.js file with your routes info. Example:

```
import Login from './views/public/login.svelte'
import PublicIndex from './views/public/index.svelte'
import PublicLayout from './views/public/layout.svelte'
import AdminLayout from './views/admin/layout.svelte'
import AdminIndex from './views/admin/index.svelte'
import EmployeesIndex from './views/admin/employees/index.svelte'

const routes = [
  {
    name: '/',
    component: PublicIndex,
    layout: PublicLayout
  },
  { name: 'login', component: Login, layout: PublicLayout },
  {
    name: 'admin',
    component: AdminIndex,
    layout: AdminLayout,
    nestedRoutes: [
      {
        name: 'employees',
        component: EmployeesIndex,
        nestedRoutes: [
          { name: 'show/:id', component: EmployeesShow }
        ]
      }
    ]
  }
]

export { routes }
```

Import the routes into main.js

```
import App from './App.svelte'
import { SpaRouter } from 'svelte-router-spa'
import { routes } from './routes'
import NotFound from './views/not_found.svelte'
import './middleware/users/auth'

SpaRouter({
  routes,
  pathName: document.location.pathname,
  notFound: NotFound
}).getActiveRoute

const app = new App({
  target: document.body
})

export default app
```

Edit App.svelte and add the main layout.

```
<script>
  import { MainLayout } from 'svelte-router-spa'
</script>

<MainLayout />
```

You can add any number of layouts nested inside the MainLayout. For instance assuming that I want two layous one for public pages and the other for private admin pages I would create theses two files:

Every Route file will receive a currentRoute prop with information about the current route, params, queries, etc.

public_layout.svelte

```
<script>
  import { Route } from '../../lib/router.svelte'
  import TopHeader from './top_header.svelte'
  export let currentRoute
</script>

<div class="app">
  <TopHeader />
  <section class="section">
    <Route {currentRoute} />
  </section>
</div>
```

admin_layout.svelte

```
<script>
  import { onMount, onDestroy } from "svelte";
  import { Route } from "svelte-router-spa";
  import { currentUser } from "../../stores/current_user";

  export let currentRoute;
  let unsubscribe;
  let userInfo = {};

  onMount(() => {
    unsubscribe = currentUser.subscribe(user => (userInfo = user));
  });

  onDestroy(() => {
    unsubscribe();
  });
</script>

<div>
  <h1>Admin Layout</h1>
  <Route {currentRoute} {currentUser} />
</div>
```

## API

### SpaRouter

`import { SpaRouter } from 'svelte-router-app'`

This object receives three params: routes, pathName and notFound.

**routes** An array of routes.

**pathName** The path name to evaluate. For instance '/admin/employees?show-all=false'. It defaults to _document.location.pathname_

**notFound** A svelte component that will be rendered if the route can not be found.

It exposes a single property called _activeRoute_ that will return the current active route and some additional information (see below.)

Routes can contain as many nested routes as needed.

It can also contain as many layouts as needed and they will be nested.

In the following example both the home root ('/' and 'login' will use the same layout). Admin, employees and employeesShow will use the admin layout.

Example of routes:

```
const routes = [
  {
    name: '/',
    component: PublicIndex,
    layout: PublicLayout
  },
  { name: 'login', component: Login, layout: PublicLayout },
  {
    name: 'admin',
    component: AdminIndex,
    layout: AdminLayout,
    nestedRoutes: [
      {
        name: 'employees',
        component: EmployeesIndex,
        nestedRoutes: [
          { name: 'show/:id', component: EmployeesShow }
        ]
      }
    ]
  }
]
```

The routes that this file will generate are:

```
/
/login
/admin
/admin/employees
/admin/employees/show
/admin/employees/show/23432
```

**activeRoute** It returns an object with the current route, any named params and all query params sent in the url.

### navigateTo

`import { navigateTo } from 'svelte-router-app'`

navigateTo allows you to programatically navigate to a route from inside your app code.

navigateTo receives a path name as a param and will try to navigate to that route.

Example:

```
if (loginSuccess) {
    navigateTo('admin')
} else {
  alert('Incorrect credentials');
}
```

### MainLayout

`import { MainLayout } from 'svelte-router-spa'`

This is the main component that needs to be included before any other content as it holds information about which route should be rendered.

The best approach is to have an App.svelte file like this:

```
<script>
  import { MainLayout } from 'svelte-router-spa'
</script>

<MainLayout />
```

The layout and/or the component that matches the active route will be rendered inside _MainLayout_.

## Route

import { Route } from 'svelte-router-spa'

This component is only needed if you create a layout. It will take care of rendering the content for the child components or child layouts recursively. You can have as many nested layouts as you need.

The info about the current route will be received as a prop so you need to define _currentRoute_ and export it.

Example:

```
<script>
  import { Route } from 'svelte-router-spa'
  import TopHeader from './top_header.svelte'
  import FooterContent from './footer_content.svelte'
  export let currentRoute
</script>

<div class="app">
  <TopHeader />
  <section class="section">
    <Route {currentRoute} />
  </section>
  <FooterContent />
</div>
```