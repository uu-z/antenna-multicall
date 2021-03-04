import { Contract } from "iotex-antenna/lib/contract/contract";
import { AbiByFunc, encodeInputData } from "iotex-antenna/lib/contract/abi-to-byte";
import * as _ from "lodash";
import Antenna from "iotex-antenna";
import { Interface } from "@ethersproject/abi";

export interface Call {
  target: string;
  callData: string;
}
export interface CallInput {
  abi: string;
  target: string;
  method: string;
  params?: any[];
}

export class MultiCall {
  contract: Contract;
  multicall: Interface;
  constructor(args: Partial<MultiCall>) {
    Object.assign(this, args);
    this.multicall = new Interface(this.abi);
  }

  get iotex() {
    return this.contract.provider as Antenna["iotx"];
  }

  get abi() {
    return JSON.stringify(Object.values(this.contract.getABI()));
  }

  get contractAddress() {
    return this.contract.getAddress();
  }

  async batch(inputs: CallInput[]) {
    let calls = [];
    let contracts: Interface[] = [];
    inputs.forEach((i, index) => {
      const { abi, target, method, params } = i;
      contracts[index] = new Interface(abi);
      const callData = contracts[index].encodeFunctionData(method, params);
      calls.push([target, callData]);
    });
    let data = this.multicall.encodeFunctionData("batch", [calls]);
    const result = await this.contract.provider.readContract({
      execution: {
        contract: this.contractAddress,
        amount: "0",
        data: Buffer.from(data.substr(2), "hex"),
      },
      callerAddress: this.contract.getAddress(),
    });
    const batchResult = this.multicall.decodeFunctionResult("batch", `0x${result.data}`);

    return batchResult[2].map((i, index) => {
      const res = contracts[index].decodeFunctionResult(inputs[index].method, i);
      return res[0].toString();
    });
  }
}
