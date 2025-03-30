/*
async function asyncHandler(fn) {

}
*/
const asyncHandler = (fn) => {
    //arrow/anonymous function
    return async (req, res, next) => {
        try {
            await fn(req, res, next)
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error',
                // Including the error message can be help with debugging.
                // You might include more details based on the environment
                error: process.env.NODE_ENV === 'development' ? error : ""
            });
        }
    }
}

export default asyncHandler