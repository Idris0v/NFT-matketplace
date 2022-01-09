import { Button, Card, Col, Row } from 'antd';

import styles from './nft-list.module.css'

export default function NftList({nfts, buyNft}) {
    const cardActions = [
        buyNft
        ? <Button type="primary" onClick={() => buyNft(nft)}>Buy NFT</Button>
        : undefined,
    ];

    return (
        <div className={styles.container}>
            <Row gutter={16}>
            {nfts.map(nft => <Col span={8}>
                <Card
                key={nft.tokenId}
                style={{ width: 300 }}
                cover={<img alt="nft image" src={nft.image} />}
                actions={cardActions}
                >
                <Card.Meta
                    title={nft.name + ' ' + nft.price + 'ETH'}
                    description={nft.description}
                />
                </Card>
            </Col>
            )}  
            </Row>
        </div>
    )
}