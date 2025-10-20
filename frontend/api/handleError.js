// Error class for API errors
class ApiError extends Error {
    status; message; path;
    constructor(status, message, path) {
        super(message);
        this.status = status;
        this.path = path;
    }
}

function handleError(error) {
    let status; let message; let path;
    if (error.status === 422) {
        status = error.status
        if (
            error.response &&
            error.response.data &&
            Array.isArray(error.response.data.errors) &&
            error.response.data.errors.length > 0
        ) {
            message = error.response.data.errors[0].msg
            path = error.response.data.errors[0].path
        } else {
            message = "Unprocessable Entity"
            path = undefined
        }
    } else {
        status = error.status
        message = error.response && error.response.data && error.response.data.error
    }
    throw new ApiError(status, message, path)
}

export { handleError };

