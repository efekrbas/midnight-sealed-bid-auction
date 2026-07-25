import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';

const p = new FetchZkConfigProvider('http://localhost', fetch);
(p as any).sendRequest = async function(url: string, circuitId: string, ext: string, type: string) {
    console.log({ url, circuitId, ext, type });
    return new Uint8Array();
};

p.getZkir('test/circuit');
p.getProvingKey('test/circuit');
