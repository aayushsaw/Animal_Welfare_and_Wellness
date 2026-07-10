import { useEffect } from 'react'

const SITE_NAME = 'Animal Welfare & Wellness'

/**
 * Sets the browser tab title for a page.
 * Format: "Page Title | Animal Welfare & Wellness"
 * Restores the default title on unmount.
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME
    return () => {
      document.title = previous
    }
  }, [title])
}
