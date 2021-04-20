import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import web3 from './Utils/web3';
import api from './Api/api';
import './App.css';

export default function App() {
  const [manager, setManager] = useState();
  const [accounts, setAccounts] = useState();

  const [proposalArray, setProposalArray] = useState([]);
  const [newProposal, setNewProposal] = useState('');

  const [isManager, setIsManager] = useState(false);
  const [notification, setNotification] = useState();

  useEffect(() => {
    const onInit = () => {
      api.getManager().then((res) => setManager(res));
      api.getAccounts().then((res) => setAccounts(res));
      api.getProposals().then((res) => {
        setProposalArray(res)
      });
    }

    const ethEnabled = () => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        window.ethereum.enable();
        return true;
      }
      return false;
    }

    onInit()
    ethEnabled()
  }, []);

  useEffect(() => {
    const checkIfManager = () => {
      let isManager = false

      accounts.forEach(account => {
        if (account === manager) {
          isManager = true
        }
      });

      setIsManager(isManager)
    }

    accounts && checkIfManager()
  }, [accounts, manager]);

  const addProposal = (newProposal) => {
    if (newProposal) {
      const newProposalObj = {
        name: newProposal,
        voteCount: 0,
      }

      setProposalArray([...proposalArray, newProposalObj])
      setNewProposal('')
    }
  }

  const removeOption = (optionToRemove) => {
    let tempArray = {}
    tempArray = proposalArray.filter((option) => {
      return optionToRemove !== option
    })

    setProposalArray(tempArray)
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    const accounts = await api.getAccounts();
    setNotification('Oczekiwanie na dodanie opcji wyboru...')

    const stringProposalArray = proposalArrayToStringArray()

    api.addProposalNames(accounts, stringProposalArray)
      .then(() => {
        setNotification('Dodawanie opcji wyboru się powiodło!')
      })
      .catch(() => setNotification())
  }

  const proposalArrayToStringArray = () => {
    const stringArray = []
    proposalArray.map((proposal) => {
      stringArray.push(proposal.name)
    })

    return stringArray;
  }

  const voteOnProposal = async (proposal) => {
    const accounts = await api.getAccounts();

    setNotification('Oczekiwanie na wysłanie głosu...')

    api.vote(accounts, 0)
      .then(() => {
        setNotification('Wysłanie głosu powiodło się!')
      })
      .catch(() => setNotification('Wystąpił błąd przy wysyłaniu głosu'))
  }

  return (
    <div className="container">
      { <div className="contentContainer">
        <h1 className="appName">Voting</h1>
        <h1 className="title">Tytuł</h1>
        <span className="description">Description</span>
        {isManager ?
          <div className="managerContainer">
            <h2 className="subTitle">Dodawanie nowych opcji głosowania</h2>
            <ul>
              {proposalArray.map((option, index) => {
                return (
                  <li className="proposalContainer">
                    <p id={index}>Opcja {index + 1}: {option.name}</p>
                    <button className="proposalButton" onClick={() => removeOption(option)}>-</button>
                  </li>
                )
              })}
            </ul>

            <div className="proposalInputContainer">
              <input
                className="proposalInput"
                placeholder="Opcja głosowania"
                type="text"
                value={newProposal}
                onChange={(e) => setNewProposal(e.target.value)} />
              <button className="proposalButton" onClick={() => addProposal(newProposal)}>+</button>
            </div>

            <button className="submitButton" onClick={onSubmit}>Dodaj</button>
            {notification}
          </div> :
          <div>
            <h2 className="subTitle">Opcje głosowania</h2>
            <ul>
              {proposalArray.map((proposal, index) => {
                return (
                  <li className="proposalContainer">
                    <p className="proposalBox" onClick={() => { voteOnProposal(proposal) }} id={index}>{proposal.name}</p>
                  </li>
                )
              })}
            </ul>
          </div>
        }
      </div> }
      {manager && <p className="footer"> Kontrakt jest zarządzany przez: {manager}.</p>}
    </div>
  )
}