import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold mb-4">Meme Coin Launcher</h1>
      <nav>
        <ul>
          <li><Link href="/create-token">Create Token</Link></li>
          <li><Link href="/generate-image">Generate Image</Link></li>
          <li><Link href="/launch-project">Launch Project</Link></li>
        </ul>
      </nav>
    </div>
  );
}