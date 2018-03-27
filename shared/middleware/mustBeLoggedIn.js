module.exports = function() {
  return (req, res, next) => {
    // if the user is authenticated, we're all good here. let the next middleware handle it.
    if (req.isAuthenticated()) {
      return next();
    }

    // if we've gotten to this point, that means the user is NOT authenticated but should be
    // so let's respond with an appropriate 403 Forbidden reponse

    // if the client says they want JSON, this is probably an AJAX call so let's respond with a JSON error
    if (req.accepts('json')) {
      res.status(403).json({
        message: 'You must be logged in to perform this action.'
      });
    } else {
      // otherwise, try and render a view named "forbidden"
      res.status(403).render('forbidden');
    }
  }
}
