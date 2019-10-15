const validateFormat =
  process.env.NODE_ENV !== 'production'
    ? function () { }
    : function (format: any) {
      if (format === undefined) {
        throw new Error('invariant(...): Second argument must be a string.');
      }
    };
/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments to provide
 * information about what broke and what you were expecting.
 *
 * The invariant message will be stripped in production, but the invariant will
 * remain to ensure logic does not differ in production.
 */

export default function invariant(condition: any, format: string, c?: any, d?: any) {
  let _len = arguments.length;
  const args = new Array(_len > 2 ? _len - 2 : 0)
  for (let _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }
  validateFormat(format);

  if (!condition) {
    let error:any;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      let argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function () {
          return String(args[argIndex++]);
        })
      );
      error.name = 'Invariant Violation';
    }
    error.framesToPop = 1; // Skip invariant's own stack frame.
    throw error;
  }
}