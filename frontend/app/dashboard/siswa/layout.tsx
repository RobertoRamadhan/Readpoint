import type { ReactNode } from 'react';
import styles from './siswa-layout.module.css';

export default function SiswaDashboardLayout({ children }: { children: ReactNode }) {
  return <div className={styles.siswaArea}>{children}</div>;
}
