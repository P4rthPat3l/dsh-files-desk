/** One failure the files route can report with a stable code. */
export class FilesError extends Error {
  /**
   * @param {string} code stable error code, for example `files/conflict`.
   * @param {string} message message safe to show to the user.
   * @param {Record<string, unknown>} [details] optional structured details.
   */
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'FilesError';
    this.code = code;
    this.details = details;
  }
}
