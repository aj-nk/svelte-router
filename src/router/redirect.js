const { RouterGuard } = require('./guard')

function RouterRedirect(route, currentPath) {
  const guards = route.onlyIf instanceof Array ? route.onlyIf : [route.onlyIf]

  function path() {
    let redirectTo = currentPath
    if (route.redirectTo && route.redirectTo.length > 0) {
      redirectTo = route.redirectTo
    }

    for (let g of guards) {
      const guard = RouterGuard(g)

      if (guard.valid() && guard.redirect()) {
        redirectTo = guard.redirectPath()
        break
      }
    }

    return redirectTo
  }

  return Object.freeze({ path })
}

module.exports = { RouterRedirect }
