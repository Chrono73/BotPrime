/*
 * Lien à mettre dans le navigateur pour intégrer le bot à un chan:
 * https://discordapp.com/oauth2/authorize?client_id=194202468173742080&scope=bot&permissions=66186303
 *
 * Laisser les permissions suivantes, décocher les autres:
 *      - Se connecter                          - Lire, gérer & envoyer des messages
 *      - Attacher des fichiers                 - Voir les anciens messages
 *      - Déplacer & expulser les membres       - Intégrer des liens
 *      - Parler                                - Gérer les rôles
 */

 //==============================================================================
 //  Variables globales
 //==============================================================================

// Variable permettant de lancer le bot de test (1) ou celui en release (0).
var devMode = 0;

var christmas_spam = 0;

// Chargement des modules npm requis.
var Discord = require("discord.js");
var fs = require("fs");
var http = require("http");

// Chargement des fichiers de fonction.
var commands = require("./commands.js");
var utils = require("./utils.js");

// Instanciation du client Discord du bot.
var botPrime = new Discord.Client();

//==============================================================================
//  Fonctions serveur du bot
//==============================================================================

// Fonction appelée lorsque le bot est prêt à l'utilisation.
botPrime.on("ready", function(){
    var connectMsg = ":christmas_tree: @everyone Joyeux Noël, bande de geeks! :christmas_tree:\n";
    connectMsg += ":christmas_tree: BotPrime est de retour, plus festif que jamais! :christmas_tree:\n";
    connectMsg += ":christmas_tree: De nouvelles fonctions à venir très bientôt! :christmas_tree:";

    if (devMode==0) {
        console.log("Envoi des messages de mise à jour");
        botPrime.servers.forEach(function(serv){
            botPrime.sendMessage(serv.defaultChannel, connectMsg);
        })
    }
});

// Fonction appelée à chaque message posté sur un serveur où il est présent.
botPrime.on("message", function(message) {

    if (christmas_spam == 20) {
       botPrime.sendMessage(message.channel, ":christmas_tree: :menad: :christmas_tree:");
       christmas_spam = 0;
    }
    else christmas_spam++;


    // Vérification si le message est une commande
    if (message.content.charAt(0)=='!'){

        // Si oui, appel de la fonction correspondante.
        var command = message.content.substring(message.content.indexOf('!')+1).split(" ");
        switch (command[0]) {

            case "help":
                commands.help(message);
                break;

            case "git":
                commands.git(message);
                break;

            case "alerts":
                commands.alerts(message);
                break;

            case "baro":
                commands.baro(message);
                break;

            case "ken":
                commands.ken(message);
                break;

            case "bluekutku":
                commands.bluekutku(message, botPrime);
                break;

            case "corona":
                commands.corona(message);
                break;

            case "pokeball":
                commands.pokeball(message, botPrime);
                break;

            case "post":
                commands.post(message, command, botPrime);
                break;

            case "seum":
                commands.seum(message, botPrime);
                break;

            // On ignore les commandes associées au AIRHORN Bot.
            case "airhorn":
            case "AIRHORN":
            case "wowthatscool":
            case "wtc":
            case "anotha":
            case "johncena":
            case "cena":
            case "stan":
            case "stanislav":
            case "ethan":
            case "eb":
            case "bday":
                break;

            // Si la commande n'est pas reconnue, on informe celui qui l'a envoyée.
            default:
                message.reply("Commande inconnue. Balance un petit !help, Tenno!", false, function(err){
                    if (err) throw err;
                });
                break;
        }
    }
    // Si non, analyse du contenu pour rechercher certains triggers d'easter eggs.
    else {
        if (message.content=="Paladin, niveau 66."){
            message.reply("Archmâââge, 57.\n", false, function(err){
                if (err) throw err;
            });
        }
        if (message.content=="On fouille les cadavres pour le butin.") {
            cible = message.channel.server.members[Math.floor((Math.random() * message.channel.server.members.length))].username;
            message.reply("Trop tard, "+cible+" s'en est déjà chargé pendant que vous vous battiez.\n", false, function(err){
                if (err) throw err;
            });
        }
    }
});

// Fonction appelée lorsqu'un nouveau membre rejoint un server où il est présent.
botPrime.on("serverNewMember", function(server, user) {
    welcomeMsg = user.mention() + ", salut belle plante!\nOn en voit pas souvent des comme ça par ici. <3\n"
    botPrime.sendMessage(server.defaultChannel, welcomeMsg);
})

//==============================================================================
//  Fonctions de connection & reconnection
//==============================================================================

// Fonction connectant le bot correspondant au mode choisi.
function connect(){
    // En mode développement, connecte le bot de test (token en fichier local).
    if (devMode) {
        fs.readFile('./token', 'utf8', function read(err, token){
            if (err) {
                throw err;
            }
            else {
                botPrime.loginWithToken(token);
                console.log("Bot en ligne et prêt!\n");
            }
        });
    }
    // En mode release, connecte le bot officiel (token stocké sur Heroku).
    else {
        botPrime.loginWithToken(process.env.TOKEN);
        console.log("Bot release en ligne et prêt!\n");
    }
}

// Fonction appellée à chaque déconnection.
botPrime.on("disconnected", function(){
    connect();
})

// Connection initiale du bot.
connect();

//==============================================================================
//  Fonctions auxilliaires
//==============================================================================

// Bypass du protocole Heroku exigeant qu'un programme écoute au moins un port.
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.send('it is running\n');
}).listen(process.env.PORT || 5000);
