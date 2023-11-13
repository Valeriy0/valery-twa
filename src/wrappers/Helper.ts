import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    toNano,
} from '@ton/core';

export type HelperConfig = {};

export function helperConfigToCell(config: HelperConfig): Cell {
    return beginCell().endCell();
}

export class Helper implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Helper(address);
    }

    static createFromConfig(config: HelperConfig, code: Cell, workchain = 0) {
        const data = helperConfigToCell(config);
        const init = { code, data };
        return new Helper(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getContractData(provider: ContractProvider): Promise<{
        masterAddress: Cell;
        refererAddress: Cell;
        userAddress: Cell;
        beginTime: bigint;
        lastDayIndex: bigint;
        lastDayAmount: bigint;
        helperCode: Cell;
        referalsCount: number;
    }> {
        const res = (await provider.get('get_contract_data', [])).stack;
        return {
            masterAddress: res.readCell(),
            refererAddress: res.readCell(),
            userAddress: res.readCell(),
            beginTime: res.readBigNumber(),
            lastDayIndex: res.readBigNumber(),
            lastDayAmount: res.readBigNumber(),
            helperCode: res.readCell(),
            referalsCount: res.readNumber(),
        };
    }

    async getBuyLimits(provider: ContractProvider): Promise<bigint> {
        if ((await provider.getState()).state.type == 'active') {
            const res = (await provider.get('get_buy_limits', [])).stack;
            return res.readBigNumber();
        } else {
            return toNano('10');
        }
    }
}
