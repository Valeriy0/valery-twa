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

class MasterStore {
	MasterAddress = "EQD0cE0tyeIgg00fVTCiLh5aC1uKMt5_RrMoTrfzwpvTLvAM"; 
	MinterJusdAddress = "EQDjwcQzRCUSiy8Y0sIQDoIwxSqaErJdRpmzENl6YlnqcDy-";
	MinterCustomAddress = "EQBWAHbpSrSGoAb2rd21B9lofgvl_eT5kkqtYAYWMdxs_dVT"; 
	client: TonClient | null = null;

    constructor() {
		makeAutoObservable(this);
	}

	Buy = async (tonConnectUI: TonConnectUI, amount: bigint) => {
		if (tonConnectUI.account?.address == null) return;
		const body = beginCell()
        .storeUint(0xf8a7ea5, 32)         
        .storeUint(0, 64)                       
        .storeCoins(toNano(amount)) // amount                
        .storeAddress(Address.parse(this.MasterAddress))                 
        .storeAddress(Address.parse(tonConnectUI.account.address))             
        .storeUint(0, 1)                      
        .storeCoins(toNano(0.3))               
        .storeUint(0,1)                        
        .endCell();
		const endpoint = await getHttpEndpoint(); 
		this.client = new TonClient({
			endpoint
		});
		const jettonMasterAddress = Address.parse(this.MinterJusdAddress) // token
		const userAddress = Address.parse(tonConnectUI.account.address)
		const jettonMaster = this.client.open(JettonMaster.create(jettonMasterAddress))
		const jettonWallet = await jettonMaster.getWalletAddress(userAddress);
		await tonConnectUI.sendTransaction({
			messages: [
				{
					address: jettonWallet.toString(), // this.Master.address.toString()
					amount: toNano(1).toString(),
					payload: body.toBoc().toString("base64") 
				},
			],
			validUntil: Date.now() + 5 * 60 * 1000
		})
	}

	Sell = async (tonConnectUI: TonConnectUI, amount: bigint) => {
		if (tonConnectUI.account?.address == null) return;
		const body = beginCell()
        .storeUint(0xf8a7ea5, 32)         
        .storeUint(0, 64)                       
        .storeCoins(toNano(amount)) // amount                
        .storeAddress(Address.parse(this.MasterAddress))                 
        .storeAddress(Address.parse(tonConnectUI.account.address))             
        .storeUint(0, 1)                      
        .storeCoins(toNano(0.05))               
        .storeUint(0,1)                        
        .endCell();
		const endpoint = await getHttpEndpoint(); 
		this.client = new TonClient({
			endpoint
		});
		const jettonMasterAddress = Address.parse(this.MinterCustomAddress) // token
		const userAddress = Address.parse(tonConnectUI.account.address)
		const jettonMaster = this.client.open(JettonMaster.create(jettonMasterAddress))
		const jettonWallet = await jettonMaster.getWalletAddress(userAddress);
		await tonConnectUI.sendTransaction({
			messages: [
				{
					address: jettonWallet.toString(), // this.Master.address.toString()
					amount: toNano(1).toString(),
					payload: body.toBoc().toString("base64") 
				},
			],
			validUntil: Date.now() + 5 * 60 * 1000
		})
	}

	AddRefer = async (tonConnectUI: TonConnectUI, referAddress: Address, amount: bigint) => {
		const endpoint = await getHttpEndpoint(); 
		const client = new TonClient({
			endpoint
		});
		const MasterContact = client.open(Master.createFromAddress(Address.parse(this.MasterAddress)));
		MasterContact.sendAddReferer(new Sender(tonConnectUI), toNano('0.06'), {
			query_id: 1n,
			referer_address: referAddress,
		});
		await this.Buy(tonConnectUI, amount);
	}

	GetLimit = async (tonConnectUI: TonConnectUI) => {
		if (tonConnectUI.account?.address == null) return 0n;
		const endpoint = await getHttpEndpoint(); 
		const client = new TonClient({
			endpoint
		});
		const MasterContact = await client.open(Master.createFromAddress(Address.parse(this.MasterAddress)));
		const HelperContact = client.open(await MasterContact.getHelper(Address.parse(tonConnectUI.account?.address)));
		const Limit = await HelperContact.getBuyLimits();
		return Limit;
	}

