//ce middleware verifie que l'utilisateur est bein connecté et possède l'acces requis 
const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');

const authMiddleware = async (req,res,next) => {
    try{
    //1.Recuperer le token des headers et extriaire le token sans Bearer
    const token = req.headers.authorization?.split(' ')[1];

    //2.Verifier s'il existe et s'il a le bon format
    if(!token){return res.status(401).json({'message':'acces non authorized'})} 

    //4.Verifier avec jwt.verify() si le token est valide ,decoder le token pour obtenir le userId et le role 
    const decodedToken = jwt.verify(token,process.env.SECRET_KEY);

    // SECURITY FIX: previously the middleware trusted the role embedded in
    // the JWT for the entire 72h lifetime of the token, with no check that
    // the user still exists or still holds that role. This meant a deleted
    // account, or a role downgraded by an admin, remained fully authorized
    // until the token naturally expired. We now re-verify against the
    // current DB state on every request and use the DB's role, not the
    // token's, as the source of truth.
    const currentUser = await UserModel.findById(decodedToken.userId).select('role');
    if (!currentUser) {
        return res.status(401).json({ message: 'Utilisateur introuvable, veuillez vous reconnecter' });
    }

    //5.si valide -> ajouter les infos users a la requete (role toujours lu depuis la DB)
    req.user = {
        id: decodedToken.userId, role: currentUser.role
    }; 
    next();
}
catch(error){
 // Différencier les types d'erreurs
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expiré' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token invalide' });
        }
        
        res.status(500).json({ message: 'Erreur d\'authentification' });}
}
module.exports = authMiddleware;
