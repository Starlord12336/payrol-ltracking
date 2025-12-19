import Image from 'next/image';
import Link from 'next/link';
import s from './page.module.css';


export default function NotFound() {
  return (
    <div className={s.container}>
      <h1 className={s.header}>404 - Page Not Found</h1>
      <div className="max-w-2xl text-center">
      </div>
      <Image
        src="/error.gif"
        alt="404 Error Animation"
        width={450}
        height={400}
        className={s.errorImage}
        unoptimized
      />
      <div className={s.description}>
        <p className={s.description}>The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className={s.button}>
          Return Home
        </Link>
      </div>
    </div>
  );
}

/*https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/giphy.gif */