
import {nftAddress, marketAddress} from '../config'

import CBMarket from '../artifacts/contracts/CBMarket.sol/CBMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

export default function Home() {

  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadNfts()
  }, [])

  async function loadNfts() {
    setLoading(true)
    const provider = new ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(marketAddress, CBMarket.abi, provider)
    const data = await marketContract.fetchMarketTokens()
    console.log(data);
    const items = data.filter(i => typeof i === 'object' && i.sold === false).map(i => ({
      itemId: i.itemId.toNumber(),
      price: ethers.utils.formatUnits(i.price, 'ether'),
      seller: i.seller
    }));
    setNfts(items)
  }

  return (
    <div>
      Hello!
      {loading ? 'Loaded' : 'loading'}
      {nfts.map(nft => <div>price: {nft.price}, itemId: {nft.itemId}, seller: {nft.seller}. </div>)}
    </div>
  )
}
