import arMessages from '../../messages/ar.json';

type Messages = typeof arMessages;
type Namespace = keyof Messages;

export function useTranslations<N extends Namespace>(namespace: N) {
  const section = arMessages[namespace] as Record<string, string>;

  return function t(key: string, defaultText?: string): string {
    if (section && section[key]) {
      return section[key];
    }
    return defaultText || key;
  };
}
