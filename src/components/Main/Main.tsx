import { TonConnectButton, useIsConnectionRestored, useTonAddress } from '@tonconnect/ui-react';
import { Arrow, Book, Cancel, Circle, Community, Exit, HomePage, HomePageActive, Info, Instruction, Rocket, Token, Wallet, WalletActive } from '../../assets';
import styles from "./Main.module.scss";
import Marquee from "react-fast-marquee";
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Link, Route, BrowserRouter, Routes } from "react-router-dom";
import { Address, toNano } from '@ton/core'
import { useEffect, useState } from 'react'
import MasterStore from "../../store/master/master"
import Links from '../../store/links/links';
import { TonClient } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { Master } from '../../wrappers/Master';
import classNames from "classNames"
import { BACKEND } from '../../constants'

function Main() {
	const [ModalBuy, setModalBuy] = useState(false);
	const userFriendlyAddress = useTonAddress();
	const [ModalSell, setModalSell] = useState(false);
	const [OneToken, setOneToken] = useState(localStorage['OneToken'] == null ? 0.1 : localStorage['OneToken']);
	const [Balance, setBalance] = useState(localStorage['Balance'] == null ? 0n : localStorage['Balance']);
	const [BalanceUSD, setBalanceUSD] = useState(localStorage['BalanceUSD'] == null ? 0n : localStorage['BalanceUSD']);
	const [ModalBuyLimit, setModalBuyLimit] = useState(false);
	const [BuyMax, setBuyMax] = useState(false);
	const [AppearGreen, setAppearGreen] = useState(localStorage['AppearGreen'] == null ? false : localStorage['AppearGreen']);
	const [BuyMaxLimit, setBuyMaxLimit] = useState(localStorage['BuyMaxLimit'] == null ? 10n : localStorage['BuyMaxLimit']);
	const [tonConnectUI, setOptions] = useTonConnectUI();
	tonConnectUI.setConnectRequestParameters(null);
	const [Limit, setLimit] = useState(localStorage['Limit'] == null ? 10n : localStorage['Limit']);
	const [Can, setCan] = useState(true);
	const connectionRestored = useIsConnectionRestored();
	window.Telegram.WebApp.expand();
	window.Telegram.WebApp.ready();
	if (tonConnectUI.account?.address != null) {
		FindAllInformation();
		try {
			let xhr = new XMLHttpRequest();
			xhr.open("POST", BACKEND);
			xhr.send("@" + tonConnectUI.account?.address + "," + window.Telegram.WebApp.initDataUnsafe.user.id.toString()); 
		} catch {}
	}

	useEffect(() => {
		async function Balances() {
			setBalance(await MasterStore.GetBalance(tonConnectUI));
			localStorage["Balance"] = await Balance;
			setOneToken(parseInt(await (await MasterStore.ConvertSell(toNano(1))).toString()) / parseInt(toNano(1).toString()));
			localStorage["OneToken"] = await OneToken;
			setBalanceUSD(await MasterStore.GetBalanceUSD(tonConnectUI));
			localStorage["BalanceUSD"] = await BalanceUSD;
			await GreenLineF();
		}

		Balances();
		setInterval(async () => {
			await Balances()
		}, 10000);
		
	}, [])

	async function GreenLineF() {
		const TempBuyMaxLimit = (await MasterStore.MaxBuyLimit(tonConnectUI));
		setBuyMaxLimit(TempBuyMaxLimit);
		localStorage["BuyMaxLimit"] = TempBuyMaxLimit;
		const L = await MasterStore.GetLimit(tonConnectUI) / toNano(1);
		setLimit(L);
		localStorage["Limit"] = L;
		if (L == 0n) {
			setBuyMax(true);
		} else {
			if (typeof L == "bigint") {
				const t = document.getElementById("GreenLine");
				const Width = 295 * (parseInt((BigInt(TempBuyMaxLimit) - L).toString()) / parseInt(TempBuyMaxLimit.toString()));
				if (t != null) {
					t.setAttribute('style', `z-index: 0; position: absolute; left: -${Width}px; width: ${Width}px; transition: 0.8s; transform:translateX(${Width}px) translateY(0px) translateZ(0px);`);
				}
			}
		}
		setBalance(await MasterStore.GetBalance(tonConnectUI));
		localStorage["Balance"] = await Balance;
		setOneToken(parseInt(await (await MasterStore.ConvertSell(toNano(1))).toString()) / parseInt(toNano(1).toString()));
		localStorage["OneToken"] = await OneToken;
		setBalanceUSD(await MasterStore.GetBalanceUSD(tonConnectUI));
		localStorage["BalanceUSD"] = await BalanceUSD;
	}

	async function FindAllInformation() {
		if (!Can) return;
		setCan(false);
		await GreenLineF();
	}  


	async function BuyTokens() {
		let xhr = new XMLHttpRequest();
		let take = false;
		function NotRefer() {
			if (take) return;
			let cnt:bigint = toNano((document.getElementById("BuyjUSD") as HTMLInputElement).value)
			MasterStore.Buy(tonConnectUI, cnt)
		}
		try {
			xhr.open("POST", BACKEND);
			// xhr.send("1191496245");
			xhr.send(window.Telegram.WebApp.initDataUnsafe.user.id.toString()); // window.Telegram.WebAppUser.id
			NotRefer();
			xhr.onreadystatechange = function() {
				take = true;
				try {
					const Adrs = xhr.responseText;
					Address.parse(Adrs);
					if (Adrs == '-1') {
						let cnt:bigint = toNano((document.getElementById("BuyjUSD") as HTMLInputElement).value)
						MasterStore.Buy(tonConnectUI, cnt)
					} else {
						let cnt:bigint = toNano((document.getElementById("BuyjUSD") as HTMLInputElement).value)
						MasterStore.BuyRefer(tonConnectUI, cnt, Address.parse(Adrs))
					}
				} catch {
					let cnt:bigint = toNano((document.getElementById("BuyjUSD") as HTMLInputElement).value)
					MasterStore.Buy(tonConnectUI, cnt)
				}
			}
			xhr.onerror = function() {
				take = true;
				let cnt:bigint = toNano((document.getElementById("BuyjUSD") as HTMLInputElement).value)
				MasterStore.Buy(tonConnectUI, cnt)
			}
			xhr.ontimeout = function() {
				take = true;
				let cnt:bigint = toNano((document.getElementById("BuyjUSD") as HTMLInputElement).value)
				MasterStore.Buy(tonConnectUI, cnt)
			}
		} catch {
			let cnt:bigint = toNano((document.getElementById("BuyjUSD") as HTMLInputElement).value)
			MasterStore.Buy(tonConnectUI, cnt)
		}
		setModalBuy(!ModalBuy);
		// Новые данные
		const endpoint = await getHttpEndpoint(); 
		const client = new TonClient({
			endpoint
		});
		const MasterContact = client.open(Master.createFromAddress(Address.parse(MasterStore.MasterAddress)));
		let Trans = await client.getTransactions(MasterContact.address, {limit: 1});
		let approved = false;
		while (!approved) {
			let NewTrans = await client.getTransactions(MasterContact.address, {limit: 1});
			if (NewTrans[0].prevTransactionLt != Trans[0].prevTransactionLt) {
				approved = true;
				break;
			}
		}
		await GreenLineF();
	}

	async function ConvertBuy() {
		try {
			let amount = toNano((document.getElementById("BuyjUSD") as HTMLInputElement).value);
			if (amount > toNano(BalanceUSD)) {
				document.getElementById("InvalidBuy")?.classList.remove('hidden');
				return;
			}
			(document.getElementById("BuyToken") as HTMLInputElement).value = (parseInt(await (await MasterStore.ConvertBuy(amount)).toString()) / parseInt(toNano(1).toString())).toString();
			document.getElementById("InvalidBuy")?.classList.add('hidden');
		} catch {
			document.getElementById("InvalidBuy")?.classList.remove('hidden');
		}
		setBalanceUSD(await MasterStore.GetBalanceUSD(tonConnectUI));
	}

	async function ConvertSell() {
		try {
			let amount = toNano((document.getElementById("SelljUSD") as HTMLInputElement).value);
			if (amount > toNano(Balance)) {
				document.getElementById("InvalidSell")?.classList.remove('hidden');
				return;
			}
			(document.getElementById("SellToken") as HTMLInputElement).value = (parseInt(await (await MasterStore.ConvertSell(amount)).toString()) / parseInt(toNano(1).toString())).toString();
			document.getElementById("InvalidSell")?.classList.add('hidden');
		} catch {
			document.getElementById("InvalidSell")?.classList.remove('hidden');
		}
	}
	
	async function SellTokens() {
		let cnt:bigint = toNano((document.getElementById("SelljUSD") as HTMLInputElement).value)
		MasterStore.Sell(tonConnectUI, cnt)
		setModalSell(!ModalSell);
		// Новые данные
		const endpoint = await getHttpEndpoint(); 
		const client = new TonClient({
			endpoint
		});
		const MasterContact = client.open(Master.createFromAddress(Address.parse(MasterStore.MasterAddress)));
		let Trans = await client.getTransactions(MasterContact.address, {limit: 1});
		let approved = false;
		while (!approved) {
			let NewTrans = await client.getTransactions(MasterContact.address, {limit: 1});
			if (NewTrans[0].prevTransactionLt != Trans[0].prevTransactionLt) {
				approved = true;
				break;
			}
		}
		setBalance(await MasterStore.GetBalance(tonConnectUI));
		localStorage["Balance"] = await Balance;
		setBalanceUSD(await MasterStore.GetBalanceUSD(tonConnectUI));
		localStorage["BalanceUSD"] = await BalanceUSD;
		setOneToken(parseInt(await (await MasterStore.ConvertSell(toNano(1))).toString()) / parseInt(toNano(1).toString()));
		localStorage["OneToken"] = await OneToken;
	}

	async function ButtonBuyMax() {
		(document.getElementById("BuyjUSD") as HTMLInputElement).value = (Math.min(parseInt(BalanceUSD.toString()), parseInt(Limit.toString()))).toString();
		await ConvertBuy();
		setBalanceUSD(await MasterStore.GetBalanceUSD(tonConnectUI));
	}

	function ButtonSellMax() {
		(document.getElementById("SelljUSD") as HTMLInputElement).value = Balance.toString();
		(document.getElementById("SellToken") as HTMLInputElement).value = (parseInt(Balance.toString()) * OneToken).toString();
	}
	return (
		<div id='Main' className=''>
			<div>
				<img src={Exit} alt="" className={styles.Exit} onClick={() => tonConnectUI.disconnect()} />
				<div className={styles.Balance}>
					<img src={ModalBuy || ModalSell ? WalletActive : Wallet} alt="" 
					className={ModalBuy || ModalSell ? styles.Balance_ImgActive : styles.Balance_Img} />
					<h1 className={styles.Balance_Title}>Your balance ({tonConnectUI.account?.address != null ? Address.parse(tonConnectUI.account?.address).toString().slice(0, 4) + "..." + Address.parse(tonConnectUI.account?.address).toString().slice(-4) : ""})</h1>
					
					<div className={styles.Balance_Token}>
						<img src={Token} alt="" />
						<h1 id='BalanceToken' className={styles.Balance_TokenText}>{Balance.toString()} (token name)</h1>
					</div>
					<h1 className={styles.Balance_USD}>~{(parseInt(Balance.toString()) * OneToken).toString()} jUSD</h1>
				</div>
				<div className={styles.BuyLimit}>
					<div onClick={() => setModalBuyLimit(!ModalBuyLimit)} className={classNames(styles.cursor_pointer, styles.BuyLimit_Title)}>
						<h1 className={styles.BuyLimit_TitleText}>Token buy limit</h1>
						<img src={Info} alt="" />
					</div>
					<div className={styles.Line}>
						<div className={styles.Line__Nums}>
							<h1 className={styles.Line__NumsText}>0</h1>
							<h1 id="BuyMaxLimit" className={styles.Line__NumsText}>{BuyMaxLimit.toString()}</h1>
						</div>
						<div className={styles.LineHow}>
							<div id="GreenLine" className={styles.GreenLine}></div>
						</div>
					</div>
					{!BuyMax ?
					<h1 className={styles.MaxBuy}>Max buy {Limit.toString()} jUSD</h1>
					: <h1 className={styles.MaxBuy2}>Invite new partners<br/>or await new day limit</h1>
					}
					
				</div>
				<div className={styles.Buttons}>
					<div onClick={!BuyMax ? () => setModalBuy(!ModalBuy) : () => setModalBuy(ModalBuy)} className={classNames(styles.cursor_pointer, (!BuyMax ? styles.ButtonsBuy : styles.ButtonsBuy2))}><p>Buy</p></div>
					<div onClick={() => setModalSell(!ModalSell)} className={classNames(styles.cursor_pointer, styles.ButtonsSell)}><p>Sell</p></div>
				</div>
			</div>
			<div className={styles.Footer}>
				<div onClick={Links.GoPartners} className={styles.FooterButton}><img src={Community} alt="" /></div>
				<div onClick={Links.GoMain} className={styles.FooterButton}><div className={styles.FooterButtonActive}><img src={HomePageActive} alt="" /></div></div>
				<div onClick={Links.GoAbout} className={styles.FooterButton}><img src={Book} alt="" /></div>
			</div>
			{ModalBuy ? 
			<div onClick={() => setModalBuy(!ModalBuy)} className={styles.BlackWindow}>
				<div onClick={(e) => e.stopPropagation()} className={styles.ModalWindow}>
					<div onClick={() => setModalBuy(!ModalBuy)} className={classNames(styles.cursor_pointer, styles.Cancel)}>
						<img className={styles.CancelImg} src={Circle} alt="" />
						<img className={styles.CancelImg} src={Cancel} alt="" />
					</div>
					<h1 className={styles.ModalBuyTitle}>Buy tokens</h1>
					<h1 className={styles.ModalBuyDetail}>1 token = {OneToken.toString()}jUSD</h1>
					<div className={styles.ModalBuyInputs}>
						<div className={styles.ModalBuyBlockInput}>
							<h1 className={styles.ModalBuyBlockInput_Title}>jUSD</h1>
							<input onChange={ConvertBuy} id='BuyjUSD' type="text" className={styles.ModalBuyBlockInput_Input} />
							<h1 onClick={ButtonBuyMax} className={styles.ButtonMax}>max</h1>
						</div>
						<h1 id="InvalidBuy" className={classNames(styles.InvalidNumber, 'hidden')}>Invalid number</h1>
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
					<h1 className={styles.ModalSellDetail}>1 token = {OneToken.toString()}jUSD</h1>
					<div className={styles.ModalSellInputs}>
						<div className={styles.ModalSellBlockInput}>
							<h1 className={styles.ModalSellBlockInput_Title}>Token</h1>
							<input onChange={ConvertSell} type="text" id='SelljUSD' className={styles.ModalSellBlockInput_Input} />
							<h1 onClick={ButtonSellMax} className={styles.ButtonMax}>max</h1>
						</div>
						<h1 id="InvalidSell" className={classNames(styles.InvalidNumber, 'hidden')}>Invalid number</h1>
						<div className={styles.ModalSellBlockInput}>
							<h1 className={styles.ModalSellBlockInput_Title}>jUSD</h1>
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
					<h1 className={styles.ModalBuyLimitText}>КККККК Refferal link Refferal link Refferal link Refferal link Refferal link Reff       eral link Refferal link Refferal link Reffer .  al link Refferal link Refferal link Refferal link Refferal link Refferal link Re     fferal link Refferal link Refferal link Refferal link Refferal link Ref  feral link R   efferal link Refferal link Refferal link Refferal link Refferal link </h1>
					<div onClick={() => setModalBuyLimit(!ModalBuyLimit)} className={classNames(styles.cursor_pointer, styles.ModalBuyLimitButton)}><p className={styles.ModalBuyLimitButton_Title}>Close</p></div>
				</div>
			</div> 
			: ""}
		</div>
	);
}
export default Main;
