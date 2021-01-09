import React, { useEffect, useMemo, useState } from 'https://esm.sh/react'
//import WalletConnect from "https://esm.sh/@walletconnect/web3-provider"
import { useAsyncMemo } from "../react.tsx"
import { Web3Provider } from "https://esm.sh/@ethersproject/providers"

export const WCButton = (props: {
  onClick: () => void
}) => {
  const { onClick } = props

  return <button
    className="rounded-2xl w-full p-4 border-2 border-gray-100 hover:border-green-400 flex justify-between items-center"
    onClick={onClick}>
    <div className="text-black font-medium"
      children="WalletConnect" />
    <img height={24} width={24}
      src="/walletconnect.png" />
  </button>
}

// export const WConnector = () => {
//   const provider = useAsyncMemo(async () => {
//     const provider = new WalletConnect({
//       infuraId: "7f198ba5d17f492d899a38781e324df4"
//     })
//     await provider.enable()
//     return provider
//   }, [])

//   console.log("provider", provider)

//   const web3 = useAsyncMemo(async () => {
//     return new Web3Provider(provider)
//   }, [provider])

//   console.log("web3", web3)

//   return null
// }