	GetPartners = async (tonConnectUI: TonConnectUI) => {
		if (tonConnectUI.account?.address == null) return
		const endpoint = await getHttpEndpoint(); 
		const client = new TonClient({
			endpoint
		});
		const MasterContact = await client.open(Master.createFromAddress(Address.parse(this.MasterAddress)));
		const HelperContact = await client.open(await MasterContact.getHelper(Address.parse(tonConnectUI.account?.address)));
		const Data = await HelperContact.getContractData();
		return Data.referalsCount;
	}

	TakeInfoToken = () => {
		const endpoint = "https://tonapi.io"; 
		const result = axios.get(endpoint + '/v2/jettons/' + encodeURIComponent(this.MinterCustomAddress)); // константа
		return result;
	}

	ConvertBuy = async (amount: bigint) => {
		const endpoint = await getHttpEndpoint(); 
		const client = new TonClient({
			endpoint
		});
		const MasterContact = await client.open(Master.createFromAddress(Address.parse(this.MasterAddress)));
		const Info = await MasterContact.getContractData();
		console.log(Info);
		const jettonsAmount = Info.jettonsAmount;
		const jusdAmount = Info.jusdAmount;
		return amount * jettonsAmount * 85n / jusdAmount / 100n;
	}

	ConvertSell = async (amount: bigint) => {
		const endpoint = await getHttpEndpoint(); 
		const client = new TonClient({
			endpoint
		});
		const MasterContact = await client.open(Master.createFromAddress(Address.parse(this.MasterAddress)));
		const Info = await MasterContact.getContractData();
		const jettonsAmount = Info.jettonsAmount;
		const jusdAmount = Info.jusdAmount;
		console.log(amount, jusdAmount, jettonsAmount)
		return amount * jusdAmount * 85n /  jettonsAmount / 100n;
	}

	MaxBuyLimit = async (tonConnectUI: TonConnectUI) => {
		if (tonConnectUI.account?.address == null) return 10n;
		const endpoint = await getHttpEndpoint(); 
		const client = new TonClient({
			endpoint
		});
		const MasterContact = await client.open(Master.createFromAddress(Address.parse(this.MasterAddress)));
		const HelperContact = client.open(await MasterContact.getHelper(Address.parse(tonConnectUI.account?.address)));
		const Data = await HelperContact.getContractData();
		const Now =  BigInt(Date.now()) / 1000n;
		const current_day_index = (BigInt(Now) - Data.beginTime) / (24n * 60n * 60n);
		return ((10000000000n * binpow(13n, current_day_index) / binpow(10n, current_day_index))) / toNano(1n);
	}

	GetBalance = async (tonConnectUI: TonConnectUI) => {
		if (tonConnectUI.account?.address == null) return 10n;
		const endpoint = await getHttpEndpoint(); 
		const client = new TonClient({
			endpoint
		});
		const jettonMaster = client.open(JettonMaster.create(Address.parse(this.MinterCustomAddress)));
		const jettonWallet = await jettonMaster.getWalletAddress(Address.parse(tonConnectUI.account?.address));
		const Contact = await client.open(JettonWallet.createFromAddress(Address.parse(jettonWallet.toString())));
		console.log("Баланс", await Contact.getJettonBalance());
		return (await Contact.getJettonBalance()) / toNano(1);
	}

	GetBalanceUSD = async (tonConnectUI: TonConnectUI) => {
		if (tonConnectUI.account?.address == null) return 10n;
		const endpoint = await getHttpEndpoint(); 
		const client = new TonClient({
			endpoint
		});
		const jettonMaster = client.open(JettonMaster.create(Address.parse(this.MinterJusdAddress)));
		const jettonWallet = await jettonMaster.getWalletAddress(Address.parse(tonConnectUI.account?.address));
		const Contact = await client.open(JettonWallet.createFromAddress(Address.parse(jettonWallet.toString())));
		console.log("Баланс2", await Contact.getJettonBalance());
		return (await Contact.getJettonBalance()) / toNano(1);
	}

}

export default new MasterStore();