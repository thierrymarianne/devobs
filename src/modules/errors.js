class NoRemainingStatusAfterApplyingFilter extends Error {}
class InvalidSession extends Error {
  constructor(
    message = `Have your mapped the "getIdToken" authentication getter
    from the component sending an HTTP request?`
  ) {
    super(message);
  }
}

export default {
  InvalidSession,
  NoRemainingStatusAfterApplyingFilter
};
