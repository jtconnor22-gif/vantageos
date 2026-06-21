import { twMerge } from 'tailwind-merge'
import { clsx } from 'clsx'

const AVATAR_COLORS = [
  '#4F46E5',
  '#0EA5E9',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

interface AvatarProps {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  imageUrl?: string
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

export default function Avatar({ name, size = 'sm', className, imageUrl }: AvatarProps) {
  const sizeClass = SIZE_CLASSES[size]

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        className={twMerge(clsx('rounded-full object-cover', sizeClass), className)}
      />
    )
  }

  return (
    <div
      className={twMerge(
        clsx('rounded-full flex items-center justify-center font-semibold text-white shrink-0', sizeClass),
        className
      )}
      style={{ backgroundColor: avatarColor(name) }}
      title={name}
    >
      {getInitials(name)}
    </div>
  )
}
