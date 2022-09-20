import { useEffect } from 'react';
import { NextPage } from 'next';
import Image from 'next/image';
import logo from 'public/logo.png';
import TypeIt from 'typeit';
const Home: NextPage = () => {
  useEffect(() => {
    let obj = new TypeIt('#welcome', {
      strings: 'Use next in nest...',
      speed: 50,
      waitUntilVisible: true,
    }).go();

    return () => {
      obj = null;
    };
  });
  return (
    <>
      <main>
        <Image src={logo} alt="" width={400} height={200} />
        <p id="welcome"></p>
      </main>
      <style jsx>{`
        main {
          display: flex;
          flex-direction: column;
          height: 100vh;
          justify-content: center;
          align-items: center;
        }
        #welcome{
            font-size: 30px;
            color: #472D2D;
            margin-top:16px
        }
      `}</style>
    </>
  );
};

export default Home;
