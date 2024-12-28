import '../styles/globals.css';
import Header from '../components/Header/Header';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <main style={{ padding: '20px' }}>
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default MyApp;
