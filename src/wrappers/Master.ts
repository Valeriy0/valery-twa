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
        .storeUint(0, 48)
        .storeCoins(config.jettonsAmount)
        .storeCoins(config.jusdAmount)
        .endCell();
}

export const Opcodes = {
    addReferer: 0x33ae6648,
    setData: 0x2b339c13,
    setCodes: 0x3c089b25,
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

    async sendSetCodes(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: {
            query_id: bigint;
            master_code?: Cell;
            helper_code?: Cell;
        }
    ) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.setCodes, 32)
                .storeUint(opts.query_id, 64)
                .storeMaybeRef(opts.master_code)
                .storeMaybeRef(opts.helper_code)
                .endCell(),
        });
    }

    async sendSetData(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: {
            query_id: bigint;
            minter_address?: Address;
            jetton_wallet_address?: Address;
            jusd_wallet_address?: Address;
            first_referal_percent?: bigint;
            second_referal_percent?: bigint;
            third_referal_percent?: bigint;
        }
    ) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.setData, 32)
                .storeUint(opts.query_id, 64)
                .storeMaybeBuilder(opts.minter_address ? beginCell().storeAddress(opts.minter_address) : null)
                .storeMaybeBuilder(
                    opts.jetton_wallet_address ? beginCell().storeAddress(opts.jetton_wallet_address) : null
                )
                .storeMaybeBuilder(opts.jusd_wallet_address ? beginCell().storeAddress(opts.jusd_wallet_address) : null)
                .storeMaybeUint(opts.first_referal_percent, 16)
                .storeMaybeUint(opts.second_referal_percent, 16)
                .storeMaybeUint(opts.third_referal_percent, 16)
                .endCell(),
        });
    }

    async getContractData(provider: ContractProvider): Promise<{
        helperCode: Cell;
        ownerAddress: Address;
        minterAddress: Address;
        jettonWalletAddress: Address;
        jusdWalletAddress: Address;
        jettonsAmount: bigint;
        jusdAmount: bigint;
    }> {
        const res = (await provider.get('get_contract_data', [])).stack;
        return {
            helperCode: res.readCell(),
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
