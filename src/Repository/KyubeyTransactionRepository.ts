import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Constant } from "src/Entity/constants.entity";
import { Repository, Db } from "typeorm";
import { DexBuyOrder } from "src/Entity/dexbuyorders.entity";
import { DexSellOrder } from "src/Entity/dexsellorders.entity";

@Injectable()
export class KyubeyTransactionRepository {
    constructor(
        @InjectRepository(Constant)
        private readonly constRepository: Repository<Constant>,
        @InjectRepository(DexBuyOrder)
        private readonly dexBuyOrderRepository: Repository<DexBuyOrder>,
        @InjectRepository(DexSellOrder)
        private readonly dexSellOrderRepository: Repository<DexSellOrder>,
    ) { }
    async getLastSyncBlockNo() {
        let val = await this.GetDbConst("sync_block_no");
        return parseInt(val);
    }
    private async GetDbConst(key: string) {
        let row = await this.constRepository.findOne(key);
        if (row) {
            return row.Value;
        }
        return null;
    }
    private async UpdateDbConst(key: string, value: string): Promise<void> {
        let row = await this.constRepository.findOne(key);
        if (row) {
            row.Value = value;
            await this.constRepository.save(row);
        }
    }
    async UpdateBuyReceiptAsync(orderId: number, symbol: string, account: string, ask: number, bid: number, unitPrice: number, block_time: Date, trx_id: string): Promise<DexBuyOrder> {
        let row = await this.dexBuyOrderRepository.findOne({ Id: orderId, TokenId: symbol });
        if (row) {
            await this.dexBuyOrderRepository.remove(row);
        }

        let newRow = new DexBuyOrder();
        newRow.Account = account;
        newRow.Id = orderId;
        newRow.Ask = ask;
        newRow.Bid = bid;
        newRow.UnitPrice = unitPrice / 100000000.0;
        newRow.Time = block_time;
        newRow.TokenId = symbol;
        newRow.TransactionId = trx_id;

        await this.dexBuyOrderRepository.save(newRow);
        return newRow;
    }
    async UpdateSellReceiptAsync(orderId: number, symbol: string, account: string, ask: number, bid: number, unitPrice: number, block_time: Date, trx_id: string): Promise<DexSellOrder> {
        let row = await this.dexSellOrderRepository.findOne({ Id: orderId, TokenId: symbol });
        if (row) {
            await this.dexSellOrderRepository.remove(row);
        }

        let newRow = new DexSellOrder();
        newRow.Account = account;
        newRow.Id = orderId;
        newRow.Ask = ask;
        newRow.Bid = bid;
        newRow.UnitPrice = unitPrice / 100000000.0;
        newRow.Time = block_time;
        newRow.TokenId = symbol;
        newRow.TransactionId = trx_id;

        await this.dexSellOrderRepository.save(newRow);
        return newRow;
    }
}