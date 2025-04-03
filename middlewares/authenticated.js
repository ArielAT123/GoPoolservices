import { jwtgenerated } from "../utils/index.js";

function asureAuth(req, res, next) {
    if(!req.headers.authorization){
        return res
        .status(403)
        .send({ msg: "La peticion no tiene la cabecera de autenticacion" });
        }    
    const token = req.headers.authorization.replace("Bearer ", "");
    try {

        const hasExpired = jwtgenerated.hasExpiredToken(token);
        if(hasExpired){
            return res.status(400).send({msg: "Token ha expirado"});
        }
        const payload = jwtgenerated.decoded(token);
        req.user =  payload;
        
        
        next();
    } catch (error) {
        return res.status(400).send({msg: "Token invalido"});
    } 
 
}

export const mdAuth = {
    asureAuth,
};