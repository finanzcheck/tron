var $ = require('jquery');

function getClients(){
 return $.ajax('/api/clients');
}

module.exports = {
 getClients: getClients
};
