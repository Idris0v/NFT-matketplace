import { Form, Input, Button, Upload } from 'antd';
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { create } from "ipfs-http-client";
import { marketAddress, nftAddress } from "../../config";

import CBMarket from '/artifacts/contracts/CBMarket.sol/CBMarket.json'
import NFT from '/artifacts/contracts/NFT.sol/NFT.json'
import { useState } from "react";

const baseInfuraUrl = 'https://ipfs.infura.io:5001/api/v0'
const client = create(baseInfuraUrl)

export default function MintToken() {
    const [loading, setLoading] = useState(false)
    const [fileUri, setFileUri] = useState(null)
    const [form, setForm] = useState({ price: '', name: '', description: '' })

    const fileInputProps = {
        name: 'file',
    }

    async function onFileUpload(e) {
        const file = e.target.files[0]
        try {
            const added = await client.add(file, { progress: (p) => console.log('progress: ' + p) });
            setFileUri(baseInfuraUrl + '/' + added.path);
        } catch (error) {
            console.log('Error uploading file', error);
        }
    }

    async function onFinish(form) {
        // console.log(form);
        // const {lastModified, name, size, type, webkitRelativePath} = form.file.file;
        // const file = {
        //     lastModified, name, size, type, webkitRelativePath
        // }
        // await onFileUpload(file);
        const {assetName, description, price} = form;
        uploadToIPFS(assetName, description, price);
    }

    async function uploadToIPFS(name, description, price) {
        const data = JSON.stringify({name, description, image: fileUri})
        try {
            const added = await client.add(data);
            const nftUri = baseInfuraUrl + '/' + added.path;
            createMarketItem(nftUri, price);
        } catch (error) {
            console.log('Error uploading file', error);
        }
    }

    async function createMarketItem(nftUri, price) {
        setLoading(true)
        const web3 = new Web3Modal({ cacheProvider: false, providerOptions: {} })
        const connection = await web3.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const nftContract = new ethers.Contract(nftAddress, NFT.abi, signer)
        const transaction = await nftContract.mintToken(nftUri)
        const tx = await transaction.wait();
        console.log('tx', tx);
        console.log('tx.events', tx.events);
        const tokenId = tx.events[0].args[2].toNumber();
        const bigNumPrice = ethers.utils.parseEther(price, 'ether');

        const marketContract = new ethers.Contract(marketAddress, CBMarket.abi, signer)
        const listingPrice = await marketContract.listingPrice();
        const listingTransaction = await marketContract.createMarketItem(nftAddress, tokenId, bigNumPrice, { value: listingPrice })
        await listingTransaction.wait()
        setLoading(false)
    }

    return (
        <Form
            name="basic"
            labelCol={{
                span: 8,
            }}
            wrapperCol={{
                span: 16,
            }}
            initialValues={{
                remember: true,
            }}
            onFinish={onFinish}
            // onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
            <Form.Item
                label="Asset name"
                name="assetName"
                rules={[
                    {
                        required: true,
                        message: 'Please input the NFT name!',
                    },
                ]}
            >
                <Input onChange={e => setForm({...form, name: e.target.value })} />
            </Form.Item>

            <Form.Item
                label="Description"
                name="description"
                rules={[
                    {
                        required: true,
                        message: 'Please input your description!',
                    },
                ]}
            >
                <Input onChange={e => setForm({...form, description: e.target.value })} />
            </Form.Item>

            <Form.Item
                label="Price"
                name="price"
                rules={[
                    {
                        required: true,
                        message: 'Please input NFT price!',
                    },
                ]}
            >
                <Input addonAfter="ETH"/>
            </Form.Item>

            <Form.Item
                label="File"
                name="file"
                rules={[
                    {
                        required: true,
                        message: 'Please upload the image!',
                    },
                ]}
            >
                <input type='file' name='file' onChange={onFileUpload}/>
                {/* <Upload {...fileInputProps}>
                    <Button>Click to Upload</Button>
                </Upload> */}
            </Form.Item>

            <Form.Item
                wrapperCol={{
                    offset: 8,
                    span: 16,
                }}
            >
                <Button type="primary" htmlType="submit" loading={loading}>
                    Mint token
                </Button>
            </Form.Item>
        </Form>
    )
}