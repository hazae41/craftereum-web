import { BigNumber } from "https://esm.sh/@ethersproject/bignumber"
import { Contract } from "https://esm.sh/@ethersproject/contracts"
import { Web3Provider } from "https://esm.sh/@ethersproject/providers"
import { State } from "./react.tsx"

export interface AppMemory {
  web3: Web3Provider,
  account: string,
  craftereum: Contract,
  emeralds: Contract,
  balance: BigNumber
  $contracts: State<string[]>
}