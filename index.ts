import Antenna from "iotex-antenna";
import { Contract } from "iotex-antenna/lib/contract/contract";
import { multicallABI } from "./abi/multicall";
import { MultiCall } from "./multicall";
import { xrc20ABI } from "./abi/xrc20";
import { fromString } from "iotex-antenna/lib/crypto/address";

const main = async () => {
  const antenna = new Antenna("https://api.iotex.one");
  const multiCall = new MultiCall({
    contract: new Contract(multicallABI, "io14n8zjjlh6f0733wxftj9r97ns78ksspmjgzh7e", { provider: antenna.iotx }),
  });
  const res = await multiCall.batch([
    {
      abi: JSON.stringify(xrc20ABI),
      target: fromString("io1f4acssp65t6s90egjkzpvrdsrjjyysnvxgqjrh").stringEth(),
      method: "totalSupply",
      params: [],
      // method: "balanceOf",
      // params: [fromString("io10zgz26gss20vc8xa2z44pv0f9mys52x62npwz9").stringEth()],
    },
    {
      abi: JSON.stringify(xrc20ABI),
      target: fromString("io1f4acssp65t6s90egjkzpvrdsrjjyysnvxgqjrh").stringEth(),
      // method: "totalSupply",
      // params: [],
      method: "balanceOf",
      params: [fromString("io10zgz26gss20vc8xa2z44pv0f9mys52x62npwz9").stringEth()],
    },
  ]);
  console.log(res);
};

main();
