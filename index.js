

const express = require('express');
const app = express();

let port=process.env.PORT || 3000;
app.listen(port, ()=> console.log(`listening on ${port}`));

const {WebhookClient} = require('dialogflow-fulfillment');
const axios = require('axios');
const nodemailer = require ("nodemailer");


const transporter =nodemailer.createTransport({
  service:'gmail',//Servidor a ser usado
  auth: {
    user: 'mregio2020@gmail.com',
    pass: 'bluerover2020',

  }
});




 
app.get('/', function (req, res) {
  res.send('Hello World');
});

//webhook es el nombre que se coloca despues del URL del Fullfilment den DialogFlow
app.post('/Webhook',express.json(), function (req, res) {
  const agent = new WebhookClient({ request: req , response: res });
  console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(req.body));


  //enviar email a aasesor
  function asesor(agent){

    const {name ,asunto} = agent.parameters;

      const mailOptions ={ 
      from :"Whatsapp", //sender adress
      to: "aarrenteria@gmail.com",  //list of emails
      subject: "Mensaje de Whatsapp",
      text: ` ${asunto} `,
      html: `<p> ${asunto}  </p>`

    };

    transporter.sendMail(mailOptions,function (err,info) {
      if(err){
        console.log(err);
      }
    });



  }





//sheets
function getSpreadsheetsData(){
  return axios.get('https://sheetdb.io/api/v1/2rafv5q87fudy');
}
 
function cotizar(agent) {

  
  //agent.add(`Los precios para la medida son: \n `);

  const Nombre = agent.parameters.Nombre;

  agent.add(`Los precios para la medida ${Nombre} son: \n_Efectivo(E)_  _Cheque(CH)_  _Tarjeta(TDC)_`);   
  
  //agent.add(`Los precios para la medida ${Nombre} son: \n_Efectivo(E)_  _Cheque(CH)_  _Tarjeta(TDC)_`);

  
  
  //agent.add(`          _Efectivo_   _Cheque_   _TDC_ `);

  return getSpreadsheetsData().then(res =>{

    res.data.map(person => {

      if (person.Nombre === Nombre )
      agent.add(`*${person.Marca}*"\n"${person.Precio}(E)  ${person.Cheque}(CH)  ${person.Tarjeta}(TDC)`)  


     });




     

  
    agent.add(`*Aviso* "\n" _Todos los precios incluyen el servicio de Montaje,Balanceo,Nitrogeno y Valvula nueva_ "\n"_Los precios de los productos estan sujeto a cambio sin previo aviso_"\n"_Los artículos estan sujetos a disponibilidad y/o hasta agotar existencias._"\n"_En Rines 15 y 16 en caso que lleven plomos adhesivos tendra un costo extra de *$35 pesos por llanta*_`);
    agent.add(`Que disfrute su día.🚘 Si necesita algo más, escribe *Menu.* `);

    
  });
 
  

}


  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`Esto no se deberia mandar!!!`);
  }
 

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('cotizar', cotizar);
  intentMap.set('asesor', asesor) ;

  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});

 
 
