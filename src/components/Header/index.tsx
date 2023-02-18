import Image from 'next/image';
import Link from 'next/link';
import commonStyles from '@/styles/common.module.scss';
import styles from '@/components/Header/header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <Image src="/logo.svg" alt="logo" width={238} height={26} />
      </Link>
    </header>
  );
}
