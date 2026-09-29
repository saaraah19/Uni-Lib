//ce Middleware verifie les roles de l'utilisateur entre un etudiant ou un membre du staff 
const requireStaff = (req,res,next) => {
//il lit les infos trouvé a la requete de l'utilisateur, il lit l'id et le role (req.user mis par le authMidd)
//ensuite il verifie si le role est bien permis ou pas, 
//en fonction de ça sois il le permet sois il le bloque avec un erreur 403 forbideen 
//User → GET /api/books → ✅ Tout le monde (pas de middleware)
/*User → POST /api/books → 
  1. authMiddleware vérifie token → req.user = {id, role}
  2. requireStaff vérifie role === 'staff' ou 'admin'
  3. Si oui → createBook(), si non → 403
*/
try {
  
   //1.VERIFIER SI LE USER EST AUTHENTIFIE 
if (!req.user){return res.status(401).json({message:'NON AUTHENTIFIE'})} 
    //2.VERIFIE LE ROLE 
    //STAFF PEUVENET ACCEDER AUX ROUTES STAFF, SUPER ADMIN A AJOUTER PLUS TARD MAIS IL A ACCES EGALEMENT
    if(req.user.role === 'staff') {next()}
    //        if (req.user.role === 'staff' || req.user.role === 'admin') {next()}
    else {
        res.status(403).json({message:'Acces reserve uniquement au staff'})
    }
} catch (error) {
    res.status(500).json({message:error.message})
}


}
module.exports=requireStaff;