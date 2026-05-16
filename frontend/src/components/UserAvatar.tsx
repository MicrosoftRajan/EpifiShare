import Image from 'next/image';
import type { UserProfile } from '@/lib/types';

type Props = {
  user: UserProfile;
  size?: number;
  className?: string;
  onClick?: () => void;
  title?: string;
};

export default function UserAvatar({
  user,
  size = 40,
  className = '',
  onClick,
  title,
}: Props) {
  const image = (
    <Image
      src={user.avatar}
      alt={user.email}
      width={size}
      height={size}
      unoptimized
      className={`rounded-full border-2 border-red-500 bg-zinc-100 object-cover transition-transform ${
        onClick ? 'hover:scale-105 hover:ring-2 hover:ring-red-400' : ''
      } ${className}`}
    />
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title || 'Click to logout'}
        className="cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label="Logout"
      >
        {image}
      </button>
    );
  }

  return <div title={title || user.email}>{image}</div>;
}
