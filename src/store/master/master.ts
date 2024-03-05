import { TonConnectUI, WalletInfo, TonConnect } from "@tonconnect/ui-react";
import { makeAutoObservable } from "mobx";
import { TonClient, beginCell, SendMode, JettonMaster } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { Master } from '../../wrappers/Master'
import { JettonMinter } from '../../wrappers/JettonMinter'
import { Helper } from '../../wrappers/Helper'
import { Sender } from '../../wrappers/Sender';
import { JettonWallet } from '../../wrappers/JettonWallet';
import { Address, Cell, OpenedContract, toNano } from '@ton/core'
import axios from 'axios';
import { BACKEND } from '../../constants'

function binpow(a: bigint, n: bigint):bigint {
	if (n == 0n){
		return 1n;
    }
	if (n % 2n == 1n){
		return binpow(a, n - 1n) * a;
    }
	else {
		let b:bigint = binpow(a, n / 2n);
		return b * b;
	}
}

function randomIntFromInterval(min:number, max:number):number { 
	return Math.floor(Math.random() * (max - min + 1) + min)
}

function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
  
interface MasterContractData {
    helperCode: Cell;
    ownerAddress: Address;
    minterAddress: Address;
    jettonWalletAddress: Address;
    jusdWalletAddress: Address;
    jettonsAmount: bigint;
    jusdAmount: bigint;
};

class MasterStore {
	MasterAddress = "EQCI-UM_f8IcQgLk_i-hEnXT9mkuvZyhWrnpOEYKRaEqSoYX"; 
	MinterJusdAddress = "EQDjwcQzRCUSiy8Y0sIQDoIwxSqaErJdRpmzENl6YlnqcDy-";
	MinterCustomAddress = "EQCQamNt4foTku5RihGz8ZdXm86ksdOo9LInZzhUq42iu941"; 
	client: TonClient | null = null;
	MasterContact: OpenedContract<Master> | null = null;
	MasterContactData: MasterContractData | null = null;
	HelperContact: OpenedContract<Helper> | null = null;
	jettonMasterCustom: OpenedContract<JettonMaster> | null = null;
	jettonWalletCustom: Address | null = null;
	ContactCustom: OpenedContract<JettonWallet> | null = null;
	jettonMasterJUSD: OpenedContract<JettonMaster> | null = null;
	jettonWalletJUSD: Address | null = null;
	ContactJUSD: OpenedContract<JettonWallet> | null = null;

    constructor() {
		makeAutoObservable(this);
	}

	InitialStart = async (tonConnectUI: TonConnectUI) => {
		console.log("tonConnectUI", tonConnectUI.account?.address)
		if (tonConnectUI.account?.address == null) return;
		const client = new TonClient({
			endpoint: 'https://toncenter.com/api/v2/jsonRPC',
		});
		this.MasterContact = await client.open(Master.createFromAddress(Address.parse(this.MasterAddress)));
		console.log("MasterContact", this.MasterContact)
		await this.sleep(1100);
		this.HelperContact = await client.open(await this.MasterContact.getHelper(Address.parse(tonConnectUI.account?.address)));
		console.log("HelperContact", this.HelperContact)
		await this.sleep(1100);
		this.MasterContactData = await this.MasterContact.getContractData();
		console.log("MasterContactData")
	}

	Buy = async (tonConnectUI: TonConnectUI, amount: bigint) => {
		if (tonConnectUI.account?.address == null) return;
		const body = beginCell() 
        .storeUint(0xf8a7ea5, 32)         
        .storeUint(0, 64)                       
        .storeCoins(amount) // amount                
        .storeAddress(Address.parse(this.MasterAddress))                 
        .storeAddress(Address.parse(tonConnectUI.account.address))             
        .storeUint(0, 1)                      
        .storeCoins(toNano(0.3))               
        .storeUint(0,1)                        
        .endCell();
		this.client = new TonClient({
			endpoint: 'https://toncenter.com/api/v2/jsonRPC',
		});
		if (this.jettonMasterJUSD == null) {
			this.jettonMasterJUSD = this.client.open(JettonMaster.create(Address.parse(this.MinterJusdAddress)));
			await sleep(1010);
		}
		if (this.jettonWalletJUSD == null) {
			this.jettonWalletJUSD = await this.jettonMasterJUSD.getWalletAddress(Address.parse(tonConnectUI.account?.address));
			await sleep(1010);	
		}
		await tonConnectUI.sendTransaction({
			messages: [
				{
					address: this.jettonWalletJUSD.toString(), // this.Master.address.toString()
					amount: toNano(1).toString(),
					payload: body.toBoc().toString("base64") 
				},
			],
			validUntil: Date.now() + 5 * 60 * 1000
		})
	}

