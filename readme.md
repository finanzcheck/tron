#UI

client is a tv.

##ui states 
- on
- pending
- off

##use cases

###switch client off/on
- client receives to switch off/on
- UI-state is pending
- server emit client update

###switch all client off/on
- UI emit to all clients to switch off/on
- same logic as switch off/on single client

###change url on client
- client receive to change url
- UI-state is pending
- server emit client update


##UI emits
###switch (client, boolean state)
use to switch on/off the client
parameter "client": client-id
parameter "state": true switch on client

change client on UI to state "pending"

###clients
need initial list of clients

change complete UI to pending

##UI receive
###updateClient => client-id, state
receive client-id and state of client
when client is new client will append to list

###clients => clients
receive list of clients


