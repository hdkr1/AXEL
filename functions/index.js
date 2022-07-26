const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.axeldb = functions.https.onRequest((request, response)=> {
     let params = request.body.queryResult.parameters;
     var stage = request.body.queryResult.parameters.estado;
     var read = request.body.queryResult.parameters.lectura;

     if (stage === "encendido" || stage === "abrir"){
     admin.database().ref(`/device/control/${params.device}`).set("1")
     .then(snapshot => {
       response.end({
        speech:
        `Ok. Iniciando el cambio de estado a ${params.estado} del dispositivo ${params.device}.¿Deseas indicar otro control?`
        });
     })
     .catch((e => {
        console.log("error: ", e);
        response.send({
            speech: "Algo ha salido mal al intentar escribir en la base de datos"
        });
      }));
    } else if (stage === "apagado" || stage === "cerrar"){
       admin.database().ref(`/device/control/${params.device}`).set("0")
     .then(snapshot => {
       response.end({
        speech:
        `Ok. Iniciando el cambio de estado a ${params.estado} del dispositivo ${params.device}.¿Deseas indicar otro control?`
        });
     })
     .catch((e => {
        console.log("error: ", e);
        response.send({
            speech: "Algo ha salido mal al intentar escribir en la base de datos"
        });
      }))
  } else if (read === "lectura" || read === "leer"){
  	var lighting = "";
  	var move = "";
  
     admin.database().ref(`/device/recolector`).on("value",snapshot =>{
         var data = snapshot.child("recolector").val();
      	 var keys = Object.entries.val(data);
      	 
      	 for(var i=0; i < keys.length; i++){
      	     var k = keys[i];
      	     var lighting = data[k].lighting;
             var move = data[k].move;
      	 }
      	 response.setHeader('Content-type','application/json');
      	 
      	 if(move > 0){
      	     return response.send(buildChatResponse(`¡Se ha detectó movimiento en el departamento`));   
      	 } else {
      	     return response.send(buildChatResponse(`¡No se ha detectado movimiento en el departamento`));   
      	 }
     },
     error => {
         console.log(error);
         
         return response.status(500).send('Ups! Ha habido un Error: '+error);
        });
    } 
});

/*
var ref = db.ref("/device/recolector");
ref.once("value", function(snapshot) {
  console.log(snapshot.val());
});*/
function buildChatResponse(chat) {
	return JSON.stringify({"fulfillmentText": chat});
}

//AIzaSyClcQGL2S2UEw58mrTjiuACtkk2xDTu9qc