	BuyRefer = async (tonConnectUI: TonConnectUI, amount: bigint, refer: Address) => {
		if (tonConnectUI.account?.address == null) return;
		const body = beginCell()
        .storeUint(0xf8a7ea5, 32)         
        .storeUint(0, 64)                       
        .storeCoins(amount) // amount                
        .storeAddress(Address.parse(this.MasterAddress))                 
        .storeAddress(Address.parse(tonConnectUI.account.address))             
        .storeUint(0, 1)                      
        .storeCoins(toNano(0.3))               
        .storeUint(1,1)
		.storeRef(beginCell().storeAddress(refer).endCell())                        
        .endCell();
		this.client = new TonClient({
			endpoint: 'https://toncenter.com/api/v2/jsonRPC',
		});
		if (this.jettonMasterJUSD == null) {
			this.jettonMasterJUSD = this.client.open(JettonMaster.create(Address.parse(this.MinterJusdAddress)));
			await sleep(1010);
		}
		if (this.jettonWalletJUSD == null) {
			this.jettonWalletJUSD = await this.jettonMasterJUSD.getWalletAddress(Address.parse(tonConnectUI.account?.address));
			await sleep(1010);	
		}
		await tonConnectUI.sendTransaction({
			messages: [
				{
					address: this.jettonWalletJUSD.toString(), // this.Master.address.toString()
					amount: toNano(1).toString(),
					payload: body.toBoc().toString("base64"),

				},
			],
			validUntil: Date.now() + 5 * 60 * 1000
		})
		try {
			let xhr = new XMLHttpRequest();
			xhr.open("POST", BACKEND);
			xhr.send("!" + refer.toString());
		} catch {}
		// let Trans = await this.client.getTransactions(this.jettonWalletJUSD, {limit: 10});
		// console.log("Trans", Trans)
		// let approved = false;
		// while (!approved) {
		// 	let NewTrans = await this.client.getTransactions(jettonWallet, {limit: 1});
		// 	if (NewTrans[0].prevTransactionLt != Trans[0].prevTransactionLt) {
		// 		approved = true;
		// 		break;
		// 	}
		// }
		// Trans = await this.client.getTransactions(jettonWallet, {limit: 1});
		// if ((Trans[0].description as any).actionPhase.success){
		// 	try {
		// 		let xhr = new XMLHttpRequest();
		// 		xhr.open("POST", BACKEND);
		// 		xhr.send("!" + refer.toString());
		// 	} catch {}
		// }
	}

	Sell = async (tonConnectUI: TonConnectUI, amount: bigint) => {
		if (tonConnectUI.account?.address == null) return;
		const body = beginCell()
        .storeUint(0xf8a7ea5, 32)         
        .storeUint(0, 64)                       
        .storeCoins(amount) // amount                
        .storeAddress(Address.parse(this.MasterAddress))                 
        .storeAddress(Address.parse(tonConnectUI.account.address))             
        .storeUint(0, 1)                      
        .storeCoins(toNano(0.05))               
        .storeUint(0,1)                        
        .endCell();
		this.client = new TonClient({
			endpoint: 'https://toncenter.com/api/v2/jsonRPC',
		});
		if (this.jettonMasterCustom == null) {
			this.jettonMasterCustom = this.client.open(JettonMaster.create(Address.parse(this.MinterCustomAddress)));
			await sleep(1010);
		}
		if (this.jettonWalletCustom == null) {
			this.jettonWalletCustom = await this.jettonMasterCustom.getWalletAddress(Address.parse(tonConnectUI.account?.address));
			await sleep(1010);
		}
		console.log("ALLLLL", this.jettonWalletCustom.toString())
		await tonConnectUI.sendTransaction({
			messages: [
				{
					address: this.jettonWalletCustom.toString(), // this.Master.address.toString()
					amount: toNano(1).toString(),
					payload: body.toBoc().toString("base64") 
				},
			],
			validUntil: Date.now() + 5 * 60 * 1000
		})
	}

