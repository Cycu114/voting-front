import voting from '../Utils/voting';
import web3 from '../Utils/web3';

const gasPrice = 10000000000;
class ApiServce {
  getManager() {
    return voting.methods.manager().call();
  }

  getAccounts() {
    return web3.eth.getAccounts()
  }

  getProposals() {
    return voting.methods.getProposals().call()
  }

  setTitleAndDescription(accounts, request) {
    return voting.methods.setVotingNameDescription(request).send({
      from: accounts[0],
      gasPrice: gasPrice
    })
  }

  getWinnerProposalName() {
    return voting.methods.winnerProposalName().call()
  }

  addProposalNames(accounts, proposalNames) {
    return voting.methods.addProposalNames(proposalNames).send({
      from: accounts[0],
      gasPrice: gasPrice
    });
  }

  clearData(accounts) {
    return voting.methods.clearData().send({
      from: accounts[0],
      gasPrice: gasPrice
    });
  }

  delegate(accounts, address) {
    return voting.methods.delegate(address).send({
      from: accounts[0],
      gasPrice: gasPrice
    });
  }

  vote(accounts, id) {
    return voting.methods.vote(id).send({
      from: accounts[0],
      gasPrice: gasPrice
    });
  }

  finalizePoll(accounts) {
    return voting.methods.closeVoting().send({
      from: accounts[0],
      gasPrice: gasPrice
    });
  }

  isPollClosed() {
    return voting.methods.finished().call()
  }

  getPollName() {
    return voting.methods.votingName().call()
  }

  getPollDescription() {
    return voting.methods.votingDescription().call()
  }
}

const api = new ApiServce();
export default api;
