
const genCookie = (res, token) => {
    const cookie = res.cookie("xtp_site", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 60 * 1000
    });

    return cookie;
}

module.exports = genCookie;