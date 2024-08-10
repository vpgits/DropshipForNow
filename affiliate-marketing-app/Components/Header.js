import Link from 'next/link';

const Header = () => (
  <header>
    <nav>
      <Link href="/">Home</Link>
      <Link href="/profile">Profile</Link>
      <Link href="/skills">Skills</Link>
      <Link href="/job-matching">Job Matching</Link>
    </nav>
  </header>
);

export default Header;