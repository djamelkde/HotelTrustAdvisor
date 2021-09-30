
var TrustAdvisor = artifacts.require("TrustAdvisor.sol");

module.exports = function(deployer) {
  //deployer.deploy(HelloWorld);
  deployer.deploy(TrustAdvisor,{gas: 2100000});
};