	GetLimit = async () => {
		if (this.HelperContact == null) return 0n;
		try {	
			const Limit = await this.HelperContact.getBuyLimits();
			return Limit;
		} catch {
			return BigInt(0);
		}
	}

	GetPartners = async () => {
		if (this.HelperContact == null) return
		try {
			const Data = await this.HelperContact.getContractData();
			return Data.referalsCount;
		} catch {
			return 0;
		}
	}

	TakeInfoToken = () => {
		const endpoint = "https://tonapi.io"; 
		const result = axios.get(endpoint + '/v2/jettons/' + encodeURIComponent(this.MinterCustomAddress)); // константа
		return result;
	}

	ConvertBuy = async (amount: bigint) => {
		if (this.MasterContactData == null) return 0n;
		const Info = this.MasterContactData;
		const jettonsAmount = Info.jettonsAmount;
		const jusdAmount = Info.jusdAmount;
		return amount * jettonsAmount * 85n / jusdAmount / 100n;
	}

	ConvertSell = async (amount: bigint) => {
		if (this.MasterContactData == null) return 0n;
		const Info = this.MasterContactData;
		const jettonsAmount = Info.jettonsAmount;
		const jusdAmount = Info.jusdAmount;
		return amount * jusdAmount * 85n /  jettonsAmount / 100n;
	}

	MaxBuyLimit = async () => {
		if (this.HelperContact == null) return 10n;
		try {
			const Data = await this.HelperContact.getContractData();
			await sleep(1010);
			const Now =  BigInt(Date.now()) / 1000n;
			const current_day_index = (BigInt(Now) - Data.beginTime) / (24n * 60n * 60n);
			return ((10000000000n * binpow(13n, current_day_index) / binpow(10n, current_day_index))) / toNano(1n);
		} catch {
			return 10n;
		}
	}

	sleep = function(ms: number) {
		return new Promise(
			  resolve => setTimeout(resolve, ms)
		);
	}

	GetBalance = async (tonConnectUI: TonConnectUI) => {
		if (tonConnectUI.account?.address == null) return 10n;
		const client = new TonClient({
			endpoint: 'https://toncenter.com/api/v2/jsonRPC',
		});
		if (this.jettonMasterCustom == null) {
			this.jettonMasterCustom = client.open(JettonMaster.create(Address.parse(this.MinterCustomAddress)));
			await sleep(1010);
		}
		if (this.jettonWalletCustom == null) {
			this.jettonWalletCustom = await this.jettonMasterCustom.getWalletAddress(Address.parse(tonConnectUI.account?.address));
			await sleep(1010);
		}
		if (this.ContactCustom == null) {
			this.ContactCustom = await client.open(JettonWallet.createFromAddress(Address.parse(this.jettonWalletCustom.toString())));
			await sleep(1010);
		}
		const Ans = await this.ContactCustom.getJettonBalance();
		return Ans / toNano(1);
	}

	GetBalanceUSD = async (tonConnectUI: TonConnectUI) => {
		if (tonConnectUI.account?.address == null) return 10n;
		const client = new TonClient({
			endpoint: 'https://toncenter.com/api/v2/jsonRPC',
		});
		if (this.jettonMasterJUSD == null) {
			this.jettonMasterJUSD = client.open(JettonMaster.create(Address.parse(this.MinterJusdAddress)));
			await sleep(1010);
		}
		if (this.jettonWalletJUSD == null) {
			this.jettonWalletJUSD = await this.jettonMasterJUSD.getWalletAddress(Address.parse(tonConnectUI.account?.address));
			await sleep(1010);	
		}
		if (this.ContactJUSD == null) {
			this.ContactJUSD = await client.open(JettonWallet.createFromAddress(Address.parse(this.jettonWalletJUSD.toString())));
			await sleep(1010);
		}
		const Ans = await this.ContactJUSD.getJettonBalance();
		return Ans / toNano(1);
	}
}

export default new MasterStore();