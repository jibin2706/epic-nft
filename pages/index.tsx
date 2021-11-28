import Head from 'next/head'
import clsx from 'clsx'
import { useCallback, useEffect, useState } from 'react'
import { ethers } from 'ethers'

import type { NextPage } from 'next'

// ABI file
import myEpicNft from '../utils/MyEpicNFT.json'

import styles from '../styles/Home.module.css'
import Loading from '../components/Loading/Loading'

const CONTRACT_ADDRESS = '0x6a521e060fD7Be769cB43CA84340Bc06307bBf2b'
const TWITTER_HANDLE = 'real_jibin'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`
const TOTAL_MINT_COUNT = 50
const OPENSEA_LINK = `https://testnets.opensea.io/collection/myepicnft-paph4zpjmc`

const Home: NextPage = () => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [isMinting, setMinting] = useState(true)

  const checkIfEthWalletIsConnected = useCallback(async () => {
    const { ethereum } = window

    if (ethereum) {
      console.log('eth', ethereum)
    } else {
      console.log('wallet not connected')
      return
    }

    // check if we are authorized to access the user's wallet
    const accounts = await ethereum.request<string[]>({ method: 'eth_accounts' })

    if (accounts?.length !== 0 && accounts?.[0]) {
      setCurrentAccount(accounts[0])
      setupEventListener()
    } else {
      console.log('No authorized account found')
    }
  }, [])

  useEffect(() => {
    checkIfEthWalletIsConnected()
  }, [checkIfEthWalletIsConnected])

  const connectWallet = async () => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        alert('Please install Metamask Wallet!')
        return
      }

      const accounts = await ethereum.request<string[]>({ method: 'eth_requestAccounts' })
      if (accounts?.length !== 0 && accounts?.[0]) {
        console.log('Connected', accounts)
        setCurrentAccount(accounts[0])
      }
    } catch (error) {
      console.log(error)
    } finally {
    }
  }

  const setupEventListener = () => {
    try {
      const { ethereum } = window
      if (!ethereum) return

      const provider = new ethers.providers.Web3Provider(ethereum as any)
      const signer = provider.getSigner()
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

      connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
        console.log(from, tokenId.toNumber())
        alert(
          `Hey there! We've minted your NFT. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: <https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}>`
        )
      })

      console.log('Setup event listener!')
    } catch (error) {
      console.log(error)
    } finally {
    }
  }

  const askContractToMintNFT = async () => {
    try {
      const { ethereum } = window
      if (!ethereum) throw new Error('Ethereum wallet not connected')

      const provider = new ethers.providers.Web3Provider(ethereum as any)
      const signer = provider.getSigner()
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

      console.log('Going to pop wallet now to pay gas...')
      setMinting(true)
      let nftTxn = await connectedContract.makeAnEpicNFT()

      console.log('Mining NFT....')
      await nftTxn.wait()

      console.log(`Mined! check transaction on: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`)
    } catch (error) {
      console.log(error)
    } finally {
      setMinting(false)
    }
  }

  const renderNotConnectedContainer = () => {
    if (currentAccount)
      return (
        <button
          onClick={askContractToMintNFT}
          className={clsx(
            'block  | text-2xl font-bold bg-blue-400 text-gray-800  |  rounded-md  |  py-4 px-12 mb-12 mx-auto |  focus:outline-none  focus:ring',
            isMinting && 'cursor-wait |  !bg-blue-200'
          )}
          disabled={isMinting}
        >
          {isMinting ? (
            <div className="flex items-center gap-2">
              <Loading />
              <span>Please Wait...</span>
            </div>
          ) : (
            'Mint NFT'
          )}
        </button>
      )
    return (
      <button
        onClick={connectWallet}
        className="block  | text-2xl font-bold bg-blue-400 text-gray-800  |  rounded-md  |  py-4 px-12 mb-12 mx-auto |  focus:outline-none  focus:ring"
      >
        Connect to Wallet
      </button>
    )
  }

  return (
    <div className="bg-gray-800 text-white  min-h-screen">
      <Head>
        <title>NFT Hero Names</title>
        <meta name="description" content="Checkout My NFT Hero Collection built" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <header className="text-center  |  py-8">
          <h1 className="text-5xl font-bold  |  mb-4">My NFT Collection</h1>
          <h2 className="text-2xl">Each unique. Each beautiful. Discover your NFT today.</h2>
        </header>
        <section className="max-w-3xl  |  mx-auto">{renderNotConnectedContainer()}</section>

        <a
          href={OPENSEA_LINK}
          className="flex justify-center  |  text-lg text-center underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          🌊 View Collection on OpenSea
        </a>
      </main>

      <footer className="text-center  |  py-8">
        <a className="" href={TWITTER_LINK} target="_blank" rel="noreferrer">{`built on @${TWITTER_HANDLE}`}</a>
      </footer>
    </div>
  )
}

export default Home
