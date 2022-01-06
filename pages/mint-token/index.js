import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { marketAddress, nftAddress } from "../../config";

import CBMarket from '/artifacts/contracts/CBMarket.sol/CBMarket.json'
import NFT from '/artifacts/contracts/NFT.sol/NFT.json'

export default function MintToken() {
    async function mintToken(event) {
        event.preventDefault();
        const web3 = new Web3Modal({cacheProvider: false, providerOptions: {}})
        const connection = await web3.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const nftContract = new ethers.Contract(nftAddress, NFT.abi, signer)
        const transaction = await nftContract.mintToken('https://farsh-recept.ru/wp-content/uploads/2020/04/s-bekonom.jpg')
        const tx = await transaction.wait();
        console.log('tx', tx);
        console.log('tx.events', tx.events);
        const tokenId = tx.events[0].args[2].toNumber();
        const price = ethers.utils.parseEther('10', 'ether');

        const marketContract = new ethers.Contract(marketAddress, CBMarket.abi, signer)
        const listingPrice = await marketContract.listingPrice();
        const listingTransaction = await marketContract.createMarketItem(nftAddress, tokenId, price, { value: listingPrice })
        await listingTransaction.wait()
    }

    return (
        <form onSubmit={mintToken}>
            <button type='submit'>Mint token</button>
        </form>
    )
}