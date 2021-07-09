import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import api from './Api/api';
import './App.css';

export default function App() {
  const [manager, setManager] = useState();
  const [accounts, setAccounts] = useState();

  const [proposalArray, setProposalArray] = useState([]);
  const [newProposal, setNewProposal] = useState('');
  const [winner, setWinner] = useState();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [isManager, setIsManager] = useState(false);
  const [isPollClosed, setIsPollClosed] = useState(false);
  const [adresToDelegate, setAdresToDelegate] = useState('');
  const [section, setSection] = useState('poll');
  const [notification, setNotification] = useState();

  useEffect(() => {
    const onInit = () => {
      api.getManager().then((res) => setManager(res));
      api.getAccounts().then((res) => setAccounts(res));
      api.getProposals().then((res) => setProposalArray(res));
      api.getPollName().then((res) => setTitle(res));
      api.getPollDescription().then((res) => setDescription(res));
      api.isPollClosed().then(res => {
        setIsPollClosed(res)
        api.getWinnerProposalName().then(res => setWinner(res))
      })

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

      if (isManager) {
        setSection('options')
      }

      setIsManager(isManager)
    }

    accounts && checkIfManager()
  }, [accounts, manager]);

  const addProposal = () => {
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

  const onOptionSubmit = async (e) => {
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
    if (isPollClosed) {
      return
    }
    const accounts = await api.getAccounts();

    setNotification('Oczekiwanie na wysłanie głosu...')

    api.vote(accounts, proposal.id)
      .then(() => {
        setNotification('Wysłanie głosu powiodło się!')
        api.getProposals().then((res) => setProposalArray(res));
      })
      .catch(() => setNotification('Wystąpił błąd przy wysyłaniu głosu'))
  }

  const onPollSubmit = async () => {
    const accounts = await api.getAccounts();

    setNotification('Oczekiwanie na zapisanie głosowania...');

    api.setTitleAndDescription(accounts, [title, description])
      .then(() => {
        setNotification('Zapisywanie głosowania powiodło się!');
        setTitle('');
        setDescription('');
      })
      .catch(() => setNotification('Wystąpił błąd przy zapisywaniu głosowania'));
  }

  const endPoll = async () => {
    const accounts = await api.getAccounts();

    setNotification('Oczekiwanie na zamknięcie głosowania...')

    await api.finalizePoll(accounts).then(() => {
      setNotification('Zamknięcie głosowania powiodło się!')
    })
      .catch(() => setNotification('Wystąpił błąd przy zamykaniu głosowania'));
  }

  const clearPoll = async () => {
    const accounts = await api.getAccounts();

    setNotification('Oczekiwanie na wyczyszczenie głosowania...')

    api.clearData(accounts).then(() => {
      setNotification('Czyszczenie głosowanie powiodło się!')
    })
      .catch(() => setNotification('Wystąpił błąd przy czyszczeniu głosowania'));
  }

  const chooseSection = (newSection) => {
    if (newSection !== section) {
      setSection(newSection)
    }
  }

  return (
    <div className="container">
      <div className="contentContainer">
        {isManager &&
          <div className="navButtonContainer">
            <button className="button" onClick={() => chooseSection('options')}>
              Ustawienia
            </button>
            <button className="button" onClick={() => chooseSection('pollOptions')}>
              Ustawienia opcji
            </button>
            <button className="button" onClick={() => chooseSection('poll')}>
              Głosowanie
            </button>
          </div>
        }
        <h1 className="title">Voting</h1>
        <div className="managerContainer">
          {section === 'options' &&
            <div className="sectionContainer">
              <h2 className="sectionTitle">Ustawienia głosowania</h2>
              <input
                placeholder='Nazwa głosowania'
                className="textInput"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)} />

              <textarea
                placeholder='Opis głosowania'
                className="textAreaInput"
                value={description}
                onChange={e => setDescription(e.target.value)} />

              <button className="button" onClick={onPollSubmit}>Zapisz</button>
            </div>
          }

          {section === 'pollOptions' &&
            <div className="sectionContainer">
              <h2 className="sectionTitle">Dodawanie nowych opcji głosowania</h2>
              <ul className="proposalList">
                {proposalArray.map((option, index) => {
                  return (
                    <li id={index} className="proposalContainer">
                      <p className="proposalBox">Opcja {index + 1}: {option.name}</p>
                      <button className="proposalButton" onClick={() => removeOption(option)}>-</button>
                    </li>
                  )
                })}
              </ul>
              <div className="newProposalContainer">
                <input
                  className="textInput"
                  placeholder="Opcja głosowania"
                  type="text"
                  value={newProposal}
                  onChange={(e) => setNewProposal(e.target.value)} />
                <button className="proposalButton" onClick={() => addProposal()}>+</button>
              </div>

              <button className="button" onClick={onOptionSubmit}>Zapisz opcje</button>
            </div>
          }
          {(isManager && section !== 'poll') &&
            <div className="bottomButtonContainer">
              <button className="button" onClick={endPoll}>Zakończ głosowanie</button>
              <button className="button" onClick={clearPoll}>Wyczyść głosowanie</button>
            </div>
          }
        </div>

        {section === 'poll' &&
          <div className="sectionContainer">
            <h1>{title}</h1>
            <span className="description">{description}</span>
            <h2 className="sectionTitle">Opcje głosowania</h2>
            <ul className="proposalList">
              {proposalArray.map((proposal, index) => {
                return (
                  <li key={index} className="proposalContainer" onClick={() => { voteOnProposal(proposal) }} >
                    <p className="proposalBox">{proposal.name}</p>
                    <p className="voteCount">{proposal.voteCount} {proposal.voteCount.length < 2 ? 'głos' : 'głosy'}</p>
                  </li>
                )
              })}
            </ul>
            {isPollClosed && <p>Zwyciężył głos: {winner}</p>}
            {!isPollClosed &&
              <div className="delegateVoteContainer">
                <p>Chcesz oddać swój głos zaufanej osobie ?</p>
                <div className="delegateVoteSubContainer">
                  <input className="textInput" placeholder="Adres osoby której chcesz oddać głos" type="text" value={adresToDelegate} onChange={e => setAdresToDelegate(e.target.value)} />
                  <button className="button">Przekaż</button>
                </div>
              </div>
            }
          </div>
        }
        {notification}
      </div>
      { manager && <p className="footer"> Kontrakt jest zarządzany przez: {manager}.</p>}
    </div >
  )
}