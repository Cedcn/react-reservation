/** @jsx jsx */
import { jsx } from '@emotion/core'
import React from 'react'
import moment from 'moment'
import { map } from 'lodash'
import cx from 'classnames'
import { find, get, isNil } from 'lodash'
import { gainDateTimeRange, gainCellCls, WeekDay, formatTimeRange, isNotCheckedFun, isPastFun } from '../utils'
import TimeBucketCellStatus from './CellStatus'
import ReservationCell from '../ReservationCell'
import { TimeBucketTableProps } from './TimeBucketTable'
import comss from '../styles'
import styles from '../styles/timeBucket'

export interface TimeBucketTbodyProps extends TimeBucketTableProps {
  width?: number
}

const MAX_SHOW_QUOTA = 99
const TimeBucketTbody: React.FC<TimeBucketTbodyProps> = (props) => {
  const {
    value,
    weekDays,
    ranges,
    prefixCls,
    disabledWeeks,
    specifiedDays,
    disabledDays,
    startDay,
    endDay,
    width,
    onChange,
    quotas,
    advance,
  } = props

  return (
    <div className={`${prefixCls}-tbody`} style={{ width }} css={comss.tbody}>
      {map(ranges, (timeRange, index) => {
        return (
          <div role="row" key={index} className={`${prefixCls}-tr`} css={comss.tr}>
            <div
              key="column"
              className={cx(`${prefixCls}-td`, `${prefixCls}-column-cell`)}
              css={[comss.td, styles.column]}
            >
              <span className={`${prefixCls}-td-inner`}>{formatTimeRange(timeRange)}</span>
            </div>
            {map(weekDays, (day: WeekDay, tdIndex) => {
              const current = day.date
              const [startDateTime, endDateTime] = gainDateTimeRange(current, timeRange)

              const currentQuota = find(
                quotas,
                (quota) =>
                  startDateTime.isSame(moment(quota.start), 'minute') && endDateTime.isSame(moment(quota.end), 'minute')
              )
              const isBeforeStartDayMinute = endDateTime.isBefore(startDay, 'minute')
              const isAfterEndDayMinute = !!endDay && endDateTime.isAfter(endDay, 'minute')
              
              const remaining = get(currentQuota, 'remaining')
              const isNotChecked = isNotCheckedFun(current, { specifiedDays, disabledWeeks, disabledDays })
              const isPast = isPastFun(startDateTime, advance)

              const isSelectable = !isBeforeStartDayMinute && !isAfterEndDayMinute && !isNotChecked && !isPast
              const isMakefull = !isNil(remaining) && remaining <= 0
              const isALittleRemaining = !isNil(remaining) && remaining > 0 && remaining < MAX_SHOW_QUOTA
              const isDisabled = !isSelectable || isMakefull
              const isSelected =
                !isDisabled && startDateTime.isSame(value?.[0], 'minute') && endDateTime.isSame(value?.[1], 'minute')

              const status = {
                isMakefull,
                isSelectable,
                isNotChecked,
                isBeforeStartDayMinute,
                isAfterEndDayMinute,
                isSelected,
                isALittleRemaining,
              }

              return (
                <div
                  role="gridcell"
                  className={gainCellCls(`${prefixCls}-td`, status)}
                  key={tdIndex}
                  css={comss.td}
                  onClick={
                    isDisabled
                      ? undefined
                      : isSelected
                      ? onChange.bind(null, null)
                      : onChange.bind(null, [startDateTime, endDateTime])
                  }
                >
                  <ReservationCell className={`${prefixCls}-reservation-cell`} status={status}>
                    <TimeBucketCellStatus
                      isSelectable={isSelectable}
                      isSelected={isSelected}
                      isMakefull={isMakefull}
                      remaining={remaining}
                      remainingMaxThreshold={MAX_SHOW_QUOTA}
                    />
                  </ReservationCell>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default React.memo(TimeBucketTbody)
