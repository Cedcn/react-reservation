/** @jsx jsx */
import { jsx } from '@emotion/core'
import React, { useMemo } from 'react'
import useResize from '../useResize'
import { map } from 'lodash'
import CalendarTHead from './CalendarTHead'
import CalendarTBody from './CalendarTBody'
import VirtualSlider from '../VirtualSlider'
import { CalendarTableCommonProps } from '../interface'
import { gainMonthDays } from '../utils'
import styles from '../styles'

export interface CalendarTableProps extends CalendarTableCommonProps {}
const CalendarList: React.FC<any> = (props) => {
  const {
    displayIdxs,
    prefixCls,
    value,
    width,
    startDay,
    toNext,
    toLast,
    availableWeeks,
    availableDays,
    onChange,
    endDay,
    currentMonthIdx,
  } = props

  const child = useMemo(
    () =>
      map(displayIdxs, (idx) => {
        const { monthDays, firstMonthDay, lastMonthDay } = gainMonthDays(startDay, idx)
        const key = firstMonthDay.format()
        const tBodyProps = {
          prefixCls,
          startDay,
          endDay,
          currentMonthIdx,
          availableWeeks,
          availableDays,
          monthDays,
          toNext,
          toLast,
          onChange,
          firstMonthDay,
          lastMonthDay,
          width,
          value,
        }

        return <CalendarTBody key={key} {...tBodyProps} />
      }),
    [displayIdxs, prefixCls, value && value.format(), width, availableWeeks, onChange]
  )

  return <React.Fragment>{child}</React.Fragment>
}

const CalendarTable: React.FC<CalendarTableProps> = (props) => {
  const {
    prefixCls,
    value,
    toNext,
    startDay,
    endDay,
    currentMonthIdx,
    toLast,
    availableDays,
    availableWeeks,
    onChange,
  } = props
  const [viewEl, width] = useResize()

  return (
    <div className={`${prefixCls}-table`} css={styles.table}>
      <CalendarTHead prefixCls={prefixCls} value={value} />
      <div className={`${prefixCls}-tbody-viewer`} css={styles.tbodyViewer} ref={viewEl}>
        {!!width && (
          <VirtualSlider
            className={`${prefixCls}-tbody-list`}
            width={width}
            idx={currentMonthIdx}
            toNext={toNext}
            toLast={toLast}
          >
            {({ displayIdxs }) => (
              <CalendarList
                displayIdxs={displayIdxs}
                startDay={startDay}
                endDay={endDay}
                availableWeeks={availableWeeks}
                availableDays={availableDays}
                onChange={onChange}
                value={value}
                width={width}
                prefixCls={prefixCls}
              />
            )}
          </VirtualSlider>
        )}
      </div>
    </div>
  )
}

export default CalendarTable
