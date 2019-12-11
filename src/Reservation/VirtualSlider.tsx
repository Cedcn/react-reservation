import React, { useState, useEffect } from 'react'
import { usePrevious } from 'react-use'
import { isFunction, isNil, isEqual } from 'lodash'
import { swipeStart as swipeStartUtil, swipeMove as swipeMoveUtil, swipeEnd as swipeEndUtil } from './inner-slider'
import useMergeState from './useMergeState'

interface TimeBucketsSliderProps {
  idx: number
  className?: string
  children?: (options: { displayIdxs: number[] }) => React.ReactNode
  toNext: () => boolean
  toLast: () => boolean
  width: number
}

export interface SliderState {
  dragging: boolean
  touchObject: any
  swiping: boolean
  swipeLeft: null | number
  animating: boolean
  position: number
  transition: string
}

const gainDislayIdxs = (idx: number) => {
  return [idx - 1, idx, idx + 1]
}

const SPEED = 300
const VirtualSlider: React.FC<TimeBucketsSliderProps> = (props) => {
  const { className, idx, width, children, toNext, toLast } = props
  const [displayIdxs, setDisplayIdxs] = useState<any>(gainDislayIdxs(idx))
  const [scrolling, setScrolling] = useState<boolean>(false)
  let clickable = true

  useEffect(() => {
    let scrollingTimeout: any

    const handleScrollEnd = () => {
      setScrolling(false)
    }

    const handleScroll = () => {
      setScrolling(true)
      clearTimeout(scrollingTimeout)
      scrollingTimeout = setTimeout(() => handleScrollEnd(), 150)
    }

    window.document.addEventListener('scroll', handleScroll, false)
    return () => {
      window.document.removeEventListener('scroll', handleScroll, false)
    }
  }, [0])

  const [sliderState, setSliderState] = useMergeState<SliderState>({
    dragging: false,
    touchObject: { startX: 0, startY: 0, curX: 0, curY: 0 },
    swiping: false,
    swipeLeft: null,
    animating: false,
    position: -width,
    transition: 'none',
  })

  const prevIdx = usePrevious(idx)
  const swipeStart = (e: any) => {
    let state = swipeStartUtil(e)
    setSliderState(state)
  }

  const swipeMove = (e: any) => {
    let state = swipeMoveUtil<SliderState>(e, { ...sliderState, scrolling })
    if (!state) return

    if (state.swiping) {
      clickable = false
    }
    setSliderState(state)
  }

  const swipeEnd = (e: any) => {
    let swipeAfterObj = {}
    let state = swipeEndUtil<SliderState>(e, {
      ...sliderState,
      touchThreshold: width / 5,
      onSwipe: (dir: any) => {
        let result = false
        if (dir === 'left') {
          result = !!toNext()
        }
        if (dir === 'right') {
          result = !!toLast()
        }

        if (result) {
          const position = dir === 'right' ? 0 : -width * 2
          swipeAfterObj = { position, animating: true }
        }
      },
    })
    if (!state) return

    setSliderState({ ...state, ...swipeAfterObj, transition: `all ${SPEED}ms` })
  }

  const clickHandler = (e: any) => {
    if (clickable === false) {
      e.stopPropagation()
      e.preventDefault()
    }

    clickable = true
  }

  let listProps = {
    onClickCapture: clickHandler,
    onTouchStart: swipeStart,
    onTouchMove: sliderState.dragging ? swipeMove : undefined,
    onTouchEnd: swipeEnd,
    onTouchCancel: sliderState.dragging ? swipeEnd : undefined,
  }

  let timer: any
  useEffect(() => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      setDisplayIdxs(gainDislayIdxs(idx))
      setSliderState({ position: -width, transition: 'none', animating: false })
      clearTimeout(timer)
    }, SPEED)

    if (!isNil(prevIdx)) {
      const position = prevIdx > idx ? 0 : -width * 2
      const newSliderState = {
        ...sliderState,
        position,
        transition: `all ${SPEED}ms`,
        animating: true,
      }
      if (!isEqual(newSliderState, sliderState)) {
        setSliderState(newSliderState)
      }
    }
    return () => clearTimeout(timer)
  }, [idx, width])

  useEffect(() => {
    setSliderState({ position: -width, transition: 'none', animating: false })
  }, [width])

  const style = {
    transform: `translate3d(${sliderState.position + Number(sliderState.swipeLeft)}px, 0px, 0px)`,
    WebkitTransform: `-webkit-translate3d(${sliderState.position + Number(sliderState.swipeLeft)}px, 0px, 0px)`,
    transition: isNil(sliderState.swipeLeft) ? sliderState.transition : undefined,
    WebkitTransition: isNil(sliderState.swipeLeft) ? sliderState.transition : undefined,
  }

  return (
    <div className={className} style={{ ...style, width: width * 3, display: 'flex' }} {...listProps}>
      {isFunction(children) ? children({ displayIdxs }) : children}
    </div>
  )
}

export default VirtualSlider
