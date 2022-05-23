import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className='border-b p-6'> {/* border bottom, padding 6 */}
        <p className='text-4xl font-bold'>OpenSky NFT Marketplace</p>
        <div className='flex mt-4'> {/* display flex */}
          
          <Link href='/'>
            <a className='mr-6 text-orange-500'>
              Home
            </a>
          </Link>
          
          <Link href='/create-item'>
            <a className='mr-6 text-orange-500'>
              Sell Digital Assets
            </a>
          </Link>

          <Link href='/my-assets'>
            <a className='mr-6 text-orange-500'>
              My Digital Assets
            </a>
          </Link>

          <Link href="/creator-dashboard">
            <a className='mr-6 text-orange-500'>
              Creator Dashboard
            </a>
          </Link>

        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
