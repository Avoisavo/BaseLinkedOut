import { useState, useEffect } from 'react';
import { Address } from 'viem';
import { getPrimaryBasename, getBasenameAvatar } from '../lib/basenames';

export function useBasename(address: Address | undefined, chainId: number = 8453) {
  const [basename, setBasename] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setBasename(null);
      setAvatar(null);
      return;
    }

    let isMounted = true;

    async function fetchBasename() {
    if (!address) return;
      setIsLoading(true);
      try {
        const name = await getPrimaryBasename(address, chainId);
        if (isMounted) {
          setBasename(name);
          
          // If we have a name, try to get the avatar
          if (name) {
            const avatarUrl = await getBasenameAvatar(name, chainId);
            if (isMounted) {
              setAvatar(avatarUrl);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching basename:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchBasename();

    return () => {
      isMounted = false;
    };
  }, [address, chainId]);

  return { basename, avatar, isLoading };
}