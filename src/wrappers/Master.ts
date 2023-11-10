import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';
import { Helper } from './Helper';

export type MasterConfig = {
    helperCode: Cell;
    ownerAddress: Address;
    jettonsAmount: bigint;
    jusdAmount: bigint;
};

export function masterConfigToCell(config: MasterConfig): Cell {
    return beginCell()
        .storeRef(config.helperCode)
        .storeRef(beginCell().storeAddress(config.ownerAddress).storeUint(0, 4).endCell())
        .storeUint(0, 2)
        .storeCoins(config.jettonsAmount)
        .storeCoins(config.jusdAmount)
        .endCell();
}

export const Opcodes = {
    addReferer: 0x33ae6648,
    setData: 0x2b339c13,
};

export class Master implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Master(address);
    }

    static createFromConfig(config: MasterConfig, code: Cell, workchain = 0) {
        const data = masterConfigToCell(config);
        const init = { code, data };
        return new Master(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendSetData(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: {
            query_id: bigint;
            minter_address: Address;
            jetton_wallet_address: Address;
            jusd_wallet_address: Address;
        }
    ) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.setData, 32)
                .storeUint(opts.query_id, 64)
                .storeAddress(opts.minter_address)
                .storeAddress(opts.jetton_wallet_address)
                .storeAddress(opts.jusd_wallet_address)
                .endCell(),
        });
    }

    async sendAddReferer(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: {
            query_id: bigint;
            referer_address: Address;
        }
    ) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.addReferer, 32)
                .storeUint(opts.query_id, 64)
                .storeAddress(opts.referer_address)
                .endCell(),
        });
    }

    async getContractData(provider: ContractProvider): Promise<{
        ownerAddress: Address;
        minterAddress: Address;
        jettonWalletAddress: Address;
        jusdWalletAddress: Address;
        jettonsAmount: bigint;
        jusdAmount: bigint;
    }> {
        const res = (await provider.get('get_contract_data', [])).stack;
        res.skip(1);
        return {
            ownerAddress: res.readAddress(),
            minterAddress: res.readAddress(),
            jettonWalletAddress: res.readAddress(),
            jusdWalletAddress: res.readAddress(),
            jettonsAmount: res.readBigNumber(),
            jusdAmount: res.readBigNumber(),
        };
    }

    async getHelper(provider: ContractProvider, user: Address): Promise<Helper> {
        const stack = (
            await provider.get('get_helper_address', [
                { type: 'slice', cell: beginCell().storeAddress(user).endCell() },
            ])
        ).stack;
        return Helper.createFromAddress(stack.readAddress());
    }
}
