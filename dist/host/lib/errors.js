/** One failure the files route can report with a stable code. */
export class FilesError extends Error {
    code;
    details;
    /**
     * @param code stable error code, for example `files/conflict`.
     * @param message message safe to show to the user.
     * @param details optional structured details.
     */
    constructor(code, message, details = {}) {
        super(message);
        this.name = 'FilesError';
        this.code = code;
        this.details = details;
    }
}
/**
 * Read the `code` of a filesystem failure.
 * @param error the thrown value.
 * @returns the errno name, or undefined when it is not an errno failure.
 */
export function errnoCode(error) {
    if (!(error instanceof Error) || !('code' in error))
        return undefined;
    const { code } = error;
    return typeof code === 'string' ? code : undefined;
}
/**
 * Tell a missing path apart from a real failure.
 * @param error the thrown value.
 * @param code the errno name to test for.
 * @returns whether the failure carries that errno name.
 */
export function isErrno(error, code) {
    return errnoCode(error) === code;
}
