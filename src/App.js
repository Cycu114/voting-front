import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import web3 from './Utils/web3';
import api from './Api/api';
import './App.css';

export default function App() {
  const [manager, setManager] = useState();
  const [players, setPlayers] = useState();
  const [balance, setBalance] = useState();
  const [accounts, setAccounts] = useState();

  const [value, setValue] = useState(0);
  const [isManager, setIsManager] = useState(false);
  const [lotteryVisible, setLotteryVisible] = useState(false);
  const [notification, setNotification] = useState();
  const [managerNotification, setManagerNotification] = useState();

  useEffect(() => {
    const onInit = () => {
      api.getMenager().then((res) => setManager(res));
      api.getPlayers().then((res) => setPlayers(res));
      api.getBalance().then((res) => setBalance(res));
      api.getAccounts().then((res) => setAccounts(res));
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

  const onSubmit = async (event) => {
    event.preventDefault();
    if (value === 0) {
      setNotification('Prosze podać ilość etheru')
      return false
    } else if (value < 0) {
      setNotification('Ilość etheru nie może być mniejsza niż 0')
      return false
    }

    const accounts = await api.getAccounts();

    setNotification('Oczekiwanie na sukces transakcji...')

    api.enterLottery(accounts, value)
      .then(() => {
        api.getPlayers().then((res) => setPlayers(res));
        api.getBalance().then((res) => setBalance(res));
        setNotification('Dołączyłes do loterii!')
      })
      .catch(() => setNotification())
  };

  const pickWinner = async () => {
    const accounts = await api.getAccounts();

    setManagerNotification('Oczekiwanie na wybór zwycięzcy...')
    api.pickWinner(accounts).then(() =>{ 
      api.getPlayers().then((res) => setPlayers(res));
      api.getBalance().then((res) => setBalance(res));
      setManagerNotification('Zwyciezca został wybrany!')
  })
  };

  const handleInput = (event) => {
    setValue(event.target.value)
  }

  return (
    <div className="container">
      <div className="contentContainer">
        <p className="title">EthoLottery</p>
        <span className="description">
          Blockchain w swojej naturze jest bardzo odporny na próby oszustwa dlatego jest świetnym miejscem do tworzenia wszelkich gier losowych.
          Jako wielka rozproszona baza danych dostępna dla każdego wszelkie proby niechcianych działań są odrazu widoczne.
      </span>
        <hr className="customHr" />
        <div className="subContainer">
          {(players && balance) &&
            <>
              <p className="text">Obecnie {players.length} {players.length === 1 ? 'człowiek' : 'ludzi'} bierze udział w loterii.</p>
              <p className="text">Rywalizacja o wygraną {web3.utils.fromWei(balance, 'ether')} etheru!</p>
            </>
          }
          {!lotteryVisible ?
            <>
              <p className="questionText"> Chcesz spóbować szczęścia?</p>
              <button
                onClick={() => { setLotteryVisible(true) }}
                className="button">
                Spróbuj szczęścia
            </button>
            </> :
            <div className="inputContainer">
              <p className="inputText">Ilość eteru wysyłana do loterii</p>
              <div className="inputSubContainer">
                <input type='number' className="input" value={value} onChange={handleInput} />
                <button
                  onClick={onSubmit}
                  className="lotteryButton">
                  Dołącz
              </button>
              </div>
              {notification && <p className="notification">{notification}</p>}
            </div>
          }
        </div>
        {isManager &&
          <>
            <hr className="menagerHr" />
            <div className="subContainer">
              <p className="text">Gotowy wybrać zwycięzcę?</p>
              <button
                className="button"
                onClick={pickWinner}>
                Wybierz zwycięzce
              </button>
              {managerNotification && <p className="notification">{managerNotification}</p>}
            </div>
          </>
        }
      </div>
      {manager && <p className="footer"> Kontrakt jest zarządzany przez: {manager}.</p>}
    </div>
  )
}