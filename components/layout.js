import Link from 'next/link'
import styles from './layout.module.css'

export default function Layout({ children }) {
    return (
        <div>
            <header className={styles.header}>
                <div className={styles.logo}>
                    <Link href='/'>
                        <a>Cripto Burgers</a>
                    </Link>
                </div>
                <div className={styles.navigation}>
                    <Link href='/mint-token'>
                        <a>Mint token</a>
                    </Link>
                    <Link href='/my-nfts'>
                        <a>My NFTs</a>
                    </Link>
                    <Link href='/account-dashboard'>
                        <a>Account dashboard</a>
                    </Link>
                </div>
            </header>
            <main className={styles.main}>
                {children}
            </main>
        </div>
    )
}