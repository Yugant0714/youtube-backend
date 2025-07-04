// const asyncHandler = (fu) => async (req, res, next)=>{
//     try {
//         await fu(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             meassage: error.meassage
//         })
//     }
// }

const asyncHandler = (requestHandler)=>{
    return (req, res, next)=>{
        Promise.resolve(requestHandler(req, res, next))
        .catch((error)=>{
            next(error)
        })
    }
}
    
export default asyncHandler
