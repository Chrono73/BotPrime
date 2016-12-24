
// =======================================================================
// Module des différentes fonctions associées aux commandes !.
// =======================================================================

// Chargement du module npm requis pour les requêtes http.
var request = require("request");

// Chargement des fonctions utilitaires.
var utils = require("./utils.js");

// Récupération des données nécessaires aux fonctions.
var easter = require("./data/easter.json");
var wfdata = "http://content.warframe.com/dynamic/worldState.php";

// Variables d'état de fonctions.
var rufFlightAcademyLessons = 0;

module.exports = {

    //===========================================
    //    Commandes officielles
    //===========================================

    // Affiche l'aide du bot.
    help: function(message) {
        var helpMsg = "Alors, noob, on connait pas les commandes ?\n";
        helpMsg += "\t- !help:    affiche ce message.\n";
        helpMsg += "\t- !git:      affiche le lien du projet GitHub.\n";
        helpMsg += "\t- !alerts:  affiche les alertes Warframe du moment.\n";
        helpMsg += "\t- !baro:    affiche les informations liées au Void Trader.\n\n";
        helpMsg += "Tout ça avec quelques easter eggs. Et ne me fais pas répéter !\n";
        message.reply(helpMsg, false, function(err){
            if (err) throw err;
        });
    },

    // Affiche le lien vers le github du bot.
    git: function(message) {
        message.reply("https://github.com/Chrono73/BotPrime", false, function(err){
            if (err) throw err;
        });
    },

    // Liste les alertes en cours sur Warframe.
    alerts: function(message) {
        request({
            url: wfdata,
            json: true
        }, function (error, response, body) {

            if (!error && response.statusCode === 200) {
                var result = "\n";
                body.Alerts.forEach( function(alert, index) {
                    result += utils.typeParse(alert.MissionInfo.missionType) + " - ";
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
                    rmtime = utils.computeTime(alert.Expiry.sec - body.Time);
                    result += " - " + rmtime[2] + "m, " + rmtime[3] + "s restantes";
                    result += "\n";
                });
                if (result != "")
                    message.reply(result, false, function(err){
                        if (err) throw err;
                    });
                else
                    message.reply("Aucune alerte en cours.", false, function(err){
                        if (err) throw err;
                    });
            }
            else {
                message.reply("Données inaccessibles.", false, function(err){
                    if (err) throw err;
                });
            };
        })
    },

    // Liste les informations liées au Void Trader sur Warframe.
    baro: function(message) {
        request({
            url: wfdata,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var result = "\n";
                result += "Baro'Ki Teer - Void Trader\n";
                if (body.VoidTraders[0].hasOwnProperty("Manifest")) {
                    rmtime = utils.computeTime(body.VoidTraders[0].Expiry.sec - body.Time);
                    result += "Part dans " + rmtime[0] + " jour, " + rmtime[1] + " heures, " + rmtime[2] + " minutes et " + rmtime[3] + " secondes.\n";
                    body.VoidTraders[0].Manifest.forEach( function(item){
                        result += item.ItemType.substring(reward.lastIndexOf('/')+1); + " - " + item.PrimePrice + " ducats & " + item.RegularPrice + "cr\n";
                    });
                    if (result != "")
                        message.reply(result, false, function(err){
                            if (err) throw err;
                        });
                    else
                        message.reply("Erreur lors de la récupération des données.", false, function(err){
                            if (err) throw err;
                        });
                }
                else {
                    rmtime = utils.computeTime(body.VoidTraders[0].Activation.sec - body.Time);
                    result += "Arrive dans " + rmtime[0] + " jours, " + rmtime[1] + " heures, " + rmtime[2] + " minutes et " + rmtime[3] + " secondes.\n";
                    result += "Il apparaîtra au relais de ";
                    if (body.VoidTraders[0].Node == "MercuryHUB") result += "Mercure.\n";
                    else if (body.VoidTraders[0].Node == "SaturnHUB") result += "Saturne.\n";
                    else result += "Pluton.\n";
                    if (result != "") {
                        message.reply(result, false, function(err){
                            if (err) throw err;
                        });
                    }
                    else {
                        message.reply("Erreur lors de la récupération des données.", false, function(err){
                            if (err) throw err;
                        });
                    }
                }
            }
        });
    },

    //===========================================
    //    Easter eggs
    //===========================================

    ken: function(message) {
        res = Math.floor((Math.random() * easter.kenOneLiners.length));
        message.reply("```"+easter.kenOneLiners[res]+"```", false, function(err){
            if (err) throw err;
        });
    },

    bluekutku: function(message, client) {
        var prime = 0;
        if (rufFlightAcademyLessons==2) {
            client.sendMessage(message.channel, "\nKseniva carted.\nQuest reward reduced to "+prime+".\nMission failed.\nReturning to Great Hall.\nBut at least Kseniva knows how to fly now.", undefined, function(err){
                if (err) throw err;
            });
            rufFlightAcademyLessons = 0;
        }
        else {
            rufFlightAcademyLessons++;
            prime = 9999 - 3333*rufFlightAcademyLessons;
            client.sendMessage(message.channel, "\nKseniva carted.\nQuest reward reduced to "+prime+".\nReturning to camp.", undefined, function(err){
                if (err) throw err;
            });
        }
    },

    corona: function(message) {
        nbDrops = Math.floor((Math.random() * 4)) + 4;
        var bounty = [0,0,0,0,0,0,0,0,0,0,0];
        if (message.author.username=="DGKun") {
            for (i=0; i<nbDrops; i++) {
                bounty[Math.floor((Math.random() * easter.rKushDrops.length-1))]++;
            }
        }
        else {
            for (i=0; i<nbDrops; i++) {
                bounty[Math.floor((Math.random() * easter.rKushDrops.length))]++;
            }
        }
        var result = "Quest complete! Returning to camp in 1m.\n\n";
        result += "==== Quest rewards ====\n";
        bounty.forEach(function(nb, index) {
            if (nb!=0) result += nb+"x "+easter.rKushDrops[index]+"\n";
        })
        message.reply(result, false, function(err){
            if (err) throw err;
        });
    },

    pokeball: function(message, client) {
        client.sendMessage(message.channel, "MEURISSON!!!", undefined, function(err){
            if (err) throw err;
        });
    },

    post: function(message, command, client) {
        if (command.length >= 2) {
            var result = "Seigneur";
            for (i=1; i<=command.length -1; i++) result += " "+command[i];
            result += ", vous avez un postérieur, ma foi, très hospitalier!";
            client.sendMessage(message.channel, result, undefined, function(err){
                if (err) throw err;
            });
        }
        else
            message.reply("Commande inconnue. Balance un petit !help, Tenno!", false, function(err){
                if (err) throw err;
            });
    },

    seum: function(message, client) {
      var result = "**Une minute de silence en souvenir du Vendredi du Seum, le 16/12/2016.**"
      client.sendMessage(message.channel, result, undefined, function(err){
          if (err) throw err;
      });
    }
}
