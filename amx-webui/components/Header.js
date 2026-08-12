import Link from 'next/link';

const Header = () => {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link href="/test-api">
              API Test
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header; 