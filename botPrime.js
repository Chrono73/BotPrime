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
var http = require('http');
var sectorNames = require('./data/sectorNames.json');

var wfdata = "http://content.warframe.com/dynamic/worldState.php";

var botPrime = new Discord.Client();

var kenOneLiners = [
    "Décidément les temps comme les oeufs sont durs, et la bêtise...\n..n'a pas de limites.",
    "Les machoires de mes ennemis sont comme le téléphone.\nAprès quelques coups, ça décroche.",
    "Nooooon! T'as cassé ma montre!",
    "Nooon! Tu peux pas me laisser comme ça, comme un chien!\nDonne moi au moins, euh, je sais pas moi, de la pâtée!",
    "La technique de la blanquette de veau est née en Chine,\nlorsque la mousse tache.",
    "L'oiseau du vent, Shu, plus connu sous le nom de Shu, est tombé aux mains du terrible Souther.",
    "La technique de la Grande Ourse est d'une puissance incalculable,\nmoi-même j'ai des difficultés pour la calculer.",
    "Cette attaque est redoutable... elle est si rapide et si tranchante,\nque lorsque le sang jaillit... Oooh, c'est déjà un bloc de glace à la vanille,\net le corps de l'adversaire est bleui par le froid.",
    "Eh bien si lui fait des miracles, tu peux m'appeler Jean-Baptiste.",
    "Tu es Ken le survivant et tu as suivi l'enseignement de l'école du Hokuto, ou tard?\n- Plutôt tard...\n- Plutôt tard que jamais, là est le principal.",
    "Attaque Nanto, le poing du guerrier dans la figure !\n- Attaque Hokuto, coup de pied volant avec pointure !"
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

function computeTime(time) {
    j = Math.floor(time / 86400);
    time = time % 86400;
    h = Math.floor(time / 3600);
    time = time % 3600;
    m = Math.floor(time / 60);
    s = time % 60;
    return [j, h, m, s];
}

/*botPrime.on("ready"), function(){
    var connectMsg = "Bonjour, le bot a été update ! Venez voir les changements sur le GitHub!";
    botPrime.servers.forEach(function(serv){
        botPrime.sendMessage(serv.defaultChannel, connectMsg);
    })
}*/

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
            request({
                url: wfdata,
                json: true
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var result = "\n";
                    body.Alerts.forEach( function(alert, index) {
                        var sector = sectorNames[alert.MissionInfo.location].split("|");
                        result += sector[0] + ", " + sector[1] + " - ";
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
                        rmtime = rmtime = computeTime(alert.Expiry.sec - body.Time);
                        result += " - " + rmtime[2] + "m, " + rmtime[3] + "s restantes";
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
            request({
                url: wfdata,
                json: true
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var result = "\n";
                    result += "Baro'Ki Teer - Void Trader\n";
                    rmtime = computeTime(body.VoidTraders[0].Activation.sec - body.Time);
                    result += "Arrive dans " + rmtime[0] + " jours, " + rmtime[1] + " heures, " + rmtime[2] + " minutes et " + rmtime[3] + " secondes.\n";
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
            break;

        // Easter Eggs
        case "!ken":
            res = Math.floor((Math.random() * kenOneLiners.length));
            botPrime.reply(message, kenOneLiners[res]);
            break;

        case "Paladin, niveau 66.":
            botPrime.reply(message, "Archmâââge, 57.\n");
            break;

        case "On fouille les cadavres pour le butin.":
        cible = message.server.members[Math.floor((Math.random() * message.server.members.length))].username;
            botPrime.reply(message, "Trop tard, "+cible+" s'en est déjà chargé pendant que vous vous battiez.\n");
            break;
            
        case "!bluekutku":
            if (rufFlightAcademyLessons==2) {
                botPrime.reply(message, "\nKseniva carted.\nQuest reward reduced to 0.\nMission failed.\nReturning to camp.\nBut at least Kseniva knows how to fly.");
                rufFlightAcademyLessons = 0;
            }
            else {
                botPrime.reply(message, "\nKseniva carted.\nQuest reward reduced to 0.\nMission failed.\nReturning to camp.\nBut at least Kseniva knows how to fly.");
                rufFlightAcademyLessons++;
            }
            break;

        default:
            break;
    }
});

botPrime.on("serverNewMember", (server, user) => {
    console.log(user);
    welcomeMsg = user.name + ", salut belle plante.\nOn en voit pas souvent des comme ça par ici!\n"
    //botPrime.sendMessage(server.defaultChannel, welcomeMsg);
})

botPrime.loginWithToken(process.env.TOKEN);
console.log("Bot en ligne et prêt!\n");

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.send('it is running\n');
}).listen(process.env.PORT || 5000);