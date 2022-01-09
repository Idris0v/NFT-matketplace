import { useEffect, useState } from 'react'
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from 'axios'

import NftList from "../../components/nft-list/nft-list";

import { nftAddress, marketAddress } from '../../config'
import CBMarket from '/artifacts/contracts/CBMarket.sol/CBMarket.json'
import NFT from '/artifacts/contracts/NFT.sol/NFT.json'

export default function MyNfts() {
    const [myNfts, setMyNfts] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadNfts()
    }, [])

    async function loadNfts() {
        setLoading(true);
        const web3 = new Web3Modal();
        const connection = await web3.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const marketContract = new ethers.Contract(marketAddress, CBMarket.abi, signer)
        const nftContract = new ethers.Contract(nftAddress, NFT.abi, provider)

        let nfts = await marketContract.fetchMyNfts();
        nfts = await Promise.all(nfts
            .filter(nft => nft.sold)
            .map(async nft => {
                const tokenUri = await nftContract.tokenURI(nft.tokenId);
                const meta = await axios.get(tokenUri).catch(err => {
                    console.log(err);
                    return {
                        data: { image: '', name: '', description: '' }
                    }
                });
                const { image, name, description } = meta.data;
                const price = ethers.utils.formatUnits(nft.price, 'ether');
                return {
                    tokenId: nft.tokenId.toNumber(),
                    seller: nft.seller,
                    owner: nft.owner,
                    image,
                    name,
                    description,
                    price
                }
            }))
        setMyNfts(nfts);
        setLoading(false);
    }

    return (
        <div>
            {loading ? 'Loading' : 'Loaded'}
            <NftList nfts={myNfts} />
        </div>
    )
}