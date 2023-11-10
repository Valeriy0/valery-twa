import { TonConnectButton } from '@tonconnect/ui-react';
import { Arrow, Book, Cancel, Circle, Community, HomePage, HomePageActive, Info, Instruction, Rocket, Token, Wallet, WalletActive } from '../../assets';
import styles from "./Main.module.scss";
import Marquee from "react-fast-marquee";
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Link, Route, BrowserRouter, Routes } from "react-router-dom";
import { Address, toNano } from '@ton/core'
import { useEffect, useState } from 'react'
import MasterStore from "../../store/master/master"
import classNames from "classNames"

function Connect() {
  return (
    <div className={styles.Main}>
		<img src={Rocket} alt="" className={styles.Rocket} />
		<div className={styles.ConnectTon}>
			<div className={styles.tonConnectBtn}>
				<TonConnectButton className={styles.tonConnectBtn__btn} />
			</div>
			<div  className={styles.Instruction}>
				<img src={Instruction} alt="" />
				<h1 className={styles.Instruction__Title}>Instruction</h1>
			</div>
		</div>
	</div>
  );
}

async function GetToken() {
	const TOKEN = await MasterStore.TakeInfoToken();
	const SYMBOL = TOKEN.data.metadata.symbol;
	return Symbol;
}

function Main() {
	const [ModalBuy, setModalBuy] = useState(false);
	const [ModalSell, setModalSell] = useState(false);
	const [ModalBuyLimit, setModalBuyLimit] = useState(false);
	const [BuyMax, setBuyMax] = useState(false);
	const wallet = useTonWallet();
	const [tonConnectUI, setOptions] = useTonConnectUI();
	const [Limit, setLimit] = useState(localStorage['BuyLimit'] == null ? 10n : localStorage['BuyLimit']);
	window.Telegram.WebApp.ready();
	useEffect(() => {
		console.log(tonConnectUI.account?.address);
		async function datesInit() {
			const L = await MasterStore.GetLimit(tonConnectUI);
			console.log(12, L);
			if (L != null) {
				localStorage['BuyLimit'] = L / toNano(1);
				setLimit(L / toNano(1));
			}
		  }
		  
		  datesInit();
	  }, [])

	function BuyTokens() {
		// let cnt:bigint = toNano((document.getElementById("BuyjUSD") as HTMLInputElement).value)
		// let token = Address.parse((document.getElementById("BuyToken") as HTMLInputElement).value);
		// MasterStore.Deploy(tonConnectUI, cnt, token);
		MasterStore.Buy(tonConnectUI)
	}

	async function ConvertBuy() {
		let amount = BigInt((document.getElementById("BuyjUSD") as HTMLInputElement).value);
		(document.getElementById("BuyToken") as HTMLInputElement).value = (await MasterStore.ConvertBuy(amount)).toString();
	}

	async function ConvertSell() {
		let amount = BigInt((document.getElementById("SelljUSD") as HTMLInputElement).value);
		(document.getElementById("SellToken") as HTMLInputElement).value = (await MasterStore.ConvertSell(amount)).toString();
	}
	
	function SellTokens() {
		// let cnt:bigint = toNano((document.getElementById("BuyjUSD") as HTMLInputElement).value)
		// let token = Address.parse((document.getElementById("BuyToken") as HTMLInputElement).value);
		// MasterStore.Deploy(tonConnectUI, cnt, token);
		MasterStore.Sell(tonConnectUI)
	}
	
	
	if (wallet == null) {
		return Connect();
	}
	return (
		<>
			<div>
				<Marquee className={styles.Ticker}>
					<p className={styles.Ticker_Text}>1 tko = 18,78$</p>
					<p className={styles.Ticker_Text}>1 tko = 18,78$</p>
					<p className={styles.Ticker_Text}>1 tko = 18,78$</p>
					<p className={styles.Ticker_Text}>1 tko = 18,78$</p>
					<p className={styles.Ticker_Text}>1 tko = 18,78$</p>
					<p className={styles.Ticker_Text}>1 tko = 18,78$</p>

				</Marquee>
				<div className={styles.Balance}>
					<img src={ModalBuy || ModalSell ? WalletActive : Wallet} alt="" 
					className={ModalBuy || ModalSell ? styles.Balance_ImgActive : styles.Balance_Img} />
					<h1 className={styles.Balance_Title}>Your balance</h1> 
					<div className={styles.Balance_Token}>
						<img src={Token} alt="" />
						<h1 className={styles.Balance_TokenText}>1000 (token name)</h1>
					</div>
					<h1 className={styles.Balance_USD}>~1000 jUSD</h1>
				</div>
				<div className={styles.BuyLimit}>
					<div onClick={() => setModalBuyLimit(!ModalBuyLimit)} className={classNames(styles.cursor_pointer, styles.BuyLimit_Title)}>
						<h1 className={styles.BuyLimit_TitleText}>Token buy limit</h1>
						<img src={Info} alt="" />
					</div>
					<div className={styles.Line}>
						<div className={styles.Line__Nums}>
							<h1 className={styles.Line__NumsText}>0</h1>
							<h1 className={styles.Line__NumsText}>{Limit.toString()}</h1>
						</div>
						<div className={styles.LineHow}>
							<div className={styles.GreenLine}></div>
						</div>
					</div>
					{!BuyMax ?
					<h1 className={styles.MaxBuy}>Max buy 200 jUSD</h1>
					: <h1 className={styles.MaxBuy2}>Invite new partners<br/>or await new day limit</h1>
					}
					
				</div>
				<div className={styles.Buttons}>
					<div onClick={!BuyMax ? () => setModalBuy(!ModalBuy) : () => setModalBuy(ModalBuy)} className={classNames(styles.cursor_pointer, (!BuyMax ? styles.ButtonsBuy : styles.ButtonsBuy2))}><p>Buy</p></div>
					<div onClick={() => setModalSell(!ModalSell)} className={classNames(styles.cursor_pointer, styles.ButtonsSell)}><p>Sell</p></div>
				</div>
			</div>
			<div className={styles.Footer}>
				<Link to="/partners" className={styles.FooterButton}><img src={Community} alt="" /></Link>
				<Link to="/" className={styles.FooterButton}><div className={styles.FooterButtonActive}><img src={HomePageActive} alt="" /></div></Link>
				<Link to="/about" className={styles.FooterButton}><img src={Book} alt="" /></Link>
			</div>
			{ModalBuy ? 
			<div onClick={() => setModalBuy(!ModalBuy)} className={styles.BlackWindow}>
				<div onClick={(e) => e.stopPropagation()} className={styles.ModalWindow}>
					<div onClick={() => setModalBuy(!ModalBuy)} className={classNames(styles.cursor_pointer, styles.Cancel)}>
						<img className={styles.CancelImg} src={Circle} alt="" />
						<img className={styles.CancelImg} src={Cancel} alt="" />
					</div>
					<h1 className={styles.ModalBuyTitle}>Buy tokens</h1>
					<h1 className={styles.ModalBuyDetail}>1 token = 100jUSD</h1>
					<div className={styles.ModalBuyInputs}>
						<div className={styles.ModalBuyBlockInput}>
							<h1 className={styles.ModalBuyBlockInput_Title}>jUSD</h1>
							<input onChange={ConvertBuy} id='BuyjUSD' type="text" className={styles.ModalBuyBlockInput_Input} />
						</div>
						<div className={styles.ModalBuyBlockInput}>
							<h1 className={styles.ModalBuyBlockInput_Title}>Token</h1>
							<input id='BuyToken' disabled type="text" className={styles.ModalBuyBlockInput_Input} />
						</div>
					</div>
					<img src={Arrow} alt="" className={styles.Arrow} />
					<div onClick={BuyTokens} className={classNames(styles.cursor_pointer, styles.ModalBuyButton)}><p className={styles.ModalBuyButton_Title}>Buy</p></div>
				</div>
			</div> 
			: ""}
			{ModalSell ? 
			<div onClick={() => setModalSell(!ModalSell)} className={styles.BlackWindow}>
				<div onClick={(e) => e.stopPropagation()} className={styles.ModalWindow}>
					<div onClick={() => setModalSell(!ModalSell)} className={classNames(styles.cursor_pointer, styles.Cancel)}>
						<img className={styles.CancelImg} src={Circle} alt="" />
						<img className={styles.CancelImg} src={Cancel} alt="" />
					</div>
					<h1 className={styles.ModalSellTitle}>Buy tokens</h1>
					<h1 className={styles.ModalSellDetail}>1 token = 100jUSD</h1>
					<div className={styles.ModalSellInputs}>
						<div className={styles.ModalSellBlockInput}>
							<h1 className={styles.ModalSellBlockInput_Title}>jUSD</h1>
							<input onChange={ConvertSell} type="text" id='SelljUSD' className={styles.ModalSellBlockInput_Input} />
						</div>
						<div className={styles.ModalSellBlockInput}>
							<h1 className={styles.ModalSellBlockInput_Title}>Token</h1>
							<input type="text" id='SellToken' disabled className={styles.ModalSellBlockInput_Input} />
						</div>
					</div>
					<img src={Arrow} alt="" className={styles.Arrow} />
					<div onClick={SellTokens} className={classNames(styles.cursor_pointer, styles.ModalSellButton)}><p className={styles.ModalSellButton_Title}>Sell</p></div>
				</div>
			</div> 
			: ""}
			{ModalBuyLimit ? 
			<div onClick={() => setModalBuyLimit(!ModalBuyLimit)} className={styles.BlackWindow}>
				<div onClick={(e) => e.stopPropagation()} className={styles.ModalWindow}>
					<div onClick={() => setModalBuyLimit(!ModalBuyLimit)} className={classNames(styles.cursor_pointer, styles.Cancel)}>
						<img className={styles.CancelImg} src={Circle} alt="" />
						<img className={styles.CancelImg} src={Cancel} alt="" />
					</div>
					<h1 className={styles.ModalBuyLimitTitle}>About buy token limit</h1>
					<h1 className={styles.ModalBuyLimitText}>Reffera  l link Refferal link Refferal link Refferal link Refferal link Reff       eral link Refferal link Refferal link Reffer .  al link Refferal link Refferal link Refferal link Refferal link Refferal link Re     fferal link Refferal link Refferal link Refferal link Refferal link Ref  feral link R   efferal link Refferal link Refferal link Refferal link Refferal link </h1>
					<div onClick={() => setModalBuyLimit(!ModalBuyLimit)} className={classNames(styles.cursor_pointer, styles.ModalBuyLimitButton)}><p className={styles.ModalBuyLimitButton_Title}>Close</p></div>
				</div>
			</div> 
			: ""}
		</>
	);
  }

export default Main;
