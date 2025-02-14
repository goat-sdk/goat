'use client';
import type { NextPage } from 'next';
import { type Connector, useAccount, useConnect } from 'wagmi';

import Chat from '../chat';

const IndexPage: NextPage = () => {
    const { isConnected } = useAccount();
    const { connectors, connect } = useConnect();
    const handleOnConnectClick = (connector: Connector) => () => connect({ connector });

    return (
        <main>
          {isConnected ? (
            <Chat />
          ) : connectors.map((value) => (
              <button
                  key={value.id}
                  onClick={handleOnConnectClick(value)}
              >
                  {value.name}
              </button>
          ))}
        </main>
    );
};

export default IndexPage;
