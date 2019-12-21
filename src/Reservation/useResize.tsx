import { useState, useEffect, useCallback } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { get } from 'lodash'

const useResize = (): [(instance: any) => void, number] => {
  const [width, setWidth] = useState(0)
  const config = { attributes: false, childList: true, subtree: true }
  let current: HTMLElement

  const resizeHandler = () => {
    const nWidth = get(current, 'clientWidth', 0)
    if (nWidth !== width) {
      setWidth(nWidth)
    }
  }

  const mutObserver = typeof MutationObserver !== 'undefined' ? new MutationObserver(resizeHandler) : undefined
  const [resizeObserver] = useState(() => new ResizeObserver(resizeHandler))

  const ref = useCallback(
    (node) => {
      current = node
      mutObserver?.disconnect()
      resizeObserver.disconnect()
      if (current) {
        mutObserver?.observe(current, config)
        resizeObserver.observe(current)
      }
    },
    [mutObserver, resizeObserver]
  )

  useEffect(() => {
    resizeHandler()
    const w = window
    w.addEventListener('resize', resizeHandler)

    return () => {
      w.removeEventListener('resize', resizeHandler)
    }
  }, [0])

  return [ref, width]
}

export default useResize