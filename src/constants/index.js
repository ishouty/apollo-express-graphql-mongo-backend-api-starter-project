export const apiVersion = '1.00'

export const errorResponse = {
  emailAlreadyExists: 'The email already exists.', //409
  somethingWentWrong: 'Sorry, something went wrong.', //500
  timeOutResponse: 'Unable to connect to the server', //timeout
  serverMaintenance: 'Maintenance mode, please try again', //503
  resourceNotFound: 'Not Found', //404
  notLoggedIn: 'Please log in before making this request', //403
  forbidden: 'Sorry, you cannot access this feature.', //403
  badRequest: 'Bad request', //400
  noResultsFound: 'No Results Found', //201
  userFilterRequired: 'Filter required, not found in request query', //500
  invalidDateEntered: 'Date entered is incorrect',
  paginationError:
    'A problem occurred when paginating the search results', //500,
  cannotSetPassword:
    'Cannot set password, please request a new email', //500
  noPermissions: 'You do not have permissions', //400
  blockedAccount:
    'Your account has been blocked. Check email or contact support. ', //500
  cannotUpdateOrCreateUser: 'Could not create or update user.',
}

export const userInputErrorResponse = {
  invalidEmail: 'Please enter a valid email address',
}

export const userType = {
  admin: 'admin',
  user: 'user',
}

export const sortType = {
  asc: 'asc',
  desc: 'desc',
}
