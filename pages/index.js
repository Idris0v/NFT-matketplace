import { useEffect, useState } from 'react'
import Web3Modal from "web3modal";
import { ethers } from 'ethers'
import axios from 'axios'
import { Card } from 'antd';
import { nftAddress, marketAddress } from '../config'

import CBMarket from '../artifacts/contracts/CBMarket.sol/CBMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'

export default function Home() {

  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadNfts()
  }, [])

  async function loadNfts() {
    setLoading(true)
    const provider = new ethers.providers.JsonRpcProvider()
    const nftContract = new ethers.Contract(nftAddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(marketAddress, CBMarket.abi, provider)
    const data = await marketContract.fetchMarketTokens()
    console.log(data);
    const items = await Promise.all(data
      .filter(i => typeof i === 'object' && i.sold === false)
      .map(async i => {
        const tokenUri = await nftContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        const { image, name, description } = meta.data;
        const price = ethers.utils.formatUnits(i.price, 'ether');
        return {
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: owner,
          image,
          name,
          description,
          price
        }
      }));
    setNfts(items)
    setLoading(false)
  }

  async function buyNft(nft) {
    const web3 = new Web3Modal()
    const connection = await web3.connect()
    const provider = web3.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const marketContract = new ethers.Contract(marketAddress, CBMarket.abi, signer)

    const price = ethers.utils.parseEther(nft.price);
    const transaction = await marketContract(nftAddress, nft.tokenId);
    await transaction.wait()
    loadNfts()
  }

  return (
    <div>
      Hello!
      {loading ? 'Loading' : 'Loaded'}
      {nfts.map(nft => <Card
        key={nft.tokenId}
        style={{ width: 300 }}
        cover={
          <img
            alt="nft image"
            src={nft.image}
          />
        }
        actions={[
          
        ]}
      >
        <Card.Meta
          title={nft.name + ' ' + nft.price + 'ETH'}
          description={nft.description}
        />
      </Card>
      )}
    </div>
  )
}
