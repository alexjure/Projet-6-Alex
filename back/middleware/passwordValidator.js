const passwordValidator = require('password-validator');

// Création du schema
const schema = new passwordValidator();

// Ajout des propriétés
schema
.is().min(8)                                    // Longueur minimal 8
.is().max(100)                                  // Longueur maximal 100
.has().uppercase()                              // Doit avoir des lettres majuscules
.has().lowercase()                              // Doit avoir des lettres minuscules
.has().digits(2)                                // Doit avoir au moins 2 chiffres
.has().not().spaces()                           // Ne doit pas avoir d'espace
.is().not().oneOf(['Passw0rd', 'Password123']); // Mettre ces valeurs sur liste noire

module.exports = (req, res, next) => {

    const { password } = req.body;

    if(schema.validate(password)){
        next()
    }else{
        return res.status(400).json({ error: `Le mot de passe n\'est pas valide` });
    }

    console.log(schema.validate('invalidPASS'));


    
   
};