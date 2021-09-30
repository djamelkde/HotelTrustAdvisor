
import "../css/agency.css"

import { default as Web3} from "web3"
import { default as contract } from "truffle-contract"

// get build artifacts from compiled smart contract and create the truffle contract
import trustAdvisorArtifacts from "../../build/contracts/TrustAdvisor.json"
var TrustAdvisorContract = contract(trustAdvisorArtifacts)

/*
 * This holds all the functions for the app
 */
window.App = {
  // called when web3 is set up
  start: function() { 
    //console.log("Start function");
    //window.providerNames = [];
    window.providerImgs = ["https://t-ec.bstatic.com/images/hotel/max1280x900/746/74640348.jpg", "https://s-ec.bstatic.com/images/hotel/max1280x900/917/91758743.jpg", 
							"https://t-ec.bstatic.com/images/hotel/max1280x900/398/39823370.jpg", "https://t-ec.bstatic.com/images/hotel/max1280x900/154/154182976.jpg",
							"https://s-ec.bstatic.com/images/hotel/max1280x900/874/8749223.jpg", "https://s-ec.bstatic.com/images/hotel/max1280x900/135/135816818.jpg",
							"https://t-ec.bstatic.com/images/hotel/max1280x900/148/148361874.jpg", "https://t-ec.bstatic.com/images/hotel/max1024x768/155/155081605.jpg"];
	window.pathToBC = "http://127.0.0.1:8000/#/transaction/";
    TrustAdvisorContract.setProvider(window.web3.currentProvider)
    TrustAdvisorContract.defaults({from: window.web3.eth.accounts[0],gas:2100000,})

    TrustAdvisorContract.deployed().then(function(instance){
      instance.getNumOfProviders().then(function(numOfProviders){
        // adds providers to Contract if there aren't any
        if (numOfProviders == 0){
		  console.log("No provider");
		  instance.addProvider(0, "Campanile Lyon Centre - Berges du Rhône", "#", "https://t-ec.bstatic.com/images/hotel/max1280x900/746/74640348.jpg").then(function(result){ 
			  var o1 = new Option("Campanile Lyon Centre - Berges du Rhône", "Campanile Lyon Centre - Berges du Rhône");
			  $(o1).html("Campanile Lyon Centre - Berges du Rhône");
			  $("#selectProviders").append(o1);
          })
          instance.addProvider(1,"Novotel Lyon Gerland Musée des Confluences" ,"#", "https://s-ec.bstatic.com/images/hotel/max1280x900/917/91758743.jpg").then(function(result){
				var o2 = new Option("Novotel Lyon Gerland Musée des Confluences", "Novotel Lyon Gerland Musée des Confluences");
				$(o2).html("Novotel Lyon Gerland Musée des Confluences");
				$("#selectProviders").append(o2);
          })
          // the global variable will take the value of this variable
          numOfProviders = 2 
        }
        else { // if candidates were already added to the contract we loop through them and display them
		  console.log("There are providers");
          for (var i = 0; i < numOfProviders; i++ ){
            // gets providers and displays the
            instance.getProvider(i).then(function(data){
			  var o = new Option(window.web3.toAscii(data[1]), window.web3.toAscii(data[1]));
			  $(o).html(window.web3.toAscii(data[1]));
			  $(o).attr( "id", data[0].toNumber().toString());
			  $("#selectProviders").append(o);
			  $("#sp"+(i+1).toString()+" .thumbnail .centered").html(window.web3.toAscii(data[1]));
            })
          }
        }
        window.numOfProviders = numOfProviders 
      });
      instance.getNumOfServices().then(function(numOfServices){
		console.log("Function executed");
        // adds providers to Contract if there aren't any
        if (numOfServices == 0){
		  console.log("No Service");
		  instance.addService("Logement",0,"Logement").then(function(result){ 
			  
          })
          
          // the global variable will take the value of this variable
          numOfServices = 1 
        }
        window.numOfServices = numOfServices 
        window.idClient = 0;
        window.timeStamp = 0;
        window.App.topServiceProviders();
      })
      
    }).catch(function(err){ 
      console.error("ERROR! " + err.message)
    })
  },

  // Function that is called when user clicks the "vote" button
  evaluateService: function() {
    
	
    // Application Logic 
    
	var val1 = $("#selectProviders").val();
	
	var idProvider = $("#selectProviders").children(":selected").attr("id");
	
	console.log("id = "+idProvider);
	/*var val2 = $('#selectServices').val();
	var idService = parseInt(val2.substr(val2.length - 1))-1;*/
	var idService = 0;
	var idClient = 0;
	
	var elements =  $("i");
	var nb = elements.length;
	var score = nb;
	for(var i=0; i<nb; i++){
		if(elements[i].getAttribute("class").includes("fa-star-o")) score--;
	}
	score = (score*100)/nb;
	console.log("idP = "+idProvider.toString()+" idService = "+idService.toString()+" nbElt = "+nb.toString()+" score = "+score.toString());
    
    TrustAdvisorContract.deployed().then(function(instance){
      instance.sendRecommendation(window.idClient++,idProvider, score, idService, window.timeStamp++).then(function(result){
        //window.alert("Transaction Tx: '"+result.tx+"' is already inserted into the blockchain")
        $('#txModal .modal-body h5 a').attr("href",window.pathToBC+result.tx);
        $('#txModal .modal-body h5 a').html(result.tx);
        $('#txModal').modal('toggle');
        window.App.topServiceProviders()
        //$.alert("Evaluation done","Transaction Tx is already done into blockchain");
      })
    }).catch(function(err){ 
      console.error("ERROR! " + err.message)
    })
  },
  
  // function called when the "Count Votes" button is clicked
   topServiceProviders: function() {
	console.log("top providers");
    TrustAdvisorContract.deployed().then(function(instance){
	  
	  var promiseScores = [];
	  for(var n = 0; n < window.numOfProviders; n++){
		    //instance.trustScoreOf(n,0).then(function(data){val2=data.toNumber();});
		    promiseScores.push(instance.trustScoreOf(n,0));
		    //promiseNames.push(instance.getProvider(n));
		    
	  }
	  console.log("length-promises= "+promiseScores.length.toString());
	  Promise.all(promiseScores).then(function(data){
			
			var maxElmts = 6;
			var topSpIds=[]; //= [0,1,2,3,4,5,6,7];
			var scores = [];
			var val;
			for(var i = 0; i < data.length; i++){
				//
				scores.push(data[i].toNumber());
				topSpIds.push(i);
			}
			// sort scores
			for(var i = 0; i< scores.length-1; i++){
				for( var j = i+1 ; j < scores.length; j++){
					if(scores[i] < scores[j]){
						val = scores[i]; scores[i] = scores[j]; scores[j]=val;
						val = topSpIds[i]; topSpIds[i] = topSpIds[j]; topSpIds[j]=val;
					}
				}
			}
			// display forted IDs and scores:
			for(var i = 0; i < scores.length; i++){
				console.log(topSpIds[i].toString()+" ===> "+scores[i].toString());
			}
			
			// update the content of top service providers.
			for (var i = 0; i < window.numOfProviders && i<maxElmts; i++){
				$("#img"+(i+1).toString()).attr("src",  providerImgs[topSpIds[i]]);
				$("#sp"+(i+1).toString()+" .thumbnail .top-right").html(scores[i]/10.);
				instance.getProvider(topSpIds[i]).then(function(data){
						console.log(window.web3.toAscii(data[1]));
						console.log((data[0].toNumber()+1).toString());
						//console.log($("#sp"+(data[0].toNumber()+1).toString()+" .thumbnail .centered"));
						$("#sp"+(data[0].toNumber()+1).toString()+" .thumbnail .centered").html(window.web3.toAscii(data[1]));
				});
			}
	  });
	  
    });
  }
}

window.addEventListener("load", function() {
  // Is there an injected web3 instance?
  if (typeof web3 !== "undefined") {
    console.warn("Using web3 detected from external source like Metamask")
    // If there is a web3 instance(in Mist/Metamask), then we use its provider to create our web3object
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask")
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
  }
  window.name="Hello word !";
  // initializing the App
  window.App.start()
})

