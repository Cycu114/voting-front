import voting from '../Utils/voting';
import web3 from '../Utils/web3';

class ApiServce {
  getMenager() {
    return voting.methods.manager().call();
  }

  getProposals() {
    return voting.methods.getProposals().call()
  }

  getBalance() {
    return web3.eth.getBalance(voting.options.address)
  }

  getAccounts() {
    return web3.eth.getAccounts()
  }

  getProposalThatWin(){
    return voting.methods.proposalThatWin().call()
  }

  getWinnerProposalName(){
    return voting.methods.winnerProposalName().call()
  }

  addProposalNames(accounts, proposalNames) {
    return voting.methods.addProposalNames(proposalNames).send(
      {
        from: accounts[0]
      }
    );
  }

  clearData(accounts) {
    return voting.methods.clearData().send(
      {
        from: accounts[0]
      }
    );
  }

  delegate(accounts, address) {
    return voting.methods.delegate(address).send(
      {
        from: accounts[0]
      }
    );
  }

  vote(accounts, index) {
    return voting.methods.vote(index).send(
      {
        from: accounts[0]
      }
    );
  }

}

const api = new ApiServce();
export default api;
