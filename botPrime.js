/* 
 * Lien à mettre dans le navigateur pour intégrer le bot à un chan:
 * https://discordapp.com/oauth2/authorize?client_id=186902786443575296&scope=bot&permissions=66186303
 * 
 * Laisser les permissions suivantes, décocher les autres:
 *      - Se connecter                          - Lire, gérer & envoyer des messages
 *      - Attacher des fichiers                 - Voir les anciens messages
 *      - Déplacer & expulser les membres       - Intégrer des liens
 *      - Parler
 */

var Discord = require("discord.js");
var request = require("request");

var botPrime = new Discord.Client();

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
        case "Hi":
            botPrime.reply(message, "Chalut!");
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
                    botPrime.reply(message, result);
                }
                else {
                    botPrime.reply(message, "Données inaccessibles.");
                };
            })
            break;
    
        default:
            break;
    }
});

botPrime.loginWithToken("MTg2OTAyODk5ODE5ODA2NzIx.Ci4gig.FiM749obbx2xNswN9aPOMC0LkL8");