export async function isUserValidator(req, res, next) {
    const user = req.user
    if (!user)
        res.json("Not Authorized")
    next() 
}