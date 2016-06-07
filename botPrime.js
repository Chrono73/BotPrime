/* 
 * Lien à mettre dans le navigateur pour intégrer le bot à un chan:
 * https://discordapp.com/oauth2/authorize?client_id=188203858860703744&scope=bot&permissions=66186303
 * 
 * Laisser les permissions suivantes, décocher les autres:
 *      - Se connecter                          - Lire, gérer & envoyer des messages
 *      - Attacher des fichiers                 - Voir les anciens messages
 *      - Déplacer & expulser les membres       - Intégrer des liens
 *      - Parler
 */

var Discord = require("discord.js");
var request = require("request");
var fs = require("fs");

var botPrime = new Discord.Client();

var kenOneLiners = [
    "Décidément les temps comme les oeufs sont durs, et la bêtise...\n..n'a pas de limites.",
    "Les machoires de mes ennemis sont comme le téléphone.\nAprès quelques coups, ça décroche.",
    "Nooooon! T'as cassé ma montre!",
    "Nooon! Tu peux pas me laisser comme ça, comme un chien!\nDonne moi au moins, euh, je sais pas moi, de la pâtée!",
    "Evidemment, qui pourrait croire une seconde qu'une vielle femme aussi horrible puisse exister,\nsurtout avec une barbe de 5 jours!",
    "La technique de la blanquette de veau est née en Chine,\nlorsque la mousse tache.",
    "L'oiseau du vent, Shu, plus connu sous le nom de Shu, est tombé aux mains du terrible Souther."
];

function typeParse(mt) {
    var res;
    switch (mt) {
        case "MT_DEFENSE":
            res = "Défense";
            break;
        case "MT_EXTERMINATION":
            res = "Extermination";
            break;
        case "MT_CAPTURE":
            res = "Capture";
            break;
        case "MT_ASSASSINATION":
            res = "Assassinat";
            break;
        case "MT_HIVE":
            res = "Ruche";
            break;
        case "MT_MOBILE_DEFENSE":
            res = "Défense mobile";
            break;
        case "MT_COUNTER_INTEL":
            res = "Imposture";
            break;
        case "MT_RESCUE":
            res = "Sauvetage";
            break;
        case "MT_INTEL":
            res = "Espionnage";
            break;
        case "MT_RETRIEVAL":
            res = "Détournement";
            break;
        case "MT_SURVIVAL":
            res = "Survie";
            break;
        case "MT_EXCAVATE":
            res = "Excavation";
            break;
        case "MT_SABOTAGE":
            res = "Sabotage";
            break;
        default:
            res = mt;
            break;
    }
    return res;
};

function sectorParse(sn) {
    var res;
    var id = sn.substring(sn.lastIndexOf('e') + 1);
    switch (id) {
        case "3":
            res = "Uranus / Cordelia";
            break;
        case "7":
            res = "Saturn / Epimetheus";
            break;
        case "35":
            res = "Mars / Arcadia";
            break;
        case "42":
            res = "Saturn / Hélène";
            break;
        case "52":
            res = "Uranus / Portia";
            break;
        case "65":
            res = "Mars / Gradivus";
            break;
        case "75":
            res = "Terre / Lua";
            break;
        case "78":
            res = "Neptune / Triton";
            break;
        case "121":
            res = "Jupiter / Carpo";
            break;
        case "125":
            res = "Jupiter / Io";
            break;
        case "135":
            res = "Céres / Thon";
            break;
        case "155":
            res = "Eris / Cosis";
            break;
        case "164":
            res = "Eris / Kala-azar";
            break;
        case "174":
            res = "Eris / Sparga";
            break;
        case "187":
            res = "Eris / Selkie";
            break;
        case "207":
            res = "Europe / Gamygyn";
            break;
        default:
            res = sn;
            break;
    }
    return res;
}

