import { useState } from 'react';
import { ethers } from 'ethers';

export default function CreateToken() {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('');

  const createToken = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const MemeCoin = new ethers.ContractFactory( signer);
      const memeCoin = await MemeCoin.deploy(name, symbol, ethers.utils.parseEther(supply));
      
      await memeCoin.deployed();
      console.log("MemeCoin deployed to:", memeCoin.address);
    }
  };

  return (
    <div>
      <h2>Create Token</h2>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Token Name" />
      <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Token Symbol" />
      <input type="number" value={supply} onChange={(e) => setSupply(e.target.value)} placeholder="Initial Supply" />
      <button onClick={createToken}>Create Token</button>
    </div>
  );
}