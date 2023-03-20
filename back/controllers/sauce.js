const Sauce = require('../models/sauce');
const fs = require('fs');

// Création d'une sauce

exports.createSauce = (req, res, next) =>{
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ... sauceObject, 
        userId: req.auth.userId, 
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
    .then(() => { res.status(201).json({message: 'Sauce enregistré !'})})
    .catch(error => {res.status(400).json( {error})})
};

// Modification d'une sauce 

exports.modifySauce = (req, res, next) =>{
    const sauceObject = req.file ?{
        ...JSON.parse(req.body.thing),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body};

    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
        if (sauce.userId != req.auth.userId){
            res.status(401).json({ message: 'Non-autorisé'});
        } else {
            Sauce.updateOne({ _id: req.params.id}, {... sauceObject, _id: req.params.id})
            .then(() => res.status(200).json({message: 'Sauce modifié !'}))
            .catch(error => res.status(401).json({error}));
        }
    })
    .catch((error)=> {
        res.status(400).json({error});
    });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            if (sauce.userId != req.auth.userId){
                res.status(401).json({message: 'Non-autorisé'});
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () =>{
                    Sauce.deleteOne({_id: req.params.id})
                        .then(() => {res.status(200).json({message:'Sauce supprimé !'})})
                        .catch(error => res.status(401).json({error}));
                });
            }
        })
        .catch( error =>{
            res.status(500).json({error});
        })
};

exports.getOneSauce = (req, res, next) =>{
    Sauce.findOne({_id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }))
};

exports.getAllSauces = (req, res, next) =>{
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({error}));
}

exports.likeSauce = (req, res, next) => {
       switch (req.body.like) {
        // Like
        case 1:
            Sauce.updateOne(
                { _id: req.params.id },
                // On ajoute l'id de l'utilisateur dans le tableau usersLiked et on incrémente de 1
                { $push: { usersLiked: req.body.userId }, $inc: { likes: +1 } }
            )
                .then(() => res.status(200).json({ message: 'J\'aime cette sauce !' }))
                .catch((error) => res.status(400).json({ error }));
            break;
        // Annulation du like ou dislike
        case 0:
            Sauce.findOne({ _id: req.params.id })
                .then((sauce) => {
                    // si l'id de l'utilisateur se trouve dans le tableau usersLiked
                    if (sauce.usersLiked.includes(req.body.userId)) {
                        Sauce.updateOne(
                            { _id: req.params.id },
                            // On retire l'id de l'utilisateur du tableau usersLiked
                            { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } }
                        )
                            .then(() =>
                                res.status(200).json({ message: 'like annulé !' })
                            )
                            .catch((error) => res.status(400).json({ error }));
                    }
                    // si l'id de l'utilisateur se trouve dans le tableau usersDisliked
                    if (sauce.usersDisliked.includes(req.body.userId)) {
                        Sauce.updateOne(
                            { _id: req.params.id },
                            // On retire l'id de l'utilisateur du tableau usersDisliked
                            { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } }
                        )
                            .then(() =>
                                res.status(200).json({ message: 'Dislike annulé !' })
                            )
                            .catch((error) => res.status(400).json({ error }));
                    }
                })
                .catch((error) => res.status(404).json({ error }));
            break;
        // Dislike
        case -1:
            Sauce.updateOne(
                { _id: req.params.id },
                // On ajoute l'id de l'utilisateur dans le tableau usersDisliked et on incrémente de 1
                { $push: { usersDisliked: req.body.userId }, $inc: { dislikes: +1 } }
            )
                .then(() => {
                    res.status(200).json({ message: 'Je n\'aime pas cette sauce !' });
                })
                .catch((error) => res.status(400).json({ error }));
            break;
        default:
    }
}