botPrime.on("message", function(message) {
    
    switch (message.content) {
        case "!help":
            var helpMsg = "Alors, noob, on connait pas les commandes ?\n";
            helpMsg += "\t- !help:    affiche ce message.\n";
            helpMsg += "\t- !git:     affiche le lien du projet GitHub.\n";
            helpMsg += "\t- !alerts:  affiche les alertes Warframe du moment.\n";
            helpMsg += "\t- !baro:    affiche les informations liées au Void Trader.\n\n";
            helpMsg += "Tout ça avec quelques easter eggs. Et ne me fais pas répéter !\n";
            botPrime.reply(message, helpMsg);
            break;
        
        case "!git":
            botPrime.reply(message, "https://github.com/Chrono73/BotPrime");
            break;
            
        case "!alerts":
            var wfdata = "http://content.warframe.com/dynamic/worldState.php";
            request({
                url: wfdata,
                json: true
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var result = "\n";
                    body.Alerts.forEach( function(alert, index) {
                        result += sectorParse(alert.MissionInfo.location) + " - ";
                        result += typeParse(alert.MissionInfo.missionType) + " - ";
                        result += alert.MissionInfo.missionReward.credits + "cr";
                        if (alert.MissionInfo.missionReward.hasOwnProperty('countedItems')) {
                            alert.MissionInfo.missionReward.countedItems.forEach( function(reward, index) {
                                result += " - " + reward.ItemCount + "x ";
                                result += reward.ItemType.substring(reward.ItemType.lastIndexOf('/')+1);
                            })
                        };
                        if (alert.MissionInfo.missionReward.hasOwnProperty('items')) {
                            alert.MissionInfo.missionReward.items.forEach( function(reward, index) {
                                result += " - 1x ";
                                result += reward.substring(reward.lastIndexOf('/')+1);
                            })
                        };
                        result += "\n";
                    });
                    if (result != "")
                        botPrime.reply(message, result);
                    else
                        botPrime.reply(message, "Aucune alerte en cours.");
                }
                else {
                    botPrime.reply(message, "Données inaccessibles.");
                };
            })
            break;
            
        case "!baro":
            var wfdata = "http://content.warframe.com/dynamic/worldState.php";
            request({
                url: wfdata,
                json: true
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var result = "\n";
                    result += "Baro'Ki Teer - Void Trader\n";
                    rmtime = body.VoidTraders[0].Activation.sec - body.Time;
                    j = Math.floor(rmtime / 86400);
                    rmtime = rmtime % 86400;
                    h = Math.floor(rmtime / 3600);
                    rmtime = rmtime % 3600;
                    m = Math.floor(rmtime / 60);
                    rmtime = rmtime % 60;
                    result += "Arrive dans " + j + " jours, " + h + " heures, " + m + " minutes et " + rmtime + " secondes.\n";
                    result += "Il apparaîtra au relais de ";
                    if (body.VoidTraders[0].Node == "MercuryHUB") result += "Mercure.\n";
                    else if (body.VoidTraders[0].Node == "SaturnHUB") result += "Saturne.\n";
                    else result += "Pluton.\n";
                    if (result != "")
                        botPrime.reply(message, result);
                    else
                        botPrime.reply(message, "Erreur lors de la récupération des données.");
                }
            });

        // Easter Eggs
        case "!ken":
            res = Math.floor((Math.random() * kenOneLiners.length));
            botPrime.reply(message, kenOneLiners[res]);
            break;
            
        case "Paladin, niveau 66.":
            botPrime.reply(message, "Archmâââge, 57.\n");
            break;
            
        default:
            break;
    }
});

botPrime.on("serverNewMember", function(server, user){
    console.log(user);
    welcomeMsg = user.name + ", salut belle plante.\nOn en voit pas souvent des comme ça par ici!\n"
    //botPrime.sendMessage(server.defaultChannel, welcomeMsg);
})

botPrime.loginWithToken(process.env.TOKEN);
console.log("Bot en ligne et prêt!\n");
