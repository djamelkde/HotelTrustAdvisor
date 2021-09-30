pragma solidity ^0.4.18;
// written for Solidity version 0.4.18 and above that doesnt break functionality

contract TrustAdvisor {
    
    event AddedServiceProvider(uint providerID);
    event AddedService(uint serviceID);

    struct Client {
		bytes32 name;
        bytes32 uid; // bytes32 type are basically strings
        uint candidateIDVote;
    }
    // describes a Service provider
    struct Provider {
		uint idsprovider;
        bytes32 name;
        bytes32 website;
        bytes32 pathimg;
    }
    
    struct Service{
		uint idService;
		bytes32 name;
		bytes32 description;
    }
    
    struct Recommendation {
		uint timestamp;
		uint idClient;
		uint idProvider;
		uint idService;
		uint evaluation;
    }
    
    struct TrustScore {
		mapping (uint => uint) trustByProvider;
    }
    
    uint numSProviders;
    uint numClients;
    uint numServices;  
	uint numRecommendations;
	
    mapping (uint => Provider) providers;
    mapping (uint => Client) clients;
    mapping (uint => Service) services;
    mapping (uint => Recommendation) recommendations;
    //for each service (uint id), we match the trust of all the providers
    mapping (uint => TrustScore) trustScores;
    
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     *  These functions perform transactions, editing the mappings *
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    function addProvider(uint id, bytes32 name, bytes32 website, bytes32 pathimg) public {
        uint providerID = numSProviders++;
        providers[providerID] = Provider(id,name,website,pathimg);
        AddedServiceProvider(providerID);
    }
    
    function addService(bytes32 name, uint id, bytes32 description) public {
        uint serviceID = numServices++;
        services[serviceID] = Service(id, name, description);
        AddedService(serviceID);
    }

    function updateTrustOf(uint providerID, uint serviceID) public{
		uint score=0;
		uint nb=0;
		for(uint i = 0; i < numRecommendations; i++){
			if(recommendations[i].idService == serviceID && recommendations[i].idProvider == providerID){
				nb++;
				score = score + recommendations[i].evaluation;
			}
		}
		if(nb != 0) score = score/nb;
		trustScores[serviceID].trustByProvider[providerID]=score;
    }
    
	function sendRecommendation(uint idClient, uint idProvider, uint evaluation, uint idService, uint timestamp) public{
		uint idRecommendation = numRecommendations++;
		recommendations[idRecommendation] = Recommendation(timestamp, idClient, idProvider, idService, evaluation);
		//update the trust of the service provider.
		updateTrustOf(idProvider, idService);
	}

    /* * * * * * * * * * * * * * * * * * * * * * * * * * 
     *  Getter Functions, marked by the key word "view" *
     * * * * * * * * * * * * * * * * * * * * * * * * * */
    
    function getNumOfProviders() public view returns (uint) {
        return numSProviders;
    }
    
    function getNumOfServices() public view returns (uint) {
        return numServices;
    }

    function getNumOfClients() public view returns (uint) {
        return numClients;
    }
    // returns provider information, including its ID, name
    function getProvider(uint providerID) public view returns (uint,bytes32, bytes32, bytes32) {
        return (providers[providerID].idsprovider, providers[providerID].name, providers[providerID].website, providers[providerID].pathimg);
    }
    
    // returns service information, including its ID, name
    function getService(uint serviceID) public view returns (uint,bytes32) {
        return (services[serviceID].idService,services[serviceID].name);
    }
    
    function trustScoreOf(uint providerID, uint serviceID) view public returns (uint) {
		return trustScores[serviceID].trustByProvider[providerID];
    }
}
